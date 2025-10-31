/**
 * FormBuilder - отвечает только за генерацию HTML форм
 * Принцип единой ответственности (SRP)
 */

import { IFormFieldConfig } from '../../core/types/form';

/**
 * Алиас для конфигурации поля формы
 */
export type TFieldConfig = IFormFieldConfig;

export class FormBuilder {
  /**
   * Экранирование HTML для предотвращения XSS атак
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Генерация HTML для формы создания
   */
  generateCreateFormHTML(fields: TFieldConfig[]): string {
  return fields.map(field => this.generateFieldHTML(field, field.defaultValue)).join('');
  }

  /**
   * Генерация HTML для формы редактирования
   */
  generateEditFormHTML(fields: TFieldConfig[], currentProps: Record<string, any>): string {
  return fields.map(field => {
    const currentValue = currentProps[field.field] || field.defaultValue || '';
    return this.generateFieldHTML(field, currentValue);
  }).join('');
  }

  /**
   * Генерация HTML для отдельного поля
   */
  private generateFieldHTML(field: TFieldConfig, value: any): string {
  const fieldId = `field-${field.field}`;
  const required = field.rules?.some(rule => rule.type === 'required') ? 'required' : '';

  switch (field.type) {
    case 'textarea':
      return this.generateTextareaHTML(fieldId, field, value, required);

    case 'select':
      return this.generateSelectHTML(fieldId, field, value, required);

    case 'number':
      return this.generateNumberHTML(fieldId, field, value, required);

    case 'color':
      return this.generateColorHTML(fieldId, field, value, required);

    case 'url':
      return this.generateUrlHTML(fieldId, field, value, required);

    case 'checkbox':
      return this.generateCheckboxHTML(fieldId, field, value);

    case 'spacing':
      return this.generateSpacingPlaceholderHTML(fieldId, field, value, required);

    case 'repeater':
      return this.generateRepeaterPlaceholderHTML(fieldId, field, value, required);

    case 'api-select':
      return this.generateApiSelectPlaceholderHTML(fieldId, field, value, required);

    case 'custom':
      return this.generateCustomFieldPlaceholderHTML(fieldId, field, value, required);

    default: // text
      return this.generateTextHTML(fieldId, field, value, required);
  }
  }

  /**
   * Генерация textarea поля
   */
  private generateTextareaHTML(fieldId: string, field: TFieldConfig, value: any, required: string): string {
    const escapedValue = typeof value === 'string' ? this.escapeHtml(value) : value || '';
    const escapedPlaceholder = field.placeholder ? this.escapeHtml(field.placeholder) : '';
    const escapedLabel = this.escapeHtml(field.label);

    return `
    <div class="block-builder-form-group" data-field-name="${field.field}">
      <label for="${fieldId}" class="block-builder-form-label">
        ${escapedLabel} ${required ? '<span class="required">*</span>' : ''}
      </label>
      <textarea
        id="${fieldId}"
        name="${field.field}"
        class="block-builder-form-control"
        placeholder="${escapedPlaceholder}"
        ${required}
        rows="3"
      >${escapedValue}</textarea>
    </div>
  `;
  }

  /**
   * Генерация select поля
   */
  private generateSelectHTML(fieldId: string, field: TFieldConfig, value: any, required: string): string {
    const escapedLabel = this.escapeHtml(field.label);

    return `
    <div class="block-builder-form-group" data-field-name="${field.field}">
      <label for="${fieldId}" class="block-builder-form-label">
        ${escapedLabel} ${required ? '<span class="required">*</span>' : ''}
      </label>
      <select id="${fieldId}" name="${field.field}" class="block-builder-form-control" ${required}>
        <option value="">Выберите...</option>
        ${field.options?.map(option => {
          const escapedLabel = this.escapeHtml(option.label);
          const escapedValue = typeof option.value === 'string' ? this.escapeHtml(option.value) : option.value;
          return `<option value="${escapedValue}" ${option.value === value ? 'selected' : ''}>${escapedLabel}</option>`;
        }).join('') || ''}
      </select>
    </div>
  `;
  }

  /**
   * Генерация number поля
   */
  private generateNumberHTML(fieldId: string, field: TFieldConfig, value: any, required: string): string {
    const escapedLabel = this.escapeHtml(field.label);
    const escapedPlaceholder = field.placeholder ? this.escapeHtml(field.placeholder) : '';

    return `
    <div class="block-builder-form-group" data-field-name="${field.field}">
      <label for="${fieldId}" class="block-builder-form-label">
        ${escapedLabel} ${required ? '<span class="required">*</span>' : ''}
      </label>
      <input
        type="number"
        id="${fieldId}"
        name="${field.field}"
        class="block-builder-form-control"
        placeholder="${escapedPlaceholder}"
        value="${value || ''}"
        ${required}
      />
    </div>
  `;
  }

  /**
   * Генерация color поля
   */
  private generateColorHTML(fieldId: string, field: TFieldConfig, value: any, required: string): string {
    const escapedLabel = this.escapeHtml(field.label);

    return `
    <div class="block-builder-form-group" data-field-name="${field.field}">
      <label for="${fieldId}" class="block-builder-form-label">
        ${escapedLabel} ${required ? '<span class="required">*</span>' : ''}
      </label>
      <input
        type="color"
        id="${fieldId}"
        name="${field.field}"
        class="block-builder-form-control"
        value="${value || '#333333'}"
        ${required}
      />
    </div>
  `;
  }

  /**
   * Генерация URL поля
   */
  private generateUrlHTML(fieldId: string, field: TFieldConfig, value: any, required: string): string {
    const escapedLabel = this.escapeHtml(field.label);
    const escapedPlaceholder = field.placeholder ? this.escapeHtml(field.placeholder) : '';
    const escapedValue = typeof value === 'string' ? this.escapeHtml(value) : value || '';

    return `
    <div class="block-builder-form-group" data-field-name="${field.field}">
      <label for="${fieldId}" class="block-builder-form-label">
        ${escapedLabel} ${required ? '<span class="required">*</span>' : ''}
      </label>
      <input
        type="url"
        id="${fieldId}"
        name="${field.field}"
        class="block-builder-form-control"
        placeholder="${escapedPlaceholder}"
        value="${escapedValue}"
        ${required}
      />
    </div>
  `;
  }

  /**
   * Генерация checkbox поля
   */
  private generateCheckboxHTML(fieldId: string, field: TFieldConfig, value: any): string {
    const escapedLabel = this.escapeHtml(field.label);

    return `
    <div class="block-builder-form-group" data-field-name="${field.field}">
      <label class="block-builder-form-checkbox">
        <input
          type="checkbox"
          id="${fieldId}"
          name="${field.field}"
          class="block-builder-form-checkbox-input"
          ${value ? 'checked' : ''}
        />
        <span class="block-builder-form-checkbox-label">${escapedLabel}</span>
      </label>
    </div>
  `;
  }

  /**
   * Генерация text поля
   */
  private generateTextHTML(fieldId: string, field: TFieldConfig, value: any, required: string): string {
    const escapedLabel = this.escapeHtml(field.label);
    const escapedPlaceholder = field.placeholder ? this.escapeHtml(field.placeholder) : '';
    const escapedValue = typeof value === 'string' ? this.escapeHtml(value) : value || '';

    return `
    <div class="block-builder-form-group" data-field-name="${field.field}">
      <label for="${fieldId}" class="block-builder-form-label">
        ${escapedLabel} ${required ? '<span class="required">*</span>' : ''}
      </label>
      <input
        type="text"
        id="${fieldId}"
        name="${field.field}"
        class="block-builder-form-control"
        placeholder="${escapedPlaceholder}"
        value="${escapedValue}"
        ${required}
      />
    </div>
  `;
  }

  /**
   * Генерация контейнера для spacing поля
   * Будет инициализирован через SpacingControlRenderer в BlockUIController
   */
  private generateSpacingPlaceholderHTML(fieldId: string, field: TFieldConfig, value: any, required: string): string {
  const spacingConfig = field.spacingConfig || {};
  // Брекпоинты будут фильтрованы в SpacingControlRenderer с учетом лицензии
  // Здесь оставляем полную конфигурацию, фильтрация произойдет при рендеринге
  const configJson = JSON.stringify({
    field: field.field,
    label: field.label,
    required: !!required,
    value: value || {},
    ...spacingConfig
  }).replace(/"/g, '&quot;');

  return `
    <div
      class="block-builder-form-group spacing-control-container"
      data-field-type="spacing"
      data-field-name="${field.field}"
      data-spacing-config="${configJson}"
    >
      <!-- SpacingControl будет здесь отрендерен через SpacingControlRenderer -->
    </div>
  `;
  }

  /**
   * Генерация контейнера для repeater поля
   * Будет инициализирован через RepeaterControlRenderer в BlockUIController
   */
  private generateRepeaterPlaceholderHTML(fieldId: string, field: TFieldConfig, value: any, required: string): string {
  const repeaterConfig = field.repeaterConfig || { fields: [] };
  const configJson = JSON.stringify({
    field: field.field,
    label: field.label,
    rules: field.rules || [],
    value: value || [],
    ...repeaterConfig
  }).replace(/"/g, '&quot;');

  return `
    <div
      class="block-builder-form-group repeater-control-container"
      data-field-type="repeater"
      data-field-name="${field.field}"
      data-repeater-config="${configJson}"
    >
      <!-- RepeaterControl будет здесь отрендерен через RepeaterControlRenderer -->
    </div>
  `;
  }

  /**
   * Генерация контейнера для api-select поля
   * Будет инициализирован через ApiSelectControlRenderer в BlockUIController
   */
  private generateApiSelectPlaceholderHTML(_fieldId: string, field: TFieldConfig, value: any, required: string): string {
  const apiSelectConfig = field.apiSelectConfig || { url: '', multiple: false };
  const configJson = JSON.stringify({
    field: field.field,
    label: field.label,
    rules: field.rules || [],
    value: value || (apiSelectConfig.multiple ? [] : null),
    ...apiSelectConfig
  }).replace(/"/g, '&quot;');

  return `
    <div
      class="block-builder-form-group api-select-control-container"
      data-field-type="api-select"
      data-field-name="${field.field}"
      data-api-select-config="${configJson}"
    >
      <!-- Лейбл и контрол будут отрендерены через ApiSelectControlRenderer -->
      <div class="api-select-placeholder" style="padding: 10px; border: 1px dashed #ccc; border-radius: 4px; color: #999;">
        ⏳ Инициализация API Select...
      </div>
    </div>
  `;
  }

  /**
   * Генерация контейнера для кастомного поля
   * Будет инициализирован через CustomFieldControlRenderer в BlockUIController
   */
  private generateCustomFieldPlaceholderHTML(fieldId: string, field: TFieldConfig, value: any, required: string): string {
  const customFieldConfig = field.customFieldConfig || { rendererId: '' };
  const configJson = JSON.stringify({
    field: field.field,
    label: field.label,
    rules: field.rules || [],
    value: value || field.defaultValue || '',
    required: !!required,
    ...customFieldConfig
  }).replace(/"/g, '&quot;');

  return `
    <div
      class="block-builder-form-group custom-field-control-container"
      data-field-type="custom"
      data-field-name="${field.field}"
      data-custom-field-config="${configJson}"
    >
      <label class="block-builder-form-label">
        ${field.label} ${required ? '<span class="required">*</span>' : ''}
      </label>
      <div class="custom-field-placeholder" style="padding: 10px; border: 1px dashed #ccc; border-radius: 4px; color: #999;">
        ⏳ Инициализация кастомного поля...
      </div>
    </div>
  `;
  }

  /**
   * Валидация формы
   */
  validateForm(props: Record<string, any>, fields: TFieldConfig[]): { valid: boolean; message?: string } {
  for (const field of fields) {
    const value = props[field.field];
    const rules = field.rules || [];

    for (const rule of rules) {
      // Валидация обязательности поля
      if (rule.type === 'required' && (!value || value.toString().trim() === '')) {
        return {
          valid: false,
          message: `${field.label}: ${rule.message}`
        };
      }

      // Валидация email адреса
      if (rule.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return {
          valid: false,
          message: `${field.label}: ${rule.message}`
        };
      }

      // Валидация URL адреса
      if (rule.type === 'url' && value && !/^https?:\/\/.+/.test(value)) {
        return {
          valid: false,
          message: `${field.label}: ${rule.message}`
        };
      }

      // Валидация минимального значения
      if (rule.type === 'min' && value && Number(value) < rule.value!) {
        return {
          valid: false,
          message: `${field.label}: ${rule.message}`
        };
      }

      // Валидация максимального значения
      if (rule.type === 'max' && value && Number(value) > rule.value!) {
        return {
          valid: false,
          message: `${field.label}: ${rule.message}`
        };
      }

      // Валидация минимальной длины
      if (rule.type === 'minLength' && value && value.length < rule.value!) {
        return {
          valid: false,
          message: `${field.label}: ${rule.message}`
        };
      }

      // Валидация максимальной длины
      if (rule.type === 'maxLength' && value && value.length > rule.value!) {
        return {
          valid: false,
          message: `${field.label}: ${rule.message}`
        };
      }
    }
  }

  return { valid: true };
  }
}

