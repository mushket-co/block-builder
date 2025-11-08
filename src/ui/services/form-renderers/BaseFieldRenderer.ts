import { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { IFieldRenderer } from './IFieldRenderer';

export abstract class BaseFieldRenderer implements IFieldRenderer {
  abstract readonly fieldType: string;

  render(fieldId: string, field: IFormFieldConfig, value: any, required: string): string {
    const labelHTML = this.renderLabel(fieldId, field, required);
    const inputHTML = this.renderInput(fieldId, field, value, required);

    return this.wrapInFormGroup(field, labelHTML + inputHTML);
  }

  protected abstract renderInput(
    fieldId: string,
    field: IFormFieldConfig,
    value: any,
    required: string
  ): string;

  protected renderLabel(fieldId: string, field: IFormFieldConfig, required: string): string {
    const escapedLabel = this.escapeHtml(field.label);
    const requiredMark = required ? '<span class="required">*</span>' : '';

    return `
      <label for="${fieldId}" class="block-builder-form-label">
        ${escapedLabel} ${requiredMark}
      </label>
    `;
  }

  protected wrapInFormGroup(field: IFormFieldConfig, content: string): string {
    return `
      <div class="${CSS_CLASSES.FORM_GROUP}" data-field-name="${field.field}">
        ${content}
      </div>
    `;
  }

  protected escapeHtml(text: string | number | null | undefined): string {
    if (text === null || text === undefined) {
      return '';
    }
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  protected getEscapedValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    return typeof value === 'string' ? this.escapeHtml(value) : String(value);
  }

  protected getEscapedPlaceholder(placeholder?: string): string {
    return placeholder ? this.escapeHtml(placeholder) : '';
  }
}
