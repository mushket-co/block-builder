import { IFormFieldConfig } from '../../../core/types/form';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IRenderContext } from './IRenderContext';

export class TextFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'text';

  protected renderInput(
    fieldId: string,
    field: IFormFieldConfig,
    value: any,
    required: string,
    context?: IRenderContext
  ): string {
    const escapedValue = this.getEscapedValue(value);
    const escapedPlaceholder = this.getEscapedPlaceholder(field.placeholder);
    const inputClass = this.getInputClass(context);
    const fieldName = this.getFieldName(context, field);
    const dataAttributes = this.getInputDataAttributes(context);

    return `
      <input
        type="text"
        id="${fieldId}"
        name="${fieldName}"
        class="${inputClass}"
        placeholder="${escapedPlaceholder}"
        value="${escapedValue}"
        ${required}
        ${dataAttributes}
      />
    `;
  }
}
