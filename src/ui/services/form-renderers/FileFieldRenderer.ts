import { IFormFieldConfig } from '../../../core/types/form';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IRenderContext } from './IRenderContext';

export class FileFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'file';

  protected renderInput(
    fieldId: string,
    field: IFormFieldConfig,
    value: any,
    required: string,
    context?: IRenderContext
  ): string {
    const inputClass = this.getInputClass(context);
    const fieldName = this.getFieldName(context, field);
    const dataAttributes = this.getInputDataAttributes(context);

    return `
      <input
        type="file"
        id="${fieldId}"
        name="${fieldName}"
        class="${inputClass}"
        ${required}
        ${dataAttributes}
      />
    `;
  }
}
