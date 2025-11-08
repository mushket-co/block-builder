import { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { BaseFieldRenderer } from './BaseFieldRenderer';

export class ColorFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'color';

  protected renderInput(
    fieldId: string,
    field: IFormFieldConfig,
    value: any,
    required: string
  ): string {
    const colorValue = value || '#333333';

    return `
      <input
        type="color"
        id="${fieldId}"
        name="${field.field}"
        class="${CSS_CLASSES.FORM_CONTROL}"
        value="${colorValue}"
        ${required}
      />
    `;
  }
}
