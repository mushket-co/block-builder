/**
 * ApiSelectControlRenderer - генерация HTML для api-select контрола в чистом JS
 * Универсальная реализация для использования без фреймворков
 */

import { IApiRequestParams, IApiSelectConfig, IApiSelectItem } from '../../core/types/form';
import { ApiSelectUseCase } from '../../core/use-cases/ApiSelectUseCase';

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
      this.fetchData(true);
    }, debounceMs);
  }

  private openDropdown(): void {
    if (!this.isDropdownOpen) {
      this.isDropdownOpen = true;

      if (!this.loading) {
        this.fetchData(true);
      } else {
        this.updateDropdownContent();
      }
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

    if (this.container && !this.container.contains(target)) {
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
      this.updateDropdownContent();
    } else {
      this.value = item.id;
      this.selectedItems = [item];
      this.searchQuery = item.name;
      this.isDropdownOpen = false;

      if (this.searchInputElement) {
        this.searchInputElement.value = item.name;
      }
      this.updateDropdownContent();
    }

    this.emitChange();
  }

  private removeItem(id: string | number): void {
    if (!this.isMultiple()) {
      return;
    }

    const currentValue = (this.value as (string | number)[]) || [];
    this.value = currentValue.filter(itemId => itemId !== id);
    this.selectedItems = this.selectedItems.filter(item => item.id !== id);

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
    this.fetchData(false);
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
    } catch (error) {
      // Игнорируем ошибки инициализации
    } finally {
      this.loading = false;
    }
  }

  private updateLoadingState(): void {
    if (!this.container) {
      return;
    }

    const wrapper = this.container.querySelector('.bb-api-select__search');
    if (!wrapper) {
      return;
    }

    const oldLoader = wrapper.querySelector('.bb-api-select__loader');
    const oldClear = wrapper.querySelector('.bb-api-select__clear');

    if (oldLoader) {
      oldLoader.remove();
    }
    if (oldClear) {
      oldClear.remove();
    }

    const toggleButton = wrapper.querySelector('.bb-api-select__toggle');

    if (!toggleButton) {
      return;
    }
    if (this.loading) {
      const loader = document.createElement('span');
      loader.className = 'bb-api-select__loader';
      loader.textContent = '⏳';
      toggleButton.before(loader);
    } else if (this.hasValue()) {
      const clear = document.createElement('span');
      clear.className = 'bb-api-select__clear';
      clear.textContent = '✕';
      clear.dataset.apiSelectClear = '';
      toggleButton.before(clear);
    }
  }

  private updateDropdownContent(): void {
    if (!this.container) {
      return;
    }

    const wrapper = this.container.querySelector('.bb-api-select__wrapper');
    if (!wrapper) {
      return;
    }

    const oldDropdown = wrapper.querySelector('.bb-api-select__dropdown');
    if (oldDropdown) {
      oldDropdown.remove();
    }

    this.updateLoadingState();

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
      wrapper.append(dropdown);
      this.attachDropdownEvents(dropdown);
    }

    this.updateSelectedTags();
  }

  private createDropdownElement(): HTMLElement {
    const loadingText = this.config.loadingText ?? 'Загрузка...';
    const noResultsText = this.config.noResultsText ?? 'Ничего не найдено';

    const dropdown = document.createElement('div');
    dropdown.className = 'bb-api-select__dropdown';

    if (this.loading) {
      dropdown.innerHTML = `<div class="bb-api-select__message">${loadingText}</div>`;
    } else if (this.error) {
      dropdown.innerHTML = `<div class="bb-api-select__message bb-api-select__message--error">${this.error}</div>`;
    } else if (this.items.length > 0) {
      const list = document.createElement('div');
      list.className = 'bb-api-select__list';

      this.items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = `bb-api-select__item ${this.isSelected(item.id) ? 'bb-api-select__item--selected' : ''}`;
        itemEl.dataset.apiSelectItem = '';
        itemEl.dataset.itemId = String(item.id);
        itemEl.dataset.itemName = item.name;
        itemEl.innerHTML = `
        <span class="bb-api-select__item-name">${item.name}</span>
        ${this.isSelected(item.id) ? '<span class="bb-api-select__item-check">✓</span>' : ''}
      `;
        list.append(itemEl);
      });

      if (this.hasMore) {
        const loadMore = document.createElement('div');
        loadMore.className = 'bb-api-select__load-more';
        loadMore.dataset.apiSelectLoadMore = '';
        loadMore.textContent = 'Загрузить еще...';
        list.append(loadMore);
      }

      dropdown.append(list);
    } else {
      dropdown.innerHTML = `<div class="bb-api-select__message">${noResultsText}</div>`;
    }

    return dropdown;
  }

  private attachDropdownEvents(dropdown: HTMLElement): void {
    const items = dropdown.querySelectorAll('[data-api-select-item]');
    items.forEach(itemEl => {
      itemEl.addEventListener('click', () => {
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
      loadMoreButton.addEventListener('click', () => {
        this.loadMore();
      });
    }
  }

  private updateSelectedTags(): void {
    if (!this.container) {
      return;
    }

    const oldTags = this.container.querySelector('.bb-api-select__selected');
    if (oldTags) {
      oldTags.remove();
    }

    if (this.isMultiple() && this.selectedItems.length > 0) {
      const wrapper = this.container.querySelector('.bb-api-select__wrapper');
      if (!wrapper) {
        return;
      }

      const tagsContainer = document.createElement('div');
      tagsContainer.className = 'bb-api-select__selected';

      this.selectedItems.forEach(item => {
        const tag = document.createElement('div');
        tag.className = 'bb-api-select__tag';
        tag.innerHTML = `
        <span class="bb-api-select__tag-name">${item.name}</span>
        <span class="bb-api-select__tag-remove" data-api-select-remove="${item.id}">✕</span>
      `;
        tagsContainer.append(tag);
      });

      wrapper.after(tagsContainer);

      // Прикрепляем события к новым тегам
      this.attachRemoveTagEvents(this.container);
    }
  }

  render(container: HTMLElement): void {
    this.container = container;

    const placeholder = this.config.placeholder ?? 'Начните вводить для поиска...';
    const loadingText = this.config.loadingText ?? 'Загрузка...';
    const noResultsText = this.config.noResultsText ?? 'Ничего не найдено';

    const placeholderElement = container.querySelector('.api-select-placeholder');
    if (placeholderElement) {
      placeholderElement.outerHTML = `
      <div class="bb-api-select">
        <label class="bb-api-select__label">
          ${this.label}
          ${this.isRequired() ? '<span class="bb-api-select__required">*</span>' : ''}
        </label>
        ${this.generateControlHTML(placeholder, loadingText, noResultsText)}
      </div>
    `;
    } else {
      container.innerHTML = `
      <div class="bb-api-select">
        <label class="bb-api-select__label">
          ${this.label}
          ${this.isRequired() ? '<span class="bb-api-select__required">*</span>' : ''}
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
      <div class="bb-api-select__wrapper">
        <div class="bb-api-select__search">
          <input
            type="text"
            class="bb-api-select__input"
            placeholder="${placeholder}"
            value="${this.searchQuery}"
            data-api-select-search
          />
          ${this.loading ? '<span class="bb-api-select__loader">⏳</span>' : ''}
          ${!this.loading && this.hasValue() ? '<span class="bb-api-select__clear" data-api-select-clear>✕</span>' : ''}
          <button
            type="button"
            class="bb-api-select__toggle ${this.isDropdownOpen ? 'bb-api-select__toggle--open' : ''}"
            data-api-select-toggle
          >
            ▼
          </button>
        </div>

        ${
          this.isDropdownOpen
            ? `
          <div class="bb-api-select__dropdown">
            ${
              this.loading
                ? `<div class="bb-api-select__message">${loadingText}</div>`
                : this.error
                  ? `<div class="bb-api-select__message bb-api-select__message--error">${this.error}</div>`
                  : this.items.length > 0
                    ? `
                <div class="bb-api-select__list">
                  ${this.items
                    .map(
                      item => `
                    <div class="bb-api-select__item ${this.isSelected(item.id) ? 'bb-api-select__item--selected' : ''}" data-api-select-item data-item-id="${item.id}" data-item-name="${item.name}">
                      <span class="bb-api-select__item-name">${item.name}</span>
                      ${this.isSelected(item.id) ? '<span class="bb-api-select__item-check">✓</span>' : ''}
                    </div>
                  `
                    )
                    .join('')}
                  ${
                    this.hasMore
                      ? '<div class="bb-api-select__load-more" data-api-select-load-more>Загрузить еще...</div>'
                      : ''
                  }
                </div>
              `
                    : `<div class="bb-api-select__message">${noResultsText}</div>`
            }
          </div>
        `
            : ''
        }
      </div>

      ${
        this.isMultiple() && this.selectedItems.length > 0
          ? `
        <div class="bb-api-select__selected">
          ${this.selectedItems
            .map(
              item => `
            <div class="bb-api-select__tag">
              <span class="bb-api-select__tag-name">${item.name}</span>
              <span class="bb-api-select__tag-remove" data-api-select-remove="${item.id}">✕</span>
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
          ? `<div class="bb-api-select__error">${this.errors[this.fieldName].join(', ')}</div>`
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

      newToggleButton.addEventListener('click', (e) => {
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
      // Удаляем старые обработчики
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
    }, 0);
  }

  destroy(): void {
    document.removeEventListener('mousedown', this.handleClickOutsideBound, true);

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  getValue(): string | number | (string | number)[] | null {
    return this.value;
  }
}
