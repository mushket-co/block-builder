import {
  IFormFieldConfig,
  IRepeaterFieldConfig,
  IRepeaterItemFieldConfig,
} from '../../core/types/form';
import { CSS_CLASSES } from '../../utils/constants';
import { FieldRendererFactory } from './form-renderers/FieldRendererFactory';
import { IRenderContext } from './form-renderers/IRenderContext';

export interface IRepeaterControlOptions {
  fieldName: string;
  label: string;
  rules?: Array<{ type: string; message?: string; value?: any }>;
  errors?: Record<string, string[]>;
  config?: IRepeaterFieldConfig;
  value?: any[];
  onChange?: (value: any[]) => void;
  onAfterRender?: () => void;
}

export class RepeaterControlRenderer {
  private fieldName: string;
  private label: string;
  private rules: Array<{ type: string; message?: string; value?: any }>;
  private errors: Record<string, string[]>;
  private config: IRepeaterFieldConfig;
  private value: any[];
  private onChange?: (value: any[]) => void;
  private onAfterRender?: () => void;
  private container?: HTMLElement;
  private collapsedItems: Set<number> = new Set();
  private rendererFactory: FieldRendererFactory;

  constructor(options: IRepeaterControlOptions) {
    this.fieldName = options.fieldName;
    this.label = options.label;
    this.rules = options.rules || [];
    this.errors = options.errors || {};
    this.config = options.config || { fields: [] };
    this.value = options.value || [];
    this.onChange = options.onChange;
    this.onAfterRender = options.onAfterRender;
    this.rendererFactory = FieldRendererFactory.getInstance();

    const effectiveMin = this.getEffectiveMin();
    if (this.value.length === 0 && effectiveMin > 0) {
      for (let i = 0; i < effectiveMin; i++) {
        this.value.push(this.createNewItem());
      }
    }
  }

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
    if (!this.isRequired()) {
      return 0;
    }
    if (this.config.min !== undefined) {
      return this.config.min;
    }
    return 1;
  }

  private createNewItem(): Record<string, any> {
    const newItem: Record<string, any> = {};

    this.config.fields.forEach(field => {
      if (this.config.defaultItemValue && this.config.defaultItemValue[field.field] !== undefined) {
        newItem[field.field] = this.config.defaultItemValue[field.field];
      } else if (field.defaultValue !== undefined) {
        newItem[field.field] = field.defaultValue;
      } else {
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

  private addItem(): void {
    if (this.config.max && this.value.length >= this.config.max) {
      return;
    }

    this.value.push(this.createNewItem());
    this.emitChange();
    this.safeRender();
  }

  private removeItem(index: number): void {
    const effectiveMin = this.getEffectiveMin();
    if (this.value.length <= effectiveMin) {
      return;
    }

    this.value.splice(index, 1);
    this.collapsedItems.delete(index);
    this.emitChange();
    this.safeRender();
  }

  private moveItem(fromIndex: number, toIndex: number): void {
    const item = this.value[fromIndex];
    this.value.splice(fromIndex, 1);
    this.value.splice(toIndex, 0, item);
    this.emitChange();
    this.safeRender();
  }

  private toggleCollapse(index: number): void {
    if (this.collapsedItems.has(index)) {
      this.collapsedItems.delete(index);
    } else {
      this.collapsedItems.add(index);
    }
    this.safeRender();
  }

  private onFieldChange(itemIndex: number, fieldName: string, value: any): void {
    this.value[itemIndex][fieldName] = value;
    this.emitChange();
  }

  private emitChange(): void {
    if (this.onChange) {
      this.onChange(this.value);
    }
  }

  private safeRender(): void {
    if (this.container) {
      this.render(this.container);
    }
  }

  private isFieldRequired(field: IRepeaterItemFieldConfig): boolean {
    return field.rules?.some(rule => rule.type === 'required') ?? false;
  }

  private getFieldErrors(index: number, fieldName: string): string[] {
    const errorKey = `${this.fieldName}[${index}].${fieldName}`;
    return this.errors[errorKey] || [];
  }

  private hasFieldError(index: number, fieldName: string): boolean {
    return this.getFieldErrors(index, fieldName).length > 0;
  }

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
   * Генерирует HTML для поля внутри repeater, используя рендереры из form-renderers
   * Передает контекст напрямую в рендерер, без замены строк
   */
  private generateFieldHTML(
    field: IRepeaterItemFieldConfig,
    itemIndex: number,
    value: any
  ): string {
    const fieldId = `repeater-${this.fieldName}-${itemIndex}-${field.field}`;
    const required = this.isFieldRequired(field) ? 'required' : '';
    const hasError = this.hasFieldError(itemIndex, field.field);
    const errors = this.getFieldErrors(itemIndex, field.field);
    const fieldNamePath = `${this.fieldName}[${itemIndex}].${field.field}`;

    // Преобразуем конфигурацию поля для использования с рендерерами
    const formFieldConfig = this.convertToFormFieldConfig(field);

    // Используем стандартные классы из form-renderers
    // Стили применяются через вложенность в SCSS (.repeater-control__item-fields .block-builder-form-group)
    let inputClass = CSS_CLASSES.FORM_CONTROL;
    if (hasError) {
      inputClass += ` ${CSS_CLASSES.ERROR}`;
    }

    // Создаем контекст для рендеринга
    const context: IRenderContext = {
      containerClass: hasError
        ? `${CSS_CLASSES.FORM_GROUP} ${CSS_CLASSES.ERROR}`
        : CSS_CLASSES.FORM_GROUP,
      labelClass: 'block-builder-form-label',
      inputClass: inputClass,
      checkboxContainerClass: 'block-builder-form-checkbox',
      checkboxLabelClass: 'block-builder-form-checkbox-label',
      checkboxInputClass: 'block-builder-form-checkbox-input',
      fieldNamePath: fieldNamePath,
      showErrors: hasError,
      errors: errors,
      inputDataAttributes: {
        'item-index': String(itemIndex),
        'field-name': field.field,
      },
    };

    // Для image полей добавляем специальные data-атрибуты
    if (field.type === 'image') {
      context.containerDataAttributes = {
        'field-name': fieldNamePath,
        'repeater-field': this.fieldName,
        'repeater-index': String(itemIndex),
        'repeater-item-field': field.field,
      };
      context.inputDataAttributes = {
        'item-index': String(itemIndex),
        'field-name': field.field,
        'repeater-field-name': this.fieldName,
        'item-field-name': field.field,
        'repeater-field': this.fieldName,
        'repeater-index': String(itemIndex),
      };
    }

    // Получаем рендерер для типа поля
    const renderer = this.rendererFactory.getRenderer(field.type);

    // Рендерим поле с помощью рендерера, передавая контекст
    return renderer.render(fieldId, formFieldConfig, value, required, context);
  }

  private escapeHtml(text: string): string {
    if (!text) {
      return '';
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Преобразует IRepeaterItemFieldConfig в IFormFieldConfig для использования с рендерерами
   * Поддерживает расширенные свойства через приведение типов (например, imageUploadConfig)
   */
  private convertToFormFieldConfig(field: IRepeaterItemFieldConfig): IFormFieldConfig {
    const baseConfig: IFormFieldConfig = {
      field: field.field,
      label: field.label,
      type: field.type,
      placeholder: field.placeholder,
      defaultValue: field.defaultValue,
      options: field.options,
      rules: field.rules,
    };

    // Поддержка imageUploadConfig для полей изображений (расширенное свойство)
    const extendedField = field as IRepeaterItemFieldConfig & { imageUploadConfig?: any };
    if (field.type === 'image' && extendedField.imageUploadConfig) {
      baseConfig.imageUploadConfig = extendedField.imageUploadConfig;
    }

    return baseConfig;
  }

  private generateItemHTML(item: Record<string, any>, index: number): string {
    const itemTitle = this.config.itemTitle || 'Элемент';
    const isCollapsed = this.collapsedItems.has(index);
    const effectiveMin = this.getEffectiveMin();
    const canRemove = this.value.length > effectiveMin;

    const fieldsHTML = this.config.fields
      .map(field => this.generateFieldHTML(field, index, item[field.field]))
      .join('');

    return `
    <div class="repeater-control__item ${isCollapsed ? 'repeater-control__item--collapsed' : ''}" data-item-index="${index}">
      <div class="repeater-control__item-header">
        <span class="repeater-control__item-title">${itemTitle} #${index + 1}</span>
        <div class="repeater-control__item-actions">
          <button
            type="button"
            class="repeater-control__item-btn repeater-control__item-btn--collapse"
            data-action="collapse"
            data-item-index="${index}"
            title="${isCollapsed ? 'Развернуть' : 'Свернуть'}"
          >
            ${isCollapsed ? '▼' : '▲'}
          </button>
          ${
            index > 0
              ? `
            <button
              type="button"
              class="repeater-control__item-btn repeater-control__item-btn--move"
              data-action="move-up"
              data-item-index="${index}"
              title="Переместить вверх"
            >
              ↑
            </button>
          `
              : ''
          }
          ${
            index < this.value.length - 1
              ? `
            <button
              type="button"
              class="repeater-control__item-btn repeater-control__item-btn--move"
              data-action="move-down"
              data-item-index="${index}"
              title="Переместить вниз"
            >
              ↓
            </button>
          `
              : ''
          }
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
      ${
        !isCollapsed
          ? `
        <div class="repeater-control__item-fields">
          ${fieldsHTML}
        </div>
      `
          : ''
      }
    </div>
  `;
  }

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
        ${
          itemCount > 0
            ? `
          <span class="repeater-control__count">
            ${itemCount} ${this.getItemCountLabel(itemCount)}
          </span>
        `
            : ''
        }
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

      ${
        effectiveMin || max
          ? `
        <div class="repeater-control__hint">
          ${
            effectiveMin && itemCount < effectiveMin
              ? `
            <span class="repeater-control__hint--error">Минимум: ${effectiveMin}</span>
          `
              : ''
          }
          ${
            max && itemCount >= max
              ? `
            <span class="repeater-control__hint--warning">Максимум: ${max}</span>
          `
              : ''
          }
        </div>
      `
          : ''
      }
    </div>
  `;
  }

  public render(container: HTMLElement): void {
    this.container = container;
    container.querySelectorAll('[data-image-initialized]').forEach(el => {
      const htmlEl = el as HTMLElement;
      delete htmlEl.dataset.imageInitialized;
    });
    container.innerHTML = this.generateHTML();
    this.attachEventListeners();

    if (this.onAfterRender) {
      this.onAfterRender();
    }
  }

  private attachEventListeners(): void {
    if (!this.container) {
      return;
    }

    const addButton = this.container.querySelector('[data-action="add"]');
    addButton?.addEventListener('click', () => this.addItem());

    const actionButtons = this.container.querySelectorAll('.repeater-control__item-btn');
    actionButtons.forEach(btn => {
      btn.addEventListener('click', e => {
        const target = e.currentTarget as HTMLElement;
        const action = target.dataset.action;
        const index = Number.parseInt(target.dataset.itemIndex || '0', 10);

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

    const inputs = this.container.querySelectorAll(
      'input[data-item-index], textarea[data-item-index], select[data-item-index]'
    );
    inputs.forEach(input => {
      const eventType = input.tagName === 'SELECT' ? 'change' : 'input';
      input.addEventListener(eventType, e => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        const itemIndex = Number.parseInt(target.dataset.itemIndex || '0', 10);
        const fieldName = target.dataset.fieldName || '';

        let value: any;
        if (target.type === 'checkbox') {
          value = (target as HTMLInputElement).checked;
        } else if (target.type === 'number') {
          value = Number.parseFloat(target.value) || 0;
        } else {
          value = target.value;
        }

        this.onFieldChange(itemIndex, fieldName, value);
      });
    });
  }

  public getValue(): any[] {
    return this.value;
  }

  public updateErrors(errors: Record<string, string[]>): void {
    this.errors = errors;
    if (this.container) {
      this.render(this.container);
    }
  }

  public setValue(value: any[]): void {
    this.value = value;
    if (this.container) {
      this.render(this.container);
    }
  }

  public destroy(): void {
    if (this.container) {
      this.container.innerHTML = '';
      this.container = undefined;
    }
  }

  public expandItem(index: number): void {
    if (this.collapsedItems.has(index)) {
      this.collapsedItems.delete(index);
      if (this.container) {
        this.render(this.container);
      }
    }
  }

  public isItemCollapsed(index: number): boolean {
    return this.collapsedItems.has(index);
  }
}
