/**
 * ApiSelectControlRenderer - генерация HTML для api-select контрола в чистом JS
 * Универсальная реализация для использования без фреймворков
 */

import { IApiSelectConfig, IApiSelectItem, IApiRequestParams } from '../../core/types/form';
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

  // Состояние компонента
  private searchQuery = '';
  private items: IApiSelectItem[] = [];
  private selectedItems: IApiSelectItem[] = [];
  private loading = false;
  private error: string | null = null;
  private isDropdownOpen = false;
  private currentPage = 1;
  private hasMore = false;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Use Case (внедряется через конструктор)
  private apiSelectUseCase: ApiSelectUseCase;

  // Обработчик клика вне области
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

  /**
   * Проверка обязательности поля
   */
  private isRequired(): boolean {
  return this.rules.some((rule) => rule.type === 'required');
  }

  /**
   * Проверка множественного выбора
   */
  private isMultiple(): boolean {
  return this.config.multiple ?? false;
  }

  /**
   * Проверка наличия значения
   */
  private hasValue(): boolean {
  if (this.isMultiple()) {
    return Array.isArray(this.value) && this.value.length > 0;
  }
  return this.value !== null && this.value !== undefined && this.value !== '';
  }

  /**
   * Проверка выбран ли элемент
   */
  private isSelected(id: string | number): boolean {
  if (this.isMultiple()) {
    const value = this.value as (string | number)[];
    return Array.isArray(value) && value.includes(id);
  }
  return this.value === id;
  }

  /**
   * Загрузка данных из API
   */
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

  // Обновляем только индикаторы загрузки, не трогая input
  this.updateLoadingState();

  try {
    const params: IApiRequestParams = {
      search: this.searchQuery || undefined,
      page: this.currentPage,
      limit: this.config.limit || 20,
    };

    const response = await this.apiSelectUseCase.fetchItems(this.config, params);

    if (reset) {
      this.items = response.data;
    } else {
      this.items = [...this.items, ...response.data];
    }

    this.hasMore = response.hasMore ?? false;
  } catch (err: any) {
    this.error = err.message || (this.config.errorText ?? 'Ошибка загрузки данных');
    this.items = [];
  } finally {
    this.loading = false;
    // Обновляем только dropdown, не трогая input (чтобы не сбивать каретку)
    this.updateDropdownContent();
  }
  }

  /**
   * Обработка ввода в поиск
   */
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

  /**
   * Открытие выпадающего списка
   */
  private openDropdown(): void {
  if (!this.isDropdownOpen) {
    this.isDropdownOpen = true;

    // Всегда загружаем данные при открытии с учетом текущего searchQuery
    // Это гарантирует актуальные результаты (либо по поиску, либо полный список)
    if (!this.loading) {
      this.fetchData(true);
    } else {
      this.updateDropdownContent();
    }
  }
  }

  /**
   * Toggle выпадающего списка
   */
  private toggleDropdown(): void {
  if (this.isDropdownOpen) {
    this.closeDropdown();
  } else {
    this.openDropdown();
  }
  }

  /**
   * Закрытие выпадающего списка
   */
  private closeDropdown(): void {
  this.isDropdownOpen = false;

  // Очищаем инпут поиска при закрытии
  if (this.isMultiple()) {
    // Для множественного выбора всегда очищаем
    this.searchQuery = '';
    if (this.searchInputElement) {
      this.searchInputElement.value = '';
    }
  } else if (this.selectedItems.length > 0) {
    // Для одиночного выбора показываем имя выбранного элемента
    this.searchQuery = this.selectedItems[0].name;
    if (this.searchInputElement) {
      this.searchInputElement.value = this.searchQuery;
    }
  } else {
    // Если ничего не выбрано, очищаем
    this.searchQuery = '';
    if (this.searchInputElement) {
      this.searchInputElement.value = '';
    }
  }

  this.updateDropdownContent();
  }

  /**
   * Обработчик клика вне компонента
   */
  private handleClickOutside(event: MouseEvent): void {
  if (!this.isDropdownOpen) return;

  const target = event.target as HTMLElement;

  if (this.container && !this.container.contains(target)) {
    this.closeDropdown();
  }
  }

  /**
   * Выбор элемента
   */
  private selectItem(item: IApiSelectItem): void {
  if (this.isMultiple()) {
    const currentValue = (this.value as (string | number)[]) || [];

    if (currentValue.includes(item.id)) {
      // Убрать из выбранных
      this.value = currentValue.filter((id) => id !== item.id);
      this.selectedItems = this.selectedItems.filter((i) => i.id !== item.id);
    } else {
      // Добавить в выбранные
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

  /**
   * Удаление выбранного элемента (для множественного выбора)
   */
  private removeItem(id: string | number): void {
  if (!this.isMultiple()) return;

  const currentValue = (this.value as (string | number)[]) || [];
  this.value = currentValue.filter((itemId) => itemId !== id);
  this.selectedItems = this.selectedItems.filter((item) => item.id !== id);

  this.emitChange();
  this.updateDropdownContent();
  }

  /**
   * Очистка выбора
   */
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
  this.fetchData(true); // <-- теперь подгружаем все айтемы без поиска
  this.updateDropdownContent();
  }

  /**
   * Загрузка следующей страницы
   */
  private loadMore(): void {
  if (!this.hasMore || this.loading) return;
  this.currentPage += 1;
  this.fetchData(false);
  }

  /**
   * Emit изменений
   */
  private emitChange(): void {
  if (this.onChange) {
    this.onChange(this.value);
  }
  }

  /**
   * Загрузка начальных данных для выбранных элементов
   */
  private async loadInitialSelectedItems(): Promise<void> {
  if (!this.hasValue() || !this.config.url) return;

  try {
    this.loading = true;
    const response = await this.apiSelectUseCase.fetchItems(this.config, {
      limit: 100,
    });

    if (this.isMultiple()) {
      const ids = this.value as (string | number)[];
      this.selectedItems = response.data.filter((item) => ids.includes(item.id));
    } else {
      const selectedItem = response.data.find((item) => item.id === this.value);
      if (selectedItem) {
        this.selectedItems = [selectedItem];
        this.searchQuery = selectedItem.name;
      }
    }
    } catch (err) {
      // Ошибка загрузки начальных данных
  } finally {
    this.loading = false;
  }
  }

  /**
   * Обновление индикатора загрузки без перерисовки input
   */
  private updateLoadingState(): void {
  if (!this.container) return;

  const wrapper = this.container.querySelector('.bb-api-select__search');
  if (!wrapper) return;

  // Удаляем старые индикаторы
  const oldLoader = wrapper.querySelector('.bb-api-select__loader');
  const oldClear = wrapper.querySelector('.bb-api-select__clear');

  if (oldLoader) oldLoader.remove();
  if (oldClear) oldClear.remove();

  // Добавляем новые в зависимости от состояния
  const toggleButton = wrapper.querySelector('.bb-api-select__toggle');

  if (this.loading) {
    const loader = document.createElement('span');
    loader.className = 'bb-api-select__loader';
    loader.textContent = '⏳';
    wrapper.insertBefore(loader, toggleButton);
  } else if (this.hasValue()) {
    const clear = document.createElement('span');
    clear.className = 'bb-api-select__clear';
    clear.textContent = '✕';
    clear.setAttribute('data-api-select-clear', '');
    clear.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clearSelection();
    });
    wrapper.insertBefore(clear, toggleButton);
  }
  }

  /**
   * Обновление содержимого dropdown без перерисовки input
   */
  private updateDropdownContent(): void {
  if (!this.container) return;

  const wrapper = this.container.querySelector('.bb-api-select__wrapper');
  if (!wrapper) return;

  // Удаляем старый dropdown
  const oldDropdown = wrapper.querySelector('.bb-api-select__dropdown');
  if (oldDropdown) {
    oldDropdown.remove();
  }

  // Обновляем состояние индикаторов
  this.updateLoadingState();

  // Создаем новый dropdown если он должен быть открыт
  if (this.isDropdownOpen) {
    const dropdown = this.createDropdownElement();
    wrapper.appendChild(dropdown);
    this.attachDropdownEvents(dropdown);
  }

  // Обновляем выбранные теги для множественного выбора
  this.updateSelectedTags();
  }

  /**
   * Создание элемента dropdown
   */
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

    this.items.forEach((item) => {
      const itemEl = document.createElement('div');
      itemEl.className = `bb-api-select__item ${this.isSelected(item.id) ? 'bb-api-select__item--selected' : ''}`;
      itemEl.setAttribute('data-api-select-item', '');
      itemEl.setAttribute('data-item-id', String(item.id));
      itemEl.setAttribute('data-item-name', item.name);
      itemEl.innerHTML = `
        <span class="bb-api-select__item-name">${item.name}</span>
        ${this.isSelected(item.id) ? '<span class="bb-api-select__item-check">✓</span>' : ''}
      `;
      list.appendChild(itemEl);
    });

    if (this.hasMore) {
      const loadMore = document.createElement('div');
      loadMore.className = 'bb-api-select__load-more';
      loadMore.setAttribute('data-api-select-load-more', '');
      loadMore.textContent = 'Загрузить еще...';
      list.appendChild(loadMore);
    }

    dropdown.appendChild(list);
  } else {
    dropdown.innerHTML = `<div class="bb-api-select__message">${noResultsText}</div>`;
  }

  return dropdown;
  }

  /**
   * Привязка событий к dropdown
   */
  private attachDropdownEvents(dropdown: HTMLElement): void {
  // Элементы списка
  const items = dropdown.querySelectorAll('[data-api-select-item]');
  items.forEach((itemEl) => {
    itemEl.addEventListener('click', () => {
      const idStr = (itemEl as HTMLElement).dataset.itemId!;
      const originalItem = this.items.find(item => String(item.id) === idStr);
      if (originalItem) {
        this.selectItem(originalItem);
      }
    });
  });

  // Кнопка загрузить еще
  const loadMoreButton = dropdown.querySelector('[data-api-select-load-more]');
  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', () => {
      this.loadMore();
    });
  }
  }

  /**
   * Обновление отображения выбранных тегов
   */
  private updateSelectedTags(): void {
  if (!this.container) return;

  // Удаляем старый контейнер с тегами
  const oldTags = this.container.querySelector('.bb-api-select__selected');
  if (oldTags) {
    oldTags.remove();
  }

  // Создаем новый если есть выбранные элементы
  if (this.isMultiple() && this.selectedItems.length > 0) {
    const wrapper = this.container.querySelector('.bb-api-select__wrapper');
    if (!wrapper) return;

    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'bb-api-select__selected';

    this.selectedItems.forEach((item) => {
      const tag = document.createElement('div');
      tag.className = 'bb-api-select__tag';
      tag.innerHTML = `
        <span class="bb-api-select__tag-name">${item.name}</span>
        <span class="bb-api-select__tag-remove" data-api-select-remove="${item.id}">✕</span>
      `;

      const removeBtn = tag.querySelector('[data-api-select-remove]');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.removeItem(item.id);
        });
      }

      tagsContainer.appendChild(tag);
    });

    wrapper.insertAdjacentElement('afterend', tagsContainer);
  }
  }

  /**
   * Рендер контрола
   */
  render(container: HTMLElement): void {
  this.container = container;

  const placeholder = this.config.placeholder ?? 'Начните вводить для поиска...';
  const loadingText = this.config.loadingText ?? 'Загрузка...';
  const noResultsText = this.config.noResultsText ?? 'Ничего не найдено';

  // Заменяем только placeholder внутри контейнера, сохраняя структуру контейнера
  const placeholderElement = container.querySelector('.api-select-placeholder');
  if (placeholderElement) {
    // Заменяем только placeholder, лейбл уже есть в FormBuilder (удалён)
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
    // Если placeholder не найден (старая структура), заменяем весь innerHTML контейнера
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

  /**
   * Генерация HTML для контрола (без лейбла, т.к. он добавляется отдельно)
   */
  private generateControlHTML(placeholder: string, loadingText: string, noResultsText: string): string {
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
                      (item) => `
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
              (item) => `
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
        this.isMultiple() && Array.isArray(this.value) ? JSON.stringify(this.value) : this.value ?? ''
      }" />
    </div>
  `;
  }

  /**
   * Привязка событий к элементам
   */
  private attachEvents(container: HTMLElement): void {
  // Поле поиска
  const searchInput = container.querySelector('[data-api-select-search]') as HTMLInputElement;
  if (searchInput) {
    // Сохраняем ссылку на input элемент
    this.searchInputElement = searchInput;

    searchInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      this.onSearchInput(target.value);
    });

    searchInput.addEventListener('click', () => {
      this.openDropdown();
    });
  }

  // Кнопка toggle
  const toggleButton = container.querySelector('[data-api-select-toggle]');
  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      this.toggleDropdown();
    });
  }

  // Кнопка очистки
  const clearButton = container.querySelector('[data-api-select-clear]');
  if (clearButton) {
    clearButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clearSelection();
    });
  }

  // Элементы списка
  const items = container.querySelectorAll('[data-api-select-item]');
  items.forEach((itemEl) => {
    itemEl.addEventListener('click', () => {
      const idStr = (itemEl as HTMLElement).dataset.itemId!;

      // Преобразуем id в правильный тип (находим оригинальный элемент)
      const originalItem = this.items.find(item => String(item.id) === idStr);
      if (originalItem) {
        this.selectItem(originalItem);
      }
    });
  });

  // Кнопка загрузить еще
  const loadMoreButton = container.querySelector('[data-api-select-load-more]');
  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', () => {
      this.loadMore();
    });
  }

  // Кнопки удаления тегов
  const removeTags = container.querySelectorAll('[data-api-select-remove]');
  removeTags.forEach((removeTag) => {
    removeTag.addEventListener('click', (e) => {
      e.preventDefault();
      const idStr = (removeTag as HTMLElement).dataset.apiSelectRemove!;

      // Находим оригинальный элемент с правильным типом id
      const originalItem = this.selectedItems.find(item => String(item.id) === idStr);
      if (originalItem) {
        this.removeItem(originalItem.id);
      }
    });
  });
  }

  /**
   * Инициализация контрола
   */
  async init(container: HTMLElement): Promise<void> {
  await this.loadInitialSelectedItems();
  this.render(container);

  // Привязываем события после рендера
  this.attachEvents(this.container!);

  // Обновляем контент после загрузки данных
  this.updateDropdownContent();
  this.updateSelectedTags();

  // Регистрируем обработчик клика вне компонента (capture phase)
  setTimeout(() => {
    document.addEventListener('mousedown', this.handleClickOutsideBound, true);
  }, 0);
  }

  /**
   * Уничтожение контрола и очистка ресурсов
   */
  destroy(): void {
  // Удаляем обработчик клика вне компонента
  document.removeEventListener('mousedown', this.handleClickOutsideBound, true);

  // Очищаем debounce timer
  if (this.debounceTimer) {
    clearTimeout(this.debounceTimer);
  }
  }

  /**
   * Получить текущее значение
   */
  getValue(): string | number | (string | number)[] | null {
  return this.value;
  }
}

