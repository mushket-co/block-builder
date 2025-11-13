import { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IRenderContext } from './IRenderContext';

export class CustomFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'custom';

  render(
    _fieldId: string,
    field: IFormFieldConfig,
    value: any,
    required: string,
    context?: IRenderContext
  ): string {
    const customFieldConfig = field.customFieldConfig || { rendererId: '' };
    const configJson = JSON.stringify({
      field: field.field,
      fieldPath: context?.fieldNamePath || field.field,
      label: field.label,
      rules: field.rules || [],
      value: value || field.defaultValue || '',
      required: !!required,
      ...customFieldConfig,
    }).replaceAll('"', '&quot;');

    const escapedLabel = this.escapeHtml(field.label);
    const requiredMark = required ? '<span class="required">*</span>' : '';
    const baseContainerClass = context?.containerClass || CSS_CLASSES.FORM_GROUP;
    const containerClass = baseContainerClass.includes(CSS_CLASSES.CUSTOM_FIELD_CONTROL_CONTAINER)
      ? baseContainerClass
      : `${baseContainerClass} ${CSS_CLASSES.CUSTOM_FIELD_CONTROL_CONTAINER}`;

    const extraDataAttributes = this.buildDataAttributes(context?.containerDataAttributes);
    const fieldPathAttribute = context?.fieldNamePath
      ? ` data-field-path="${this.escapeHtml(context.fieldNamePath)}"`
      : '';
    const combinedDataAttributes = `${fieldPathAttribute}${
      extraDataAttributes ? ` ${extraDataAttributes}` : ''
    }`;

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
        class="${containerClass}"
        data-field-type="custom"
        data-field-name="${field.field}"
        ${combinedDataAttributes}
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

  private buildDataAttributes(attributes?: Record<string, string>): string {
    if (!attributes) {
      return '';
    }

    return Object.entries(attributes)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `data-${key}="${this.escapeHtml(value)}"`)
      .join(' ');
  }
}
