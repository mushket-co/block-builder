import { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { BaseFieldRenderer } from './BaseFieldRenderer';

export class CheckboxFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'checkbox';

  render(fieldId: string, field: IFormFieldConfig, value: any, required: string): string {
    const escapedLabel = this.escapeHtml(field.label);
    const checked = value ? 'checked' : '';

    const content = `
      <label class="block-builder-form-checkbox">
        <input
          type="checkbox"
          id="${fieldId}"
          name="${field.field}"
          class="block-builder-form-checkbox-input"
          ${checked}
        />
        <span class="block-builder-form-checkbox-label">${escapedLabel}</span>
      </label>
    `;

    return this.wrapInFormGroup(field, content);
  }

  protected renderInput(fieldId: string, field: IFormFieldConfig, value: any, required: string): string {
    return '';
  }
}

