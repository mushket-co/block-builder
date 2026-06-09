import {
  IFormFieldConfig,
  IRepeaterFieldConfig,
  IRepeaterItemFieldConfig,
} from '../../core/types/form';
import { CSS_CLASSES } from '../../utils/constants';
import { getRepeaterCountText } from '../../utils/repeaterCountText';
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
  nestingDepth?: number;
  maxNestingDepth?: number;
  parentFieldPath?: string;
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
  private nestingDepth: number;
  private maxNestingDepth: number;
  private parentFieldPath: string;
  private nestedRenderers: Map<string, RepeaterControlRenderer> = new Map();

  constructor(options: IRepeaterControlOptions) {
    this.fieldName = options.fieldName;
    this.label = options.label;
    this.rules = options.rules || [];
    this.errors = options.errors || {};
    this.config = options.config || { fields: [] };
    this.value = options.value || [];
    this.onChange = options.onChange;
    this.onAfterRender = options.onAfterRender;
    this.nestingDepth = options.nestingDepth || 0;
    this.maxNestingDepth = options.maxNestingDepth ?? 2;
    this.parentFieldPath = options.parentFieldPath || '';
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
          case 'api-select': {
            const apiSelectConfig = (field as any).apiSelectConfig;
            newItem[field.field] = apiSelectConfig?.multiple ? [] : null;
            break;
          }
          case 'repeater':
            newItem[field.field] = [];
            break;
          case 'custom':
            newItem[field.field] = '';
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
      this.nestedRenderers.clear();
      this.render(this.container);
    }
  }

  private isFieldRequired(field: IRepeaterItemFieldConfig): boolean {
    return field.rules?.some(rule => rule.type === 'required') ?? false;
  }

  private getFieldErrors(index: number, fieldName: string): string[] {
    if (this.parentFieldPath) {
      const relativeKey = `[${index}].${fieldName}`;
      const relativeError = this.errors[relativeKey];
      if (relativeError) {
        return relativeError;
      }
    }

    const errorKey = `${this.fieldName}[${index}].${fieldName}`;
    return this.errors[errorKey] || [];
  }

  private hasFieldError(index: number, fieldName: string): boolean {
    return this.getFieldErrors(index, fieldName).length > 0;
  }

  private getCountText(count: number): string {
    return getRepeaterCountText(count, (this.config as any)?.countLabelVariants as any);
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

    const formFieldConfig = this.convertToFormFieldConfig(field);

    let inputClass = CSS_CLASSES.FORM_CONTROL;
    if (hasError) {
      inputClass += ` ${CSS_CLASSES.ERROR}`;
    }

    const containerDataAttributes: Record<string, string> = {
      'field-path': fieldNamePath,
      'repeater-field': this.fieldName,
      'repeater-index': String(itemIndex),
      'repeater-item-field': field.field,
    };

    const inputDataAttributes: Record<string, string> = {
      'item-index': String(itemIndex),
      'field-name': field.field,
      'repeater-field': this.fieldName,
      'repeater-index': String(itemIndex),
      'repeater-item-field': field.field,
    };

    const context: IRenderContext = {
      containerClass: hasError
        ? `${CSS_CLASSES.FORM_GROUP} ${CSS_CLASSES.ERROR}`
        : CSS_CLASSES.FORM_GROUP,
      labelClass: CSS_CLASSES.FORM_LABEL,
      inputClass: inputClass,
      checkboxContainerClass: CSS_CLASSES.FORM_CHECKBOX,
      checkboxLabelClass: CSS_CLASSES.FORM_CHECKBOX_LABEL,
      checkboxInputClass: CSS_CLASSES.FORM_CHECKBOX_INPUT,
      fieldNamePath: fieldNamePath,
      showErrors: hasError,
      errors: errors,
      containerDataAttributes,
      inputDataAttributes,
    };

    if (field.type === 'image') {
      context.containerDataAttributes = {
        ...context.containerDataAttributes,
        'field-name': fieldNamePath,
      };
    }

    if (field.type === 'repeater' && this.canNestRepeater(field)) {
      return this.generateNestedRepeaterHTML(field, itemIndex, value);
    }

    const renderer = this.rendererFactory.getRenderer(field.type);

    return renderer.render(fieldId, formFieldConfig, value, required, context);
  }

  private canNestRepeater(field: IRepeaterItemFieldConfig): boolean {
    const maxDepth = field.repeaterConfig?.maxNestingDepth ?? this.maxNestingDepth;
    return this.nestingDepth < maxDepth;
  }

  private getFullFieldPath(index: number, fieldName: string): string {
    if (this.parentFieldPath) {
      return `${this.parentFieldPath}[${index}].${fieldName}`;
    }
    return `${this.fieldName}[${index}].${fieldName}`;
  }

  private getNestedErrors(index: number, fieldName: string): Record<string, string[]> {
    const basePath = this.getFullFieldPath(index, fieldName);
    const nestedErrors: Record<string, string[]> = {};

    Object.keys(this.errors).forEach(key => {
      if (key.startsWith(`${basePath}[`)) {
        const relativeKey = key.slice(basePath.length);
        nestedErrors[relativeKey] = this.errors[key];
      } else if (this.parentFieldPath && key.startsWith(`[${index}].${fieldName}[`)) {
        const relativeKey = key.slice(`[${index}].${fieldName}`.length);
        nestedErrors[relativeKey] = this.errors[key];
      }
    });

    return nestedErrors;
  }

  private generateNestedRepeaterHTML(
    field: IRepeaterItemFieldConfig,
    itemIndex: number,
    value: any
  ): string {
    const nestedFieldName = this.getFullFieldPath(itemIndex, field.field);
    const nestedValue = Array.isArray(value) ? value : [];
    const nestedErrors = this.getNestedErrors(itemIndex, field.field);
    const nestedConfig = field.repeaterConfig || { fields: [] };

    const containerId = `nested-repeater-${nestedFieldName.replaceAll(/[.[\]]/g, '-')}`;

    const nestedRenderer = new RepeaterControlRenderer({
      fieldName: nestedFieldName,
      label: field.label,
      rules: field.rules || [],
      errors: nestedErrors,
      config: nestedConfig,
      value: nestedValue,
      onChange: (newValue: any[]) => {
        this.onFieldChange(itemIndex, field.field, newValue);
      },
      nestingDepth: this.nestingDepth + 1,
      maxNestingDepth: nestedConfig.maxNestingDepth ?? this.maxNestingDepth,
      parentFieldPath: this.getFullFieldPath(itemIndex, field.field),
    });

    this.nestedRenderers.set(`${itemIndex}-${field.field}`, nestedRenderer);

    return `<div class="${CSS_CLASSES.FORM_GROUP}" data-field-name="${nestedFieldName}">
      <div class="${CSS_CLASSES.REPEATER_CONTROL_CONTAINER}" data-nested-repeater="${containerId}" data-field-name="${nestedFieldName}"></div>
    </div>`;
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

    const extendedField = field as IRepeaterItemFieldConfig & {
      imageUploadConfig?: any;
      apiSelectConfig?: any;
      customFieldConfig?: any;
    };

    if (field.type === 'image' && extendedField.imageUploadConfig) {
      baseConfig.imageUploadConfig = extendedField.imageUploadConfig;
    }

    if (field.type === 'api-select' && extendedField.apiSelectConfig) {
      baseConfig.apiSelectConfig = extendedField.apiSelectConfig;
    }

    if (field.type === 'custom' && extendedField.customFieldConfig) {
      baseConfig.customFieldConfig = extendedField.customFieldConfig;
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
    <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM} ${isCollapsed ? CSS_CLASSES.REPEATER_CONTROL_ITEM_COLLAPSED : ''}" data-item-index="${index}">
      <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM_HEADER}">
        <span class="${CSS_CLASSES.REPEATER_CONTROL_ITEM_TITLE}">${itemTitle} #${index + 1}</span>
        <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM_ACTIONS}">
          <button
            type="button"
            class="${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_COLLAPSE}"
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
              class="${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_MOVE}"
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
              class="${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_MOVE}"
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
            class="${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_REMOVE}"
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
        <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM_FIELDS}">
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
    <div class="${CSS_CLASSES.REPEATER_CONTROL_CONTAINER}" data-field-name="${this.fieldName}">
      <div class="${CSS_CLASSES.REPEATER_CONTROL_HEADER}">
        <label class="${CSS_CLASSES.REPEATER_CONTROL_LABEL}">
          ${this.label}
          ${this.isRequired() ? `<span class="${CSS_CLASSES.REQUIRED}">*</span>` : ''}
        </label>
        ${
          itemCount > 0
            ? `
          <span class="${CSS_CLASSES.REPEATER_CONTROL_COUNT}">
            ${this.getCountText(itemCount)}
          </span>
        `
            : ''
        }
      </div>

      <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEMS}">
        ${itemsHTML}
      </div>

      <button
        type="button"
        class="${CSS_CLASSES.REPEATER_CONTROL_ADD_BTN}"
        data-action="add"
        ${!canAdd ? 'disabled' : ''}
      >
        + ${this.config.addButtonText || 'Добавить'}
      </button>

      ${
        effectiveMin || max
          ? `
        <div class="${CSS_CLASSES.REPEATER_CONTROL_HINT}">
          ${
            effectiveMin && itemCount < effectiveMin
              ? `
            <span class="${CSS_CLASSES.REPEATER_CONTROL_HINT_ERROR}">Минимум: ${effectiveMin}</span>
          `
              : ''
          }
          ${
            max && itemCount >= max
              ? `
            <span class="${CSS_CLASSES.REPEATER_CONTROL_HINT_WARNING}">Максимум: ${max}</span>
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
    container.querySelectorAll('[data-control-initialized]').forEach(el => {
      const htmlEl = el as HTMLElement;
      delete htmlEl.dataset.controlInitialized;
    });
    container.innerHTML = this.generateHTML();
    this.attachEventListeners();
    this.renderNestedRepeaters();

    if (this.onAfterRender) {
      this.onAfterRender();
    }

    const event = new CustomEvent('repeater-rendered', {
      bubbles: true,
      detail: { container },
    });
    container.dispatchEvent(event);
  }

  private renderNestedRepeaters(): void {
    if (!this.container) {
      return;
    }

    this.nestedRenderers.forEach(renderer => {
      const nestedFieldName = renderer.fieldName;

      let nestedContainer = this.container?.querySelector(
        `[data-nested-repeater][data-field-name="${nestedFieldName}"]`
      ) as HTMLElement;

      if (!nestedContainer) {
        nestedContainer = this.container?.querySelector(
          `[data-field-name="${nestedFieldName}"]`
        ) as HTMLElement;
      }

      if (!nestedContainer) {
        const allContainers = this.container?.querySelectorAll(`[data-field-name]`) || [];
        for (const container of Array.from(allContainers)) {
          const fieldName = (container as HTMLElement).dataset.fieldName;
          if (fieldName === nestedFieldName) {
            nestedContainer = container as HTMLElement;
            break;
          }
        }
      }

      if (nestedContainer) {
        const targetContainer = nestedContainer.querySelector(
          `.${CSS_CLASSES.REPEATER_CONTROL_CONTAINER}`
        ) as HTMLElement;
        if (targetContainer) {
          renderer.render(targetContainer);
        } else {
          renderer.render(nestedContainer);
        }
      }
    });
  }

  private attachEventListeners(): void {
    if (!this.container) {
      return;
    }

    const addButton = this.container.querySelector('[data-action="add"]');
    addButton?.addEventListener('click', () => this.addItem());

    const actionButtons = this.container.querySelectorAll(
      `.${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN}`
    );
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
    const previousErrors = this.errors;

    this.errors = errors;

    this.nestedRenderers.forEach((renderer, key) => {
      const [itemIndexStr, fieldName] = key.split('-');
      const itemIndex = Number.parseInt(itemIndexStr, 10);
      const nestedErrors = this.getNestedErrors(itemIndex, fieldName);
      renderer.updateErrors(nestedErrors);
    });

    if (this.container && Object.keys(errors).length > 0) {
      this.updateErrorsInDOM();
    } else if (
      this.container &&
      Object.keys(errors).length === 0 &&
      Object.keys(previousErrors).length > 0
    ) {
      this.updateErrorsInDOM();
    }
  }

  private updateErrorsInDOM(): void {
    if (!this.container) {
      return;
    }

    const currentErrors = { ...this.errors };

    const items = this.container.querySelectorAll(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM}`);

    items.forEach((item, index) => {
      const itemElement = item as HTMLElement;
      const fields = itemElement.querySelectorAll(`.${CSS_CLASSES.FORM_GROUP}`);

      fields.forEach(fieldGroup => {
        const fieldElement = fieldGroup as HTMLElement;
        let fieldNameAttr =
          fieldElement.dataset.fieldName ||
          fieldElement.dataset.fieldPath ||
          fieldElement.dataset.repeaterItemField ||
          fieldElement.querySelector('[name]')?.getAttribute('name') ||
          fieldElement.querySelector('[data-field-name]')?.getAttribute('data-field-name');

        if (!fieldNameAttr) {
          return;
        }

        if (fieldNameAttr.includes('[') && fieldNameAttr.includes(']')) {
          const match = fieldNameAttr.match(/\[(\d+)]\.(.+)$/);
          if (match) {
            fieldNameAttr = match[2];
          } else {
            const parts = fieldNameAttr.split('.');
            fieldNameAttr = parts.at(-1);
          }
        }

        const fullFieldPath = `${this.fieldName}[${index}].${fieldNameAttr}`;
        const fieldErrors = currentErrors[fullFieldPath];
        const hasError = fieldErrors && fieldErrors.length > 0;

        if (hasError) {
          fieldElement.classList.add(CSS_CLASSES.ERROR);

          const imageUploadField = fieldElement.querySelector(
            `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD}`
          ) as HTMLElement;
          if (imageUploadField) {
            const errorSpan = imageUploadField.querySelector(
              `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_ERROR}`
            ) as HTMLElement;
            if (errorSpan && fieldErrors.length > 0) {
              errorSpan.textContent = fieldErrors[0];
              errorSpan.classList.remove(CSS_CLASSES.BB_HIDDEN);
            }
          } else {
            const input = fieldElement.querySelector('input, textarea, select') as HTMLElement;
            if (input) {
              input.classList.add(CSS_CLASSES.ERROR);
            }

            let errorContainer = fieldElement.querySelector(
              `.${CSS_CLASSES.FORM_ERRORS}`
            ) as HTMLElement;
            if (!errorContainer) {
              errorContainer = document.createElement('div');
              errorContainer.className = CSS_CLASSES.FORM_ERRORS;
              errorContainer.dataset.field = fullFieldPath;
              fieldElement.append(errorContainer);
            }

            errorContainer.innerHTML = '';
            fieldErrors.forEach(error => {
              const errorSpan = document.createElement('span');
              errorSpan.className = CSS_CLASSES.ERROR;
              errorSpan.textContent = error;
              errorContainer.append(errorSpan);
            });
          }
        } else {
          fieldElement.classList.remove(CSS_CLASSES.ERROR);

          const input = fieldElement.querySelector('input, textarea, select') as HTMLElement;
          if (input) {
            input.classList.remove(CSS_CLASSES.ERROR);
          }

          const errorContainer = fieldElement.querySelector(
            `.${CSS_CLASSES.FORM_ERRORS}`
          ) as HTMLElement;
          if (errorContainer) {
            errorContainer.remove();
          }

          const imageUploadField = fieldElement.querySelector(
            `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD}`
          ) as HTMLElement;
          if (imageUploadField) {
            const errorSpan = imageUploadField.querySelector(
              `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD_ERROR}`
            ) as HTMLElement;
            if (errorSpan) {
              errorSpan.textContent = '';
              errorSpan.classList.add(CSS_CLASSES.BB_HIDDEN);
            }
          }
        }
      });
    });
  }

  public setValue(value: any[]): void {
    this.value = value;
    if (this.container) {
      this.render(this.container);
    }
  }

  public destroy(): void {
    this.nestedRenderers.forEach(renderer => {
      renderer.destroy();
    });
    this.nestedRenderers.clear();

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
