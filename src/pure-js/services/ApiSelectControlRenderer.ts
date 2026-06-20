import { IApiRequestParams, IApiSelectConfig, IApiSelectItem } from '../../core/types/form';
import { ApiSelectUseCase } from '../../core/use-cases/ApiSelectUseCase';
import {
  extractApiSelectItemsFromValue,
  extractApiSelectValueIds,
  hasApiSelectValue,
  normalizeApiSelectInitialValue,
  removeApiSelectItemById,
  toApiSelectStoredValue,
  type TApiSelectStoredValue,
} from '../../utils/apiSelectValueHelpers';
import {
  clearApiSelectDebounceTimer,
  resolveApiSelectDebounceMs,
  scheduleApiSelectSearch,
  type IApiSelectDebounceTimerRef,
} from '../../utils/apiSelectSearchDebounce';
import { CSS_CLASSES } from '../../utils/constants';
import { getIconHTML } from '../../shared/icons/sprite';

export interface IApiSelectControlOptions {
  fieldName: string;
  label: string;
  rules?: Array<{ type: string; message?: string; value?: any }>;
  errors?: Record<string, string[]>;
  config?: IApiSelectConfig;
  value?: unknown;
  apiSelectUseCase: ApiSelectUseCase;
  onChange?: (value: unknown) => void;
}

export type IApiSelectControlConfig = IApiSelectControlOptions;

export class ApiSelectControlRenderer {
  private fieldName: string;
  private label: string;
  private rules: Array<{ type: string; message?: string; value?: any }>;
  private errors: Record<string, string[]>;
  private config: IApiSelectConfig;
  private value: TApiSelectStoredValue;
  private onChange?: (value: unknown) => void;
  private knownItems = new Map<string | number, IApiSelectItem>();
  private container?: HTMLElement;
  private searchInputElement?: HTMLInputElement;
  private dropdownElement?: HTMLElement;
  private searchElement?: HTMLElement;

  private searchQuery = '';
  private items: IApiSelectItem[] = [];
  private selectedItems: IApiSelectItem[] = [];
  private loading = false;
  private error: string | null = null;
  private isDropdownOpen = false;
  private currentPage = 1;
  private hasMore = false;
  private readonly debounceTimer: IApiSelectDebounceTimerRef = { current: null };

  private apiSelectUseCase: ApiSelectUseCase;

  private handleClickOutsideBound = this.handleClickOutside.bind(this);
  private handleResizeBound = this.handleResize.bind(this);
  private handleScrollBound = this.handleScroll.bind(this);
  private shouldRestoreScroll = false;

  constructor(options: IApiSelectControlOptions) {
    this.fieldName = options.fieldName;
    this.label = options.label;
    this.rules = options.rules || [];
    this.errors = options.errors || {};
    this.config = options.config || { url: '' };
    this.value = normalizeApiSelectInitialValue(options.value, this.config.multiple ?? false);
    this.apiSelectUseCase = options.apiSelectUseCase;
    this.onChange = options.onChange;
  }

  private isRequired(): boolean {
    return this.rules.some(rule => rule.type === 'required');
  }

  private isMultiple(): boolean {
    return this.config.multiple ?? false;
  }

  private hasValue(): boolean {
    return hasApiSelectValue(this.value, this.isMultiple());
  }

  private isSelected(id: string | number): boolean {
    return extractApiSelectValueIds(this.value).includes(id);
  }

  private resolveItemById(id: string | number): IApiSelectItem | undefined {
    return (
      this.knownItems.get(id) ??
      this.items.find(item => item.id === id) ??
      this.selectedItems.find(item => item.id === id)
    );
  }

  private hydrateSelectedItemsFromValue(value: unknown): void {
    const nextSelection = extractApiSelectItemsFromValue(value);

    nextSelection.forEach(item => {
      this.knownItems.set(item.id, item);
    });

    const isSameSelection =
      this.selectedItems.length === nextSelection.length &&
      this.selectedItems.every(
        (item, index) =>
          item.id === nextSelection[index]?.id && item.name === nextSelection[index]?.name
      );

    if (!isSameSelection) {
      this.selectedItems = nextSelection;
    }
  }

  private clearSearchQuery(): void {
    this.searchQuery = '';

    if (this.searchInputElement) {
      this.searchInputElement.value = '';
    }
  }

  private shouldShowSelectedValue(): boolean {
    return !this.isMultiple() && !this.isDropdownOpen && Boolean(this.selectedItems[0]);
  }

  private shouldShowClosedPlaceholder(): boolean {
    return !this.isDropdownOpen && !this.shouldShowSelectedValue();
  }

  private updateSearchFieldUI(focusInput = false): void {
    if (!this.container) {
      return;
    }

    const fieldElement = this.container.querySelector(
      `[data-api-select-field]`
    ) as HTMLElement | null;

    if (!fieldElement) {
      return;
    }

    const showSelectedValue = this.shouldShowSelectedValue();
    const showClosedPlaceholder = this.shouldShowClosedPlaceholder();
    const showInput = this.isDropdownOpen;
    const placeholder = this.config.placeholder ?? 'Начните вводить для поиска...';
    const selectedName = this.selectedItems[0]?.name ?? '';

    let valueElement = fieldElement.querySelector(
      `[data-api-select-value]`
    ) as HTMLElement | null;

    if (!valueElement) {
      valueElement = document.createElement('span');
      valueElement.className = CSS_CLASSES.BB_API_SELECT_VALUE;
      valueElement.dataset.apiSelectValue = '';
      fieldElement.prepend(valueElement);
    }

    valueElement.textContent = selectedName;
    valueElement.classList.toggle(CSS_CLASSES.BB_API_SELECT_VALUE_HIDDEN, !showSelectedValue);

    let placeholderElement = fieldElement.querySelector(
      `[data-api-select-trigger-placeholder]`
    ) as HTMLElement | null;

    if (!placeholderElement) {
      placeholderElement = document.createElement('span');
      placeholderElement.className = CSS_CLASSES.BB_API_SELECT_TRIGGER_PLACEHOLDER;
      placeholderElement.dataset.apiSelectTriggerPlaceholder = '';
      fieldElement.append(placeholderElement);
    }

    placeholderElement.textContent = placeholder;
    placeholderElement.classList.toggle(
      CSS_CLASSES.BB_API_SELECT_TRIGGER_PLACEHOLDER_HIDDEN,
      !showClosedPlaceholder
    );

    if (this.searchInputElement) {
      this.searchInputElement.classList.toggle(
        CSS_CLASSES.BB_API_SELECT_INPUT_HIDDEN,
        !showInput
      );
      this.searchInputElement.value = this.searchQuery;
      this.searchInputElement.placeholder = placeholder;

      if (showInput && focusInput) {
        this.searchInputElement.focus();
      }
    }
  }

  private getDropdownItems(): IApiSelectItem[] {
    const map = new Map<string | number, IApiSelectItem>();
    this.items.forEach(item => {
      map.set(item.id, item);
    });
    this.selectedItems.forEach(item => {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    });

    return Array.from(map.values());
  }

  private async fetchData(reset = false): Promise<void> {
    if (!this.config.url) {
      this.error = 'URL API не указан';
      return;
    }

    const minSearchLength = this.config.minSearchLength ?? 0;
    if (this.searchQuery.length < minSearchLength && this.searchQuery.length > 0) {
      return;
    }

    if (reset) {
      this.currentPage = 1;
      this.shouldRestoreScroll = false;
    } else {
      this.shouldRestoreScroll = true;
    }

    this.loading = true;
    this.error = null;

    this.updateLoadingState();

    try {
      const params: IApiRequestParams = {
        search: this.searchQuery || undefined,
        page: this.currentPage,
        limit: this.config.limit || 20,
      };

      const response = await this.apiSelectUseCase.fetchItems(this.config, params);

      this.items = reset ? response.data : [...this.items, ...response.data];
      response.data.forEach(item => {
        this.knownItems.set(item.id, item);
      });
      this.hydrateSelectedItemsFromValue(this.value);
      this.hasMore = response.hasMore ?? false;
    } catch (error: any) {
      this.error = error.message || (this.config.errorText ?? 'Ошибка загрузки данных');
      this.items = [];
    } finally {
      this.loading = false;
      this.updateDropdownContent();
    }
  }

  private onSearchInput(searchValue: string): void {
    this.searchQuery = searchValue;

    const debounceMs = resolveApiSelectDebounceMs(this.config.debounceMs);
    scheduleApiSelectSearch(this.debounceTimer, debounceMs, () => {
      void this.fetchData(true).then(() => {
        if (!this.isDropdownOpen) {
          this.openDropdown();
        } else {
          this.updateDropdownPosition();
        }
      });
    });
  }

  private openDropdown(): void {
    if (!this.isDropdownOpen) {
      this.isDropdownOpen = true;
      this.shouldRestoreScroll = false;
      this.clearSearchQuery();
      this.updateDropdownContent();

      this.currentPage = 1;
      void this.fetchData(true).then(() => {
        this.updateSearchFieldUI(true);
      });
    }
  }

  private toggleDropdown(): void {
    if (this.isDropdownOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  private closeDropdown(): void {
    this.isDropdownOpen = false;
    this.shouldRestoreScroll = false;

    this.clearSearchQuery();
    this.updateDropdownContent();
  }

  private handleClickOutside(event: MouseEvent): void {
    if (!this.isDropdownOpen) {
      return;
    }

    const target = event.target as HTMLElement;

    const isClickInContainer = this.container?.contains(target) ?? false;
    const isClickInDropdown = this.dropdownElement?.contains(target) ?? false;

    if (!isClickInContainer && !isClickInDropdown) {
      this.closeDropdown();
    }
  }

  private selectItem(item: IApiSelectItem): void {
    this.knownItems.set(item.id, item);

    if (this.isMultiple()) {
      const currentIds = extractApiSelectValueIds(this.value);
      const dropdownValue = currentIds.includes(item.id)
        ? currentIds.filter(id => id !== item.id)
        : [...currentIds, item.id];

      this.value = toApiSelectStoredValue(dropdownValue, true, id => this.resolveItemById(id));
      this.hydrateSelectedItemsFromValue(this.value);
      this.updateHiddenInput();
      this.updateDropdownContent();
      this.emitChange();
      return;
    }

    this.value = toApiSelectStoredValue(item.id, false, id => this.resolveItemById(id));
    this.hydrateSelectedItemsFromValue(this.value);
    this.clearSearchQuery();
    this.updateHiddenInput();
    this.emitChange();
    this.closeDropdown();
  }

  private removeItem(id: string | number): void {
    if (!this.isMultiple()) {
      return;
    }

    this.value = removeApiSelectItemById(this.value, id);
    this.hydrateSelectedItemsFromValue(this.value);
    this.updateHiddenInput();
    this.emitChange();
    this.updateDropdownContent();
  }

  private clearSelection(): void {
    if (this.isMultiple()) {
      this.value = [];
      this.selectedItems = [];
    } else {
      this.value = null;
      this.selectedItems = [];
      this.searchQuery = '';
      if (this.searchInputElement) {
        this.searchInputElement.value = '';
      }
    }

    this.updateHiddenInput();
    this.emitChange();

    if (this.config.url && this.isDropdownOpen) {
      this.fetchData(true);
    } else {
      this.updateDropdownContent();
    }
  }

  private loadMore(): void {
    if (!this.hasMore || this.loading) {
      return;
    }
    this.currentPage += 1;
    this.fetchData(false).then(() => {
      this.updateDropdownPosition();
    });
  }

  private emitChange(): void {
    if (this.onChange) {
      this.onChange(this.value);
    }
  }

  private serializeStoredValue(): string {
    if (this.value === null || this.value === undefined || this.value === '') {
      return '';
    }

    if (typeof this.value === 'object') {
      return JSON.stringify(this.value);
    }

    return String(this.value);
  }

  private updateLoadingState(): void {
    if (!this.container) {
      return;
    }

    const wrapper = this.container.querySelector(`.${CSS_CLASSES.BB_API_SELECT_SEARCH}`);
    if (!wrapper) {
      return;
    }

    const oldLoader = wrapper.querySelector(`.${CSS_CLASSES.BB_API_SELECT_LOADER}`);
    const oldClear = wrapper.querySelector(`.${CSS_CLASSES.BB_API_SELECT_CLEAR}`);

    if (oldLoader) {
      oldLoader.remove();
    }
    if (oldClear) {
      oldClear.remove();
    }

    const toggleButton = wrapper.querySelector(`.${CSS_CLASSES.BB_API_SELECT_TOGGLE}`);

    if (!toggleButton) {
      return;
    }
    if (this.loading) {
      const loader = document.createElement('span');
      loader.className = CSS_CLASSES.BB_API_SELECT_LOADER;
      loader.innerHTML = getIconHTML('loader', 14, 'bb-icon--spin');
      toggleButton.before(loader);
    } else if (this.hasValue()) {
      const clear = document.createElement('span');
      clear.className = CSS_CLASSES.BB_API_SELECT_CLEAR;
      clear.innerHTML = getIconHTML('close', 14);
      clear.dataset.apiSelectClear = '';
      toggleButton.before(clear);
    }
  }

  private updateDropdownContent(): void {
    if (!this.container) {
      return;
    }

    let savedScrollTop = 0;
    let savedScrollHeight = 0;
    if (this.shouldRestoreScroll && this.dropdownElement) {
      savedScrollTop = this.dropdownElement.scrollTop;
      savedScrollHeight = this.dropdownElement.scrollHeight;
    }

    if (this.dropdownElement && this.dropdownElement.parentNode) {
      this.dropdownElement.remove();
      this.dropdownElement = undefined;
    }

    this.updateLoadingState();

    const searchElement = this.container.querySelector(
      `.${CSS_CLASSES.BB_API_SELECT_SEARCH}`
    ) as HTMLElement;
    if (searchElement) {
      if (this.isDropdownOpen) {
        searchElement.classList.add(CSS_CLASSES.BB_API_SELECT_SEARCH_OPEN);
      } else {
        searchElement.classList.remove(CSS_CLASSES.BB_API_SELECT_SEARCH_OPEN);
      }
    }

    this.updateSearchFieldUI();

    const clearButton = this.container.querySelector('[data-api-select-clear]');
    if (clearButton) {
      const newClearButton = clearButton.cloneNode(true) as HTMLElement;
      clearButton.parentNode?.replaceChild(newClearButton, clearButton);

      newClearButton.addEventListener('click', e => {
        e.stopPropagation();
        e.preventDefault();
        this.clearSelection();
      });
    }

    if (this.isDropdownOpen) {
      const dropdown = this.createDropdownElement();
      this.dropdownElement = dropdown;
      document.body.append(dropdown);
      this.updateDropdownPosition();
      this.attachDropdownEvents(dropdown);

      const newHeight = dropdown.scrollHeight;
      if (this.shouldRestoreScroll && savedScrollHeight > 0) {
        const delta = Math.max(0, newHeight - savedScrollHeight);
        const distanceFromBottomPrev = savedScrollHeight - (savedScrollTop + dropdown.clientHeight);
        const wasNearBottom = distanceFromBottomPrev >= 0 && distanceFromBottomPrev <= 48;
        const targetTop = wasNearBottom ? savedScrollTop + delta : savedScrollTop;
        dropdown.scrollTop = Math.max(0, targetTop);
      } else {
        dropdown.scrollTop = 0;
      }
    }

    this.updateSelectedTags();
  }

  private updateDropdownPosition(): void {
    if (!this.container || !this.dropdownElement) {
      return;
    }

    const searchElement = this.container.querySelector(
      `.${CSS_CLASSES.BB_API_SELECT_SEARCH}`
    ) as HTMLElement;
    if (!searchElement) {
      return;
    }

    this.searchElement = searchElement;

    const dropdownEl = this.dropdownElement;
    const rect = searchElement.getBoundingClientRect();

    const spaceBelow = Math.max(0, window.innerHeight - rect.bottom);
    const spaceAbove = Math.max(0, rect.top);
    const viewportMargin = 8;
    const shouldShowAbove = spaceBelow < spaceAbove;
    const availableSpace = (shouldShowAbove ? spaceAbove : spaceBelow) - viewportMargin;
    const constrainedSpace = Math.max(120, availableSpace);

    dropdownEl.style.left = `${rect.left}px`;
    dropdownEl.style.width = `${rect.width}px`;
    // Учитываем CSS max-height, чтобы инлайн-стиль не превышал заданный в стилях
    const computed = window.getComputedStyle(dropdownEl);
    const cssMax =
      computed.maxHeight === 'none'
        ? Number.POSITIVE_INFINITY
        : Number.parseFloat(computed.maxHeight || '0');
    const effectiveMax = Math.min(
      constrainedSpace,
      Number.isFinite(cssMax) ? cssMax : constrainedSpace
    );
    dropdownEl.style.maxHeight = `${effectiveMax}px`;

    const dropdownHeight = Math.min(dropdownEl.scrollHeight, effectiveMax);

    let top = shouldShowAbove
      ? rect.top - dropdownHeight - viewportMargin
      : rect.bottom + viewportMargin;

    const maxTop = window.innerHeight - dropdownHeight - viewportMargin;
    const minTop = viewportMargin;
    top = Math.max(minTop, Math.min(maxTop, top));

    dropdownEl.style.top = `${top}px`;
  }

  private handleResize(): void {
    if (this.isDropdownOpen) {
      this.updateDropdownPosition();
    }
  }

  private handleScroll(): void {
    if (this.isDropdownOpen) {
      this.updateDropdownPosition();
    }
  }

  private createDropdownElement(): HTMLElement {
    const loadingText = this.config.loadingText ?? 'Загрузка...';
    const noResultsText = this.config.noResultsText ?? 'Ничего не найдено';

    const dropdown = document.createElement('div');
    dropdown.className = CSS_CLASSES.BB_API_SELECT_DROPDOWN;

    if (this.loading) {
      dropdown.innerHTML = `<div class="${CSS_CLASSES.BB_API_SELECT_MESSAGE}">${loadingText}</div>`;
    } else if (this.error) {
      dropdown.innerHTML = `<div class="${CSS_CLASSES.BB_API_SELECT_MESSAGE} ${CSS_CLASSES.BB_API_SELECT_MESSAGE_ERROR}">${this.error}</div>`;
    } else if (this.getDropdownItems().length > 0) {
      const list = document.createElement('div');
      list.className = CSS_CLASSES.BB_API_SELECT_LIST;

      this.getDropdownItems().forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = `${CSS_CLASSES.BB_API_SELECT_ITEM} ${this.isSelected(item.id) ? CSS_CLASSES.BB_API_SELECT_ITEM_SELECTED : ''}`;
        itemEl.dataset.apiSelectItem = '';
        itemEl.dataset.itemId = String(item.id);
        itemEl.dataset.itemName = item.name;
        itemEl.innerHTML = `
        <span class="${CSS_CLASSES.BB_API_SELECT_ITEM_NAME}">${item.name}</span>
        ${this.isSelected(item.id) ? `<span class="${CSS_CLASSES.BB_API_SELECT_ITEM_CHECK}">${getIconHTML('check', 14)}</span>` : ''}
      `;
        list.append(itemEl);
      });

      if (this.hasMore) {
        const loadMore = document.createElement('div');
        loadMore.className = CSS_CLASSES.BB_API_SELECT_LOAD_MORE;
        loadMore.dataset.apiSelectLoadMore = '';
        loadMore.textContent = 'Загрузить ещё...';
        list.append(loadMore);
      }

      dropdown.append(list);
    } else {
      dropdown.innerHTML = `<div class="${CSS_CLASSES.BB_API_SELECT_MESSAGE}">${noResultsText}</div>`;
    }

    return dropdown;
  }

  private attachDropdownEvents(dropdown: HTMLElement): void {
    dropdown.addEventListener(
      'mousedown',
      e => {
        e.stopPropagation();
      },
      true
    );

    const items = dropdown.querySelectorAll('[data-api-select-item]');
    items.forEach(itemEl => {
      itemEl.addEventListener('click', e => {
        e.stopPropagation();
        e.preventDefault();
        const idStr = (itemEl as HTMLElement).dataset.itemId;
        if (!idStr) {
          return;
        }
        const originalItem = this.items.find(item => String(item.id) === idStr);
        if (originalItem) {
          this.selectItem(originalItem);
        }
      });
    });

    const loadMoreButton = dropdown.querySelector('[data-api-select-load-more]');
    if (loadMoreButton) {
      loadMoreButton.addEventListener('click', e => {
        e.stopPropagation();
        e.preventDefault();
        this.loadMore();
      });
    }
  }

  private updateHiddenInput(): void {
    if (!this.container) {
      return;
    }

    const hiddenInput = this.container.querySelector(
      `input[type="hidden"][name="${this.fieldName}"]`
    ) as HTMLInputElement;
    if (hiddenInput) {
      hiddenInput.value = this.serializeStoredValue();
    }
  }

  private updateSelectedTags(): void {
    if (!this.container) {
      return;
    }

    const oldTags = this.container.querySelector(`.${CSS_CLASSES.BB_API_SELECT_SELECTED}`);
    if (oldTags) {
      oldTags.remove();
    }

    if (this.isMultiple() && this.selectedItems.length > 0) {
      const wrapper = this.container.querySelector(`.${CSS_CLASSES.BB_API_SELECT_WRAPPER}`);
      if (!wrapper) {
        return;
      }

      const tagsContainer = document.createElement('div');
      tagsContainer.className = CSS_CLASSES.BB_API_SELECT_SELECTED;

      this.selectedItems.forEach(item => {
        const tag = document.createElement('div');
        tag.className = CSS_CLASSES.BB_API_SELECT_TAG;
        tag.innerHTML = `
        <span class="${CSS_CLASSES.BB_API_SELECT_TAG_NAME}">${item.name}</span>
        <span class="${CSS_CLASSES.BB_API_SELECT_TAG_REMOVE}" data-api-select-remove="${item.id}">${getIconHTML('close', 12)}</span>
      `;
        tagsContainer.append(tag);
      });

      wrapper.after(tagsContainer);

      this.attachRemoveTagEvents(this.container);
    }
  }

  render(container: HTMLElement): void {
    this.container = container;

    const placeholder = this.config.placeholder ?? 'Начните вводить для поиска...';
    const loadingText = this.config.loadingText ?? 'Загрузка...';
    const noResultsText = this.config.noResultsText ?? 'Ничего не найдено';

    const placeholderElement = container.querySelector(`.${CSS_CLASSES.API_SELECT_PLACEHOLDER}`);
    if (placeholderElement) {
      placeholderElement.outerHTML = `
      <div class="${CSS_CLASSES.BB_API_SELECT_WRAPPER}">
        <label class="${CSS_CLASSES.BB_API_SELECT_LABEL}">
          ${this.label}
          ${this.isRequired() ? `<span class="${CSS_CLASSES.BB_API_SELECT_REQUIRED}">*</span>` : ''}
        </label>
        ${this.generateControlHTML(placeholder, loadingText, noResultsText)}
      </div>
    `;
    } else {
      container.innerHTML = `
      <div class="${CSS_CLASSES.BB_API_SELECT_WRAPPER}">
        <label class="${CSS_CLASSES.BB_API_SELECT_LABEL}">
          ${this.label}
          ${this.isRequired() ? `<span class="${CSS_CLASSES.BB_API_SELECT_REQUIRED}">*</span>` : ''}
        </label>
        ${this.generateControlHTML(placeholder, loadingText, noResultsText)}
      </div>
    `;
    }
  }

  private generateControlHTML(
    placeholder: string,
    loadingText: string,
    noResultsText: string
  ): string {
    return `
      <div class="${CSS_CLASSES.BB_API_SELECT_WRAPPER}">
        <div class="${CSS_CLASSES.BB_API_SELECT_SEARCH} ${this.isDropdownOpen ? CSS_CLASSES.BB_API_SELECT_SEARCH_OPEN : ''}">
          <div class="${CSS_CLASSES.BB_API_SELECT_FIELD}" data-api-select-field>
            <span
              class="${CSS_CLASSES.BB_API_SELECT_VALUE} ${this.shouldShowSelectedValue() ? '' : CSS_CLASSES.BB_API_SELECT_VALUE_HIDDEN}"
              data-api-select-value
            >${this.selectedItems[0]?.name ?? ''}</span>
            <span
              class="${CSS_CLASSES.BB_API_SELECT_TRIGGER_PLACEHOLDER} ${this.shouldShowClosedPlaceholder() ? '' : CSS_CLASSES.BB_API_SELECT_TRIGGER_PLACEHOLDER_HIDDEN}"
              data-api-select-trigger-placeholder
            >${placeholder}</span>
            <input
              type="text"
              class="${CSS_CLASSES.BB_API_SELECT_INPUT} ${this.isDropdownOpen ? '' : CSS_CLASSES.BB_API_SELECT_INPUT_HIDDEN}"
              placeholder="${placeholder}"
              value="${this.searchQuery}"
              data-api-select-search
            />
          </div>
          ${this.loading ? `<span class="${CSS_CLASSES.BB_API_SELECT_LOADER}">${getIconHTML('loader', 14, 'bb-icon--spin')}</span>` : ''}
          ${!this.loading && this.hasValue() ? `<span class="${CSS_CLASSES.BB_API_SELECT_CLEAR}" data-api-select-clear>${getIconHTML('close', 14)}</span>` : ''}
          <button
            type="button"
            class="${CSS_CLASSES.BB_API_SELECT_TOGGLE} ${this.isDropdownOpen ? CSS_CLASSES.BB_API_SELECT_TOGGLE_OPEN : ''}"
            data-api-select-toggle
          >
            ${getIconHTML('chevronDown', 12)}
          </button>
        </div>

        ${
          this.isDropdownOpen
            ? `
          <div class="${CSS_CLASSES.BB_API_SELECT_DROPDOWN}">
            ${
              this.loading
                ? `<div class="${CSS_CLASSES.BB_API_SELECT_MESSAGE}">${loadingText}</div>`
                : this.error
                  ? `<div class="${CSS_CLASSES.BB_API_SELECT_MESSAGE} ${CSS_CLASSES.BB_API_SELECT_MESSAGE_ERROR}">${this.error}</div>`
                  : this.getDropdownItems().length > 0
                    ? `
                <div class="${CSS_CLASSES.BB_API_SELECT_LIST}">
                  ${this.getDropdownItems()
                    .map(
                      item => `
                    <div class="${CSS_CLASSES.BB_API_SELECT_ITEM} ${this.isSelected(item.id) ? CSS_CLASSES.BB_API_SELECT_ITEM_SELECTED : ''}" data-api-select-item data-item-id="${item.id}" data-item-name="${item.name}">
                      <span class="${CSS_CLASSES.BB_API_SELECT_ITEM_NAME}">${item.name}</span>
                      ${this.isSelected(item.id) ? `<span class="${CSS_CLASSES.BB_API_SELECT_ITEM_CHECK}">${getIconHTML('check', 14)}</span>` : ''}
                    </div>
                  `
                    )
                    .join('')}
                  ${
                    this.hasMore
                      ? `<div class="${CSS_CLASSES.BB_API_SELECT_LOAD_MORE}" data-api-select-load-more>Загрузить еще...</div>`
                      : ''
                  }
                </div>
              `
                    : `<div class="${CSS_CLASSES.BB_API_SELECT_MESSAGE}">${noResultsText}</div>`
            }
          </div>
        `
            : ''
        }
      </div>

      ${
        this.isMultiple() && this.selectedItems.length > 0
          ? `
        <div class="${CSS_CLASSES.BB_API_SELECT_SELECTED}">
          ${this.selectedItems
            .map(
              item => `
            <div class="${CSS_CLASSES.BB_API_SELECT_TAG}">
              <span class="${CSS_CLASSES.BB_API_SELECT_TAG_NAME}">${item.name}</span>
              <span class="${CSS_CLASSES.BB_API_SELECT_TAG_REMOVE}" data-api-select-remove="${item.id}">${getIconHTML('close', 12)}</span>
            </div>
          `
            )
            .join('')}
        </div>
      `
          : ''
      }

      ${
        this.errors[this.fieldName]
          ? `<div class="${CSS_CLASSES.BB_API_SELECT_ERROR}">${this.errors[this.fieldName].join(', ')}</div>`
          : ''
      }

      <input type="hidden" name="${this.fieldName}" value="${this.serializeStoredValue()}" />
    </div>
  `;
  }

  private attachEvents(container: HTMLElement): void {
    const fieldElement = container.querySelector('[data-api-select-field]') as HTMLElement;
    if (fieldElement) {
      const newFieldElement = fieldElement.cloneNode(true) as HTMLElement;
      fieldElement.parentNode?.replaceChild(newFieldElement, fieldElement);

      newFieldElement.addEventListener('click', () => {
        if (!this.isDropdownOpen) {
          this.openDropdown();
        }
      });
    }

    const searchInput = container.querySelector('[data-api-select-search]') as HTMLInputElement;
    if (searchInput) {
      const currentValue = searchInput.value || this.searchQuery || '';

      const newSearchInput = searchInput.cloneNode(true) as HTMLInputElement;
      newSearchInput.value = currentValue;
      searchInput.parentNode?.replaceChild(newSearchInput, searchInput);
      this.searchInputElement = newSearchInput;

      newSearchInput.addEventListener('input', e => {
        const target = e.target as HTMLInputElement;
        this.onSearchInput(target.value);
      });

      newSearchInput.addEventListener('click', e => {
        e.stopPropagation();
      });
    }

    const toggleButton = container.querySelector('[data-api-select-toggle]');
    if (toggleButton) {
      const newToggleButton = toggleButton.cloneNode(true) as HTMLElement;
      toggleButton.parentNode?.replaceChild(newToggleButton, toggleButton);

      newToggleButton.addEventListener('click', e => {
        e.stopPropagation();
        this.toggleDropdown();
      });
    }

    const clearButton = container.querySelector('[data-api-select-clear]');
    if (clearButton) {
      const newClearButton = clearButton.cloneNode(true) as HTMLElement;
      clearButton.parentNode?.replaceChild(newClearButton, clearButton);

      newClearButton.addEventListener('click', e => {
        e.stopPropagation();
        e.preventDefault();
        this.clearSelection();
      });
    }

    this.attachRemoveTagEvents(container);
  }

  private attachRemoveTagEvents(container: HTMLElement): void {
    const removeTags = container.querySelectorAll('[data-api-select-remove]');
    removeTags.forEach(removeTag => {
      const newRemoveTag = removeTag.cloneNode(true) as HTMLElement;
      removeTag.parentNode?.replaceChild(newRemoveTag, removeTag);

      newRemoveTag.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const idStr = newRemoveTag.dataset.apiSelectRemove;
        if (!idStr) {
          return;
        }

        const originalItem = this.selectedItems.find(item => String(item.id) === idStr);
        if (originalItem) {
          this.removeItem(originalItem.id);
        }
      });
    });
  }

  async init(container: HTMLElement): Promise<void> {
    this.hydrateSelectedItemsFromValue(this.value);
    this.render(container);

    this.attachEvents(container);
    this.updateSearchFieldUI();

    this.updateDropdownContent();
    this.updateSelectedTags();

    setTimeout(() => {
      document.addEventListener('mousedown', this.handleClickOutsideBound, true);
      window.addEventListener('resize', this.handleResizeBound);
      window.addEventListener('scroll', this.handleScrollBound, true);
    }, 0);
  }

  destroy(): void {
    document.removeEventListener('mousedown', this.handleClickOutsideBound, true);
    window.removeEventListener('resize', this.handleResizeBound);
    window.removeEventListener('scroll', this.handleScrollBound, true);

    if (this.dropdownElement && this.dropdownElement.parentNode) {
      this.dropdownElement.remove();
      this.dropdownElement = undefined;
    }

    clearApiSelectDebounceTimer(this.debounceTimer);
  }

  getValue(): unknown {
    return this.value;
  }
}
