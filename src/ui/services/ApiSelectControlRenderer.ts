import { IApiRequestParams, IApiSelectConfig, IApiSelectItem } from '../../core/types/form';
import { ApiSelectUseCase } from '../../core/use-cases/ApiSelectUseCase';
import { CSS_CLASSES } from '../../utils/constants';

export interface IApiSelectControlOptions {
  fieldName: string;
  label: string;
  rules?: Array<{ type: string; message?: string; value?: any }>;
  errors?: Record<string, string[]>;
  config?: IApiSelectConfig;
  value?: string | number | (string | number)[] | null;
  apiSelectUseCase: ApiSelectUseCase;
  onChange?: (value: string | number | (string | number)[] | null) => void;
}

export class ApiSelectControlRenderer {
  private fieldName: string;
  private label: string;
  private rules: Array<{ type: string; message?: string; value?: any }>;
  private errors: Record<string, string[]>;
  private config: IApiSelectConfig;
  private value: string | number | (string | number)[] | null;
  private onChange?: (value: string | number | (string | number)[] | null) => void;
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
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

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
    this.value = options.value ?? (this.config.multiple ? [] : null);
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
    if (this.isMultiple()) {
      return Array.isArray(this.value) && this.value.length > 0;
    }
    return this.value !== null && this.value !== undefined && this.value !== '';
  }

  private isSelected(id: string | number): boolean {
    if (this.isMultiple()) {
      const value = this.value as (string | number)[];
      return Array.isArray(value) && value.includes(id);
    }
    return this.value === id;
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

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    const debounceMs = this.config.debounceMs ?? 300;
    this.debounceTimer = setTimeout(() => {
      this.fetchData(true).then(() => {
        if (!this.isDropdownOpen) {
          this.openDropdown();
        } else {
          this.updateDropdownPosition();
        }
      });
    }, debounceMs);
  }

  private openDropdown(): void {
    if (!this.isDropdownOpen) {
      this.isDropdownOpen = true;
      this.shouldRestoreScroll = false;
      this.updateDropdownContent();

      // Всегда обновляем первую страницу при открытии
      this.currentPage = 1;
      this.fetchData(true);
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

    if (this.isMultiple()) {
      this.searchQuery = '';
      if (this.searchInputElement) {
        this.searchInputElement.value = '';
      }
    } else if (this.selectedItems.length > 0) {
      this.searchQuery = this.selectedItems[0].name;
      if (this.searchInputElement) {
        this.searchInputElement.value = this.searchQuery;
      }
    } else {
      this.searchQuery = '';
      if (this.searchInputElement) {
        this.searchInputElement.value = '';
      }
    }

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
    if (this.isMultiple()) {
      const currentValue = (this.value as (string | number)[]) || [];

      if (currentValue.includes(item.id)) {
        this.value = currentValue.filter(id => id !== item.id);
        this.selectedItems = this.selectedItems.filter(i => i.id !== item.id);
      } else {
        this.value = [...currentValue, item.id];
        this.selectedItems.push(item);
      }
      this.updateHiddenInput();
      this.updateDropdownContent();
    } else {
      this.value = item.id;
      this.selectedItems = [item];
      this.searchQuery = item.name;

      if (this.searchInputElement) {
        this.searchInputElement.value = item.name;
      }

      this.updateHiddenInput();
      this.emitChange();
      this.closeDropdown();
    }

    if (this.isMultiple()) {
      this.emitChange();
    }
  }

  private removeItem(id: string | number): void {
    if (!this.isMultiple()) {
      return;
    }

    const currentValue = (this.value as (string | number)[]) || [];
    this.value = currentValue.filter(itemId => itemId !== id);
    this.selectedItems = this.selectedItems.filter(item => item.id !== id);

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

  private async loadInitialSelectedItems(): Promise<void> {
    if (!this.hasValue() || !this.config.url) {
      return;
    }

    try {
      this.loading = true;
      const limit = this.config.limit || 20;

      const response = await this.apiSelectUseCase.fetchItems(this.config, {
        limit,
      });

      if (this.isMultiple()) {
        const ids = this.value as (string | number)[];
        this.selectedItems = response.data.filter(item => ids.includes(item.id));
      } else {
        const selectedItem = response.data.find(item => item.id === this.value);
        if (selectedItem) {
          this.selectedItems = [selectedItem];
          this.searchQuery = selectedItem.name;
        }
      }
    } catch {
    } finally {
      this.loading = false;
    }
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
      loader.textContent = '⏳';
      toggleButton.before(loader);
    } else if (this.hasValue()) {
      const clear = document.createElement('span');
      clear.className = CSS_CLASSES.BB_API_SELECT_CLEAR;
      clear.textContent = '✕';
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
    const cssMax = computed.maxHeight === 'none' ? Number.POSITIVE_INFINITY : parseFloat(computed.maxHeight || '0');
    const effectiveMax = Math.min(constrainedSpace, isFinite(cssMax) ? cssMax : constrainedSpace);
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
    } else if (this.items.length > 0) {
      const list = document.createElement('div');
      list.className = CSS_CLASSES.BB_API_SELECT_LIST;

      this.items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = `${CSS_CLASSES.BB_API_SELECT_ITEM} ${this.isSelected(item.id) ? CSS_CLASSES.BB_API_SELECT_ITEM_SELECTED : ''}`;
        itemEl.dataset.apiSelectItem = '';
        itemEl.dataset.itemId = String(item.id);
        itemEl.dataset.itemName = item.name;
        itemEl.innerHTML = `
        <span class="${CSS_CLASSES.BB_API_SELECT_ITEM_NAME}">${item.name}</span>
        ${this.isSelected(item.id) ? `<span class="${CSS_CLASSES.BB_API_SELECT_ITEM_CHECK}">✓</span>` : ''}
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
      dropdown.innerHTML = `
        <div class="${CSS_CLASSES.BB_API_SELECT_MESSAGE}">${noResultsText}</div>
        <div class="${CSS_CLASSES.BB_API_SELECT_LOAD_MORE}" data-api-select-load-more>Загрузить ещё...</div>
      `;
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
      hiddenInput.value =
        this.isMultiple() && Array.isArray(this.value)
          ? JSON.stringify(this.value)
          : String(this.value ?? '');
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
        <span class="${CSS_CLASSES.BB_API_SELECT_TAG_REMOVE}" data-api-select-remove="${item.id}">✕</span>
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
          <input
            type="text"
            class="${CSS_CLASSES.BB_API_SELECT_INPUT}"
            placeholder="${placeholder}"
            value="${this.searchQuery}"
            data-api-select-search
          />
          ${this.loading ? `<span class="${CSS_CLASSES.BB_API_SELECT_LOADER}">⏳</span>` : ''}
          ${!this.loading && this.hasValue() ? `<span class="${CSS_CLASSES.BB_API_SELECT_CLEAR}" data-api-select-clear>✕</span>` : ''}
          <button
            type="button"
            class="${CSS_CLASSES.BB_API_SELECT_TOGGLE} ${this.isDropdownOpen ? CSS_CLASSES.BB_API_SELECT_TOGGLE_OPEN : ''}"
            data-api-select-toggle
          >
            ▼
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
                  : this.items.length > 0
                    ? `
                <div class="${CSS_CLASSES.BB_API_SELECT_LIST}">
                  ${this.items
                    .map(
                      item => `
                    <div class="${CSS_CLASSES.BB_API_SELECT_ITEM} ${this.isSelected(item.id) ? CSS_CLASSES.BB_API_SELECT_ITEM_SELECTED : ''}" data-api-select-item data-item-id="${item.id}" data-item-name="${item.name}">
                      <span class="${CSS_CLASSES.BB_API_SELECT_ITEM_NAME}">${item.name}</span>
                      ${this.isSelected(item.id) ? `<span class="${CSS_CLASSES.BB_API_SELECT_ITEM_CHECK}">✓</span>` : ''}
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
                    : `
                <div class="${CSS_CLASSES.BB_API_SELECT_MESSAGE}">${noResultsText}</div>
                <div class="${CSS_CLASSES.BB_API_SELECT_LOAD_MORE}" data-api-select-load-more>Загрузить...</div>
              `
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
              <span class="${CSS_CLASSES.BB_API_SELECT_TAG_REMOVE}" data-api-select-remove="${item.id}">✕</span>
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

      <input type="hidden" name="${this.fieldName}" value="${
        this.isMultiple() && Array.isArray(this.value)
          ? JSON.stringify(this.value)
          : (this.value ?? '')
      }" />
    </div>
  `;
  }

  private attachEvents(container: HTMLElement): void {
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

      newSearchInput.addEventListener('click', () => {
        this.openDropdown();
      });

      newSearchInput.addEventListener('focus', () => {
        if (!this.isDropdownOpen) {
          this.openDropdown();
        }
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
    await this.loadInitialSelectedItems();
    this.render(container);

    this.attachEvents(container);

    if (this.searchInputElement && this.searchQuery) {
      this.searchInputElement.value = this.searchQuery;
    }

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

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  getValue(): string | number | (string | number)[] | null {
    return this.value;
  }
}
