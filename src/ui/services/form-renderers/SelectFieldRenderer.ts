import { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { BaseFieldRenderer } from './BaseFieldRenderer';

export class SelectFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'select';

  protected renderInput(
    fieldId: string,
    field: IFormFieldConfig,
    value: any,
    required: string
  ): string {
    const options = field.options || [];

    const optionsHTML = options
      .map(option => {
        const escapedLabel = this.escapeHtml(option.label);
        const escapedValue =
          typeof option.value === 'string' ? this.escapeHtml(option.value) : option.value;
        const selected = option.value === value ? 'selected' : '';

        return `<option value="${escapedValue}" ${selected}>${escapedLabel}</option>`;
      })
      .join('');

    return `
      <select id="${fieldId}" name="${field.field}" class="${CSS_CLASSES.FORM_CONTROL}" ${required}>
        <option value="">Выберите...</option>
        ${optionsHTML}
      </select>
    `;
  }
}
