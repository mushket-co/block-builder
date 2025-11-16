import { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IRenderContext } from './IRenderContext';

export class RadioFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'radio';

  render(
    fieldId: string,
    field: IFormFieldConfig,
    value: any,
    required: string,
    context?: IRenderContext
  ): string {
    const escapedLabel = this.escapeHtml(field.label);
    const requiredMark = required ? `<span class="${CSS_CLASSES.REQUIRED}">*</span>` : '';
    const options = field.options || [];
    const labelClass = context?.labelClass || CSS_CLASSES.FORM_LABEL;
    const fieldName = this.getFieldName(context, field);
    const dataAttributes = this.getInputDataAttributes(context);

    const radioOptionsHTML = options
      .map((option, index) => {
        const optionId = `${fieldId}-${index}`;
        const escapedOptionLabel = this.escapeHtml(option.label);
        const escapedOptionValue =
          typeof option.value === 'string' ? this.escapeHtml(option.value) : option.value;
        const isChecked = option.value === value ? 'checked' : '';

        return `
        <label class="${CSS_CLASSES.FORM_RADIO}">
          <input
            type="radio"
            id="${optionId}"
            name="${fieldName}"
            value="${escapedOptionValue}"
            class="${CSS_CLASSES.FORM_RADIO_INPUT}"
            ${isChecked}
            ${required}
            ${dataAttributes}
          />
          <span class="${CSS_CLASSES.FORM_RADIO_LABEL}">${escapedOptionLabel}</span>
        </label>
      `;
      })
      .join('');

    const content = `
      <label class="${labelClass}">
        ${escapedLabel} ${requiredMark}
      </label>
      <div class="${CSS_CLASSES.FORM_RADIO_GROUP}">
        ${radioOptionsHTML}
      </div>
    `;

    return this.wrapInFormGroup(field, content, context);
  }

  protected renderInput(
    _fieldId: string,
    _field: IFormFieldConfig,
    _value: any,
    _required: string,
    _context?: IRenderContext
  ): string {
    return '';
  }
}
