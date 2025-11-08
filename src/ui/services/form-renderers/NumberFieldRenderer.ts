import { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { BaseFieldRenderer } from './BaseFieldRenderer';

export class NumberFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'number';

  protected renderInput(
    fieldId: string,
    field: IFormFieldConfig,
    value: any,
    required: string
  ): string {
    const escapedPlaceholder = this.getEscapedPlaceholder(field.placeholder);
    const numericValue = value !== null && value !== undefined ? value : '';

    return `
      <input
        type="number"
        id="${fieldId}"
        name="${field.field}"
        class="${CSS_CLASSES.FORM_CONTROL}"
        placeholder="${escapedPlaceholder}"
        value="${numericValue}"
        ${required}
      />
    `;
  }
}
