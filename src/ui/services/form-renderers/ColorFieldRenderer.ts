import { IFormFieldConfig } from '../../../core/types/form';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IRenderContext } from './IRenderContext';

export class ColorFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'color';

  protected renderInput(
    fieldId: string,
    field: IFormFieldConfig,
    value: any,
    required: string,
    context?: IRenderContext
  ): string {
    const colorValue = value || '#333333';
    const inputClass = this.getInputClass(context);
    const fieldName = this.getFieldName(context, field);
    const dataAttributes = this.getInputDataAttributes(context);

    return `
      <input
        type="color"
        id="${fieldId}"
        name="${fieldName}"
        class="${inputClass}"
        value="${colorValue}"
        ${required}
        ${dataAttributes}
      />
    `;
  }
}
