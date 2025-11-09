import { IFormFieldConfig } from '../../../core/types/form';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IRenderContext } from './IRenderContext';

export class SelectFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'select';

  protected renderInput(
    fieldId: string,
    field: IFormFieldConfig,
    value: any,
    required: string,
    context?: IRenderContext
  ): string {
    const options = field.options || [];
    const inputClass = this.getInputClass(context);
    const fieldName = this.getFieldName(context, field);
    const dataAttributes = this.getInputDataAttributes(context);

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
      <select id="${fieldId}" name="${fieldName}" class="${inputClass}" ${required} ${dataAttributes}>
        <option value="">Выберите...</option>
        ${optionsHTML}
      </select>
    `;
  }
}
