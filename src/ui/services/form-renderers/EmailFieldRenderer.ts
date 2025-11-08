import { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { BaseFieldRenderer } from './BaseFieldRenderer';

export class EmailFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'email';

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
        type="email"
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
