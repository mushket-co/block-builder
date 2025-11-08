import { IFormFieldConfig } from '../../../core/types/form';
import { BaseFieldRenderer } from './BaseFieldRenderer';

export class RadioFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'radio';

  render(fieldId: string, field: IFormFieldConfig, value: any, required: string): string {
    const escapedLabel = this.escapeHtml(field.label);
    const requiredMark = required ? '<span class="required">*</span>' : '';
    const options = field.options || [];

    const radioOptionsHTML = options
      .map((option, index) => {
        const optionId = `${fieldId}-${index}`;
        const escapedOptionLabel = this.escapeHtml(option.label);
        const escapedOptionValue =
          typeof option.value === 'string' ? this.escapeHtml(option.value) : option.value;
        const isChecked = option.value === value ? 'checked' : '';

        return `
        <label class="block-builder-form-radio">
          <input
            type="radio"
            id="${optionId}"
            name="${field.field}"
            value="${escapedOptionValue}"
            class="block-builder-form-radio-input"
            ${isChecked}
            ${required}
          />
          <span class="block-builder-form-radio-label">${escapedOptionLabel}</span>
        </label>
      `;
      })
      .join('');

    const content = `
      <label class="block-builder-form-label">
        ${escapedLabel} ${requiredMark}
      </label>
      <div class="block-builder-form-radio-group">
        ${radioOptionsHTML}
      </div>
    `;

    return this.wrapInFormGroup(field, content);
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
