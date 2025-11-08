import { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { BaseFieldRenderer } from './BaseFieldRenderer';

export class FileFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'file';

  protected renderInput(fieldId: string, field: IFormFieldConfig, value: any, required: string): string {
    return `
      <input
        type="file"
        id="${fieldId}"
        name="${field.field}"
        class="${CSS_CLASSES.FORM_CONTROL}"
        ${required}
      />
    `;
  }
}

