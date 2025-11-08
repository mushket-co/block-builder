import { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { BaseFieldRenderer } from './BaseFieldRenderer';

export class CustomFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'custom';

  render(_fieldId: string, field: IFormFieldConfig, value: any, required: string): string {
    const customFieldConfig = field.customFieldConfig || { rendererId: '' };
    const configJson = JSON.stringify({
      field: field.field,
      label: field.label,
      rules: field.rules || [],
      value: value || field.defaultValue || '',
      required: !!required,
      ...customFieldConfig,
    }).replaceAll('"', '&quot;');

    const escapedLabel = this.escapeHtml(field.label);
    const requiredMark = required ? '<span class="required">*</span>' : '';

    const content = `
      <label class="block-builder-form-label">
        ${escapedLabel} ${requiredMark}
      </label>
      <div class="custom-field-placeholder bb-placeholder-box">
        ⏳ Инициализация кастомного поля...
      </div>
    `;

    return `
      <div
        class="${CSS_CLASSES.FORM_GROUP} ${CSS_CLASSES.CUSTOM_FIELD_CONTROL_CONTAINER}"
        data-field-type="custom"
        data-field-name="${field.field}"
        data-custom-field-config="${configJson}"
      >
        ${content}
      </div>
    `;
  }

  protected renderInput(
    _fieldId: string,
    _field: IFormFieldConfig,
    _value: any,
    _required: string
  ): string {
    return '';
  }
}
