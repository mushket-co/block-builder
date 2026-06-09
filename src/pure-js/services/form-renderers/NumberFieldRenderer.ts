import { IFormFieldConfig } from '../../../core/types/form';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IRenderContext } from './IRenderContext';

export class NumberFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'number';

  protected renderInput(
    fieldId: string,
    field: IFormFieldConfig,
    value: any,
    required: string,
    context?: IRenderContext
  ): string {
    const escapedPlaceholder = this.getEscapedPlaceholder(field.placeholder);
    const numericValue = value !== null && value !== undefined ? value : '';
    const inputClass = this.getInputClass(context);
    const fieldName = this.getFieldName(context, field);
    const dataAttributes = this.getInputDataAttributes(context);

    return `
      <input
        type="number"
        id="${fieldId}"
        name="${fieldName}"
        class="${inputClass}"
        placeholder="${escapedPlaceholder}"
        value="${numericValue}"
        ${required}
        ${dataAttributes}
      />
    `;
  }
}
