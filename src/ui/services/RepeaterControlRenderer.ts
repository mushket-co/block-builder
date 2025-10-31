/**
 * RepeaterControlRenderer - генерация HTML для repeater контрола в чистом JS
 * Универсальная реализация для использования без фреймворков
 */

import { IRepeaterItemFieldConfig, IRepeaterFieldConfig } from '../../core/types/form';

export interface IRepeaterControlOptions {
  fieldName: string;
  label: string;
  rules?: Array<{ type: string; message?: string; value?: any }>;
  errors?: Record<string, string[]>;
  config?: IRepeaterFieldConfig;
  value?: any[];
  onChange?: (value: any[]) => void;
}

export class RepeaterControlRenderer {
  private fieldName: string;
  private label: string;
  private rules: Array<{ type: string; message?: string; value?: any }>;
  private errors: Record<string, string[]>;
  private config: IRepeaterFieldConfig;
  private value: any[];
  private onChange?: (value: any[]) => void;
  private container?: HTMLElement;
  private collapsedItems: Set<number> = new Set();
  private itemIdCounter = 0;

  constructor(options: IRepeaterControlOptions) {
  this.fieldName = options.fieldName;
  this.label = options.label;
  this.rules = options.rules || [];
  this.errors = options.errors || {};
  this.config = options.config || { fields: [] };
  this.value = options.value || [];
  this.onChange = options.onChange;

  // Инициализируем минимальное количество элементов
  const effectiveMin = this.getEffectiveMin();
  if (this.value.length === 0 && effectiveMin > 0) {
    for (let i = 0; i < effectiveMin; i++) {
      this.value.push(this.createNewItem());
    }
  }
  }

  /**
   * Проверяем, есть ли правило required в rules
   */
  private isRequired(): boolean {
  return this.rules.some(rule => rule.type === 'required');
  }

  /**
   * Получить эффективный минимум
   * Логика:
   * 1. Нет required в rules → всегда min = 0 (можно удалить все), min из config игнорируется
   * 2. Есть required + задан min в config → используем min из config (приоритет)
   * 3. Есть required, но min не задан → min = 1 (по умолчанию)
   */
  private getEffectiveMin(): number {
  // Если нет required → всегда можно удалить все
  if (!this.isRequired()) {
    return 0;
  }
  // Если есть required и задан min явно → используем его
  if (this.config.min !== undefined) {
    return this.config.min;
  }
  // Если есть required, но min не задан → по умолчанию 1
  return 1;
  }

  /**
   * Создание нового элемента с дефолтными значениями
   */
  private createNewItem(): Record<string, any> {
  const newItem: Record<string, any> = {};

  this.config.fields.forEach(field => {
    if (this.config.defaultItemValue && this.config.defaultItemValue[field.field] !== undefined) {
      newItem[field.field] = this.config.defaultItemValue[field.field];
    } else if (field.defaultValue !== undefined) {
      newItem[field.field] = field.defaultValue;
    } else {
      // Значения по умолчанию по типу
      switch (field.type) {
        case 'checkbox':
          newItem[field.field] = false;
          break;
        case 'number':
          newItem[field.field] = 0;
          break;
        default:
          newItem[field.field] = '';
      }
    }
  });

  return newItem;
  }

  /**
   * Добавление элемента
   */
  private addItem(): void {
  if (this.config.max && this.value.length >= this.config.max) {
    return;
  }

  this.value.push(this.createNewItem());
  this.emitChange();
  this.render(this.container!);
  }

  /**
   * Удаление элемента
   */
  private removeItem(index: number): void {
  const effectiveMin = this.getEffectiveMin();
  if (this.value.length <= effectiveMin) {
    return;
  }

  this.value.splice(index, 1);
  this.collapsedItems.delete(index);
  this.emitChange();
  this.render(this.container!);
  }

  /**
   * Перемещение элемента
   */
  private moveItem(fromIndex: number, toIndex: number): void {
  const item = this.value[fromIndex];
  this.value.splice(fromIndex, 1);
  this.value.splice(toIndex, 0, item);
  this.emitChange();
  this.render(this.container!);
  }

  /**
   * Сворачивание/разворачивание элемента
   */
  private toggleCollapse(index: number): void {
  if (this.collapsedItems.has(index)) {
    this.collapsedItems.delete(index);
  } else {
    this.collapsedItems.add(index);
  }
  this.render(this.container!);
  }

  /**
   * Изменение значения поля
   */
  private onFieldChange(itemIndex: number, fieldName: string, value: any): void {
  this.value[itemIndex][fieldName] = value;
  this.emitChange();
  }

  /**
   * Отправка изменений
   */
  private emitChange(): void {
  if (this.onChange) {
    this.onChange(this.value);
  }
  }

  /**
   * Проверка обязательности поля
   */
  private isFieldRequired(field: IRepeaterItemFieldConfig): boolean {
  return field.rules?.some(rule => rule.type === 'required') ?? false;
  }

  /**
   * Получение ошибок для конкретного поля конкретного элемента
   * Формат ключа ошибки: "cards[0].title", "slides[1].url" и т.д.
   */
  private getFieldErrors(index: number, fieldName: string): string[] {
  const errorKey = `${this.fieldName}[${index}].${fieldName}`;
  return this.errors[errorKey] || [];
  }

  /**
   * Проверка, есть ли ошибка у поля
   */
  private hasFieldError(index: number, fieldName: string): boolean {
  return this.getFieldErrors(index, fieldName).length > 0;
  }

  /**
   * Получение правильного склонения для счетчика
   */
  private getItemCountLabel(count: number): string {
  const itemTitle = this.config.itemTitle || 'Элемент';
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return itemTitle.toLowerCase();
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return itemTitle.toLowerCase() + 'а';
  } else {
    return itemTitle.toLowerCase() + 'ов';
  }
  }

  /**
   * Генерация HTML для поля
   */
  private generateFieldHTML(field: IRepeaterItemFieldConfig, itemIndex: number, value: any): string {
  const fieldId = `repeater-${this.fieldName}-${itemIndex}-${field.field}`;
  const required = this.isFieldRequired(field) ? 'required' : '';
  const hasError = this.hasFieldError(itemIndex, field.field);
  const errorClass = hasError ? 'error' : '';
  const errors = this.getFieldErrors(itemIndex, field.field);

  switch (field.type) {
    case 'textarea':
      return `
        <div class="repeater-control__field ${hasError ? 'error' : ''}">
          <label for="${fieldId}" class="repeater-control__field-label">
            ${field.label}
            ${required ? '<span class="required">*</span>' : ''}
          </label>
          <textarea
            id="${fieldId}"
            class="repeater-control__field-textarea ${errorClass}"
            placeholder="${field.placeholder || ''}"
            data-item-index="${itemIndex}"
            data-field-name="${field.field}"
            rows="3"
            ${required}
          >${value || ''}</textarea>
          ${hasError ? `<div class="repeater-control__field-error">${errors[0]}</div>` : ''}
        </div>
      `;

    case 'select':
      return `
        <div class="repeater-control__field ${hasError ? 'error' : ''}">
          <label for="${fieldId}" class="repeater-control__field-label">
            ${field.label}
            ${required ? '<span class="required">*</span>' : ''}
          </label>
          <select
            id="${fieldId}"
            class="repeater-control__field-select ${errorClass}"
            data-item-index="${itemIndex}"
            data-field-name="${field.field}"
            ${required}
          >
            <option value="">Выберите...</option>
            ${field.options?.map(option =>
              `<option value="${option.value}" ${option.value === value ? 'selected' : ''}>${option.label}</option>`
            ).join('') || ''}
          </select>
          ${hasError ? `<div class="repeater-control__field-error">${errors[0]}</div>` : ''}
        </div>
      `;

    case 'number':
      return `
        <div class="repeater-control__field ${hasError ? 'error' : ''}">
          <label for="${fieldId}" class="repeater-control__field-label">
            ${field.label}
            ${required ? '<span class="required">*</span>' : ''}
          </label>
          <input
            type="number"
            id="${fieldId}"
            class="repeater-control__field-input ${errorClass}"
            placeholder="${field.placeholder || ''}"
            value="${value || ''}"
            data-item-index="${itemIndex}"
            data-field-name="${field.field}"
            ${required}
          />
          ${hasError ? `<div class="repeater-control__field-error">${errors[0]}</div>` : ''}
        </div>
      `;

    case 'color':
      return `
        <div class="repeater-control__field ${hasError ? 'error' : ''}">
          <label for="${fieldId}" class="repeater-control__field-label">
            ${field.label}
            ${required ? '<span class="required">*</span>' : ''}
          </label>
          <input
            type="color"
            id="${fieldId}"
            class="repeater-control__field-color"
            value="${value || '#000000'}"
            data-item-index="${itemIndex}"
            data-field-name="${field.field}"
            ${required}
          />
          ${hasError ? `<div class="repeater-control__field-error">${errors[0]}</div>` : ''}
        </div>
      `;

    case 'checkbox':
      return `
        <div class="repeater-control__field ${hasError ? 'error' : ''}">
          <label class="repeater-control__field-checkbox">
            <input
              type="checkbox"
              id="${fieldId}"
              data-item-index="${itemIndex}"
              data-field-name="${field.field}"
              ${value ? 'checked' : ''}
            />
            <span class="repeater-control__field-checkbox-label">${field.label}</span>
          </label>
        </div>
      `;

    case 'url':
    case 'email':
      return `
        <div class="repeater-control__field ${hasError ? 'error' : ''}">
          <label for="${fieldId}" class="repeater-control__field-label">
            ${field.label}
            ${required ? '<span class="required">*</span>' : ''}
          </label>
          <input
            type="${field.type}"
            id="${fieldId}"
            class="repeater-control__field-input ${errorClass}"
            placeholder="${field.placeholder || ''}"
            value="${value || ''}"
            data-item-index="${itemIndex}"
            data-field-name="${field.field}"
            ${required}
          />
          ${hasError ? `<div class="repeater-control__field-error">${errors[0]}</div>` : ''}
        </div>
      `;

    default: // text
      return `
        <div class="repeater-control__field ${hasError ? 'error' : ''}">
          <label for="${fieldId}" class="repeater-control__field-label">
            ${field.label}
            ${required ? '<span class="required">*</span>' : ''}
          </label>
          <input
            type="text"
            id="${fieldId}"
            class="repeater-control__field-input ${errorClass}"
            placeholder="${field.placeholder || ''}"
            value="${value || ''}"
            data-item-index="${itemIndex}"
            data-field-name="${field.field}"
            ${required}
          />
          ${hasError ? `<div class="repeater-control__field-error">${errors[0]}</div>` : ''}
        </div>
      `;
  }
  }

  /**
   * Генерация HTML для одного элемента
   */
  private generateItemHTML(item: Record<string, any>, index: number): string {
  const itemTitle = this.config.itemTitle || 'Элемент';
  const isCollapsed = this.collapsedItems.has(index);
  const effectiveMin = this.getEffectiveMin();
  const canRemove = this.value.length > effectiveMin;
  const collapsible = this.config.collapsible ?? false;

  const fieldsHTML = this.config.fields
    .map(field => this.generateFieldHTML(field, index, item[field.field]))
    .join('');

  return `
    <div class="repeater-control__item ${isCollapsed ? 'repeater-control__item--collapsed' : ''}" data-item-index="${index}">
      <div class="repeater-control__item-header">
        <span class="repeater-control__item-title">${itemTitle} #${index + 1}</span>
        <div class="repeater-control__item-actions">
          ${collapsible ? `
            <button
              type="button"
              class="repeater-control__item-btn repeater-control__item-btn--collapse"
              data-action="collapse"
              data-item-index="${index}"
              title="${isCollapsed ? 'Развернуть' : 'Свернуть'}"
            >
              ${isCollapsed ? '▼' : '▲'}
            </button>
          ` : ''}
          ${index > 0 ? `
            <button
              type="button"
              class="repeater-control__item-btn repeater-control__item-btn--move"
              data-action="move-up"
              data-item-index="${index}"
              title="Переместить вверх"
            >
              ↑
            </button>
          ` : ''}
          ${index < this.value.length - 1 ? `
            <button
              type="button"
              class="repeater-control__item-btn repeater-control__item-btn--move"
              data-action="move-down"
              data-item-index="${index}"
              title="Переместить вниз"
            >
              ↓
            </button>
          ` : ''}
          <button
            type="button"
            class="repeater-control__item-btn repeater-control__item-btn--remove"
            data-action="remove"
            data-item-index="${index}"
            ${!canRemove ? 'disabled' : ''}
            title="${this.config.removeButtonText || 'Удалить'}"
          >
            ✕
          </button>
        </div>
      </div>
      ${!isCollapsed ? `
        <div class="repeater-control__item-fields">
          ${fieldsHTML}
        </div>
      ` : ''}
    </div>
  `;
  }

  /**
   * Генерация полного HTML
   */
  public generateHTML(): string {
  const itemCount = this.value.length;
  const canAdd = !this.config.max || itemCount < this.config.max;
  const effectiveMin = this.getEffectiveMin();
  const max = this.config.max;

  const itemsHTML = this.value.map((item, index) => this.generateItemHTML(item, index)).join('');

  return `
    <div class="repeater-control" data-field-name="${this.fieldName}">
      <div class="repeater-control__header">
        <label class="repeater-control__label">
          ${this.label}
          ${this.isRequired() ? '<span class="required">*</span>' : ''}
        </label>
        ${itemCount > 0 ? `
          <span class="repeater-control__count">
            ${itemCount} ${this.getItemCountLabel(itemCount)}
          </span>
        ` : ''}
      </div>

      <div class="repeater-control__items">
        ${itemsHTML}
      </div>

      <button
        type="button"
        class="repeater-control__add-btn"
        data-action="add"
        ${!canAdd ? 'disabled' : ''}
      >
        + ${this.config.addButtonText || 'Добавить'}
      </button>

      ${effectiveMin || max ? `
        <div class="repeater-control__hint">
          ${effectiveMin && itemCount < effectiveMin ? `
            <span class="repeater-control__hint--error">Минимум: ${effectiveMin}</span>
          ` : ''}
          ${max && itemCount >= max ? `
            <span class="repeater-control__hint--warning">Максимум: ${max}</span>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `;
  }

  /**
   * Рендеринг в контейнер
   */
  public render(container: HTMLElement): void {
  this.container = container;
  container.innerHTML = this.generateHTML();
  this.attachEventListeners();
  }

  /**
   * Привязка обработчиков событий
   */
  private attachEventListeners(): void {
  if (!this.container) return;

  // Кнопка добавления
  const addButton = this.container.querySelector('[data-action="add"]');
  addButton?.addEventListener('click', () => this.addItem());

  // Кнопки действий элементов
  const actionButtons = this.container.querySelectorAll('.repeater-control__item-btn');
  actionButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const action = target.dataset.action;
      const index = parseInt(target.dataset.itemIndex || '0', 10);

      switch (action) {
        case 'remove':
          this.removeItem(index);
          break;
        case 'move-up':
          this.moveItem(index, index - 1);
          break;
        case 'move-down':
          this.moveItem(index, index + 1);
          break;
        case 'collapse':
          this.toggleCollapse(index);
          break;
      }
    });
  });

  // Поля ввода
  const inputs = this.container.querySelectorAll('input[data-item-index], textarea[data-item-index], select[data-item-index]');
  inputs.forEach(input => {
    const eventType = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(eventType, (e) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const itemIndex = parseInt(target.dataset.itemIndex || '0', 10);
      const fieldName = target.dataset.fieldName || '';

      let value: any;
      if (target.type === 'checkbox') {
        value = (target as HTMLInputElement).checked;
      } else if (target.type === 'number') {
        value = parseFloat(target.value) || 0;
      } else {
        value = target.value;
      }

      this.onFieldChange(itemIndex, fieldName, value);
    });
  });
  }

  /**
   * Получить текущее значение
   */
  public getValue(): any[] {
  return this.value;
  }

  /**
   * Обновить ошибки валидации
   */
  public updateErrors(errors: Record<string, string[]>): void {
  this.errors = errors;
  // Перерендерим контрол с новыми ошибками
  if (this.container) {
    this.render(this.container);
  }
  }

  /**
   * Установить значение
   */
  public setValue(value: any[]): void {
  this.value = value;
  if (this.container) {
    this.render(this.container);
  }
  }

  /**
   * Уничтожение контрола
   */
  public destroy(): void {
  if (this.container) {
    this.container.innerHTML = '';
    this.container = undefined;
  }
  }

  /**
   * Открыть аккордеон для элемента с ошибкой
   */
  public expandItem(index: number): void {
  if (this.collapsedItems.has(index)) {
    this.collapsedItems.delete(index);
    if (this.container) {
      this.render(this.container);
    }
  }
  }

  /**
   * Проверить, свернут ли элемент
   */
  public isItemCollapsed(index: number): boolean {
  return this.collapsedItems.has(index);
  }
}

