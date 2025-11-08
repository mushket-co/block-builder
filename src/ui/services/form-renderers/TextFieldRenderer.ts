import { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { BaseFieldRenderer } from './BaseFieldRenderer';

export class TextFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'text';

  protected renderInput(
    fieldId: string,
    field: IFormFieldConfig,
    value: any,
    required: string
  ): string {
    const escapedValue = this.getEscapedValue(value);
    const escapedPlaceholder = this.getEscapedPlaceholder(field.placeholder);

    return `
      <input
        type="text"
        id="${fieldId}"
        name="${field.field}"
        class="${CSS_CLASSES.FORM_CONTROL}"
        placeholder="${escapedPlaceholder}"
        value="${escapedValue}"
        ${required}
      />
    `;
  }
}
