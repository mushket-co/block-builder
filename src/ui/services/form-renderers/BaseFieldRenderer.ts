import { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { IFieldRenderer } from './IFieldRenderer';
import { IRenderContext } from './IRenderContext';

export abstract class BaseFieldRenderer implements IFieldRenderer {
  abstract readonly fieldType: string;

  render(
    fieldId: string,
    field: IFormFieldConfig,
    value: any,
    required: string,
    context?: IRenderContext
  ): string {
    const labelHTML = this.renderLabel(fieldId, field, required, context);
    const inputHTML = this.renderInput(fieldId, field, value, required, context);
    const errorHTML = this.renderErrors(context);

    return this.wrapInFormGroup(field, labelHTML + inputHTML + errorHTML, context);
  }

  protected abstract renderInput(
    fieldId: string,
    field: IFormFieldConfig,
    value: any,
    required: string,
    context?: IRenderContext
  ): string;

  protected renderLabel(
    fieldId: string,
    field: IFormFieldConfig,
    required: string,
    context?: IRenderContext
  ): string {
    const escapedLabel = this.escapeHtml(field.label);
    const requiredMark = required ? '<span class="required">*</span>' : '';
    const labelClass = context?.labelClass || 'block-builder-form-label';

    return `
      <label for="${fieldId}" class="${labelClass}">
        ${escapedLabel} ${requiredMark}
      </label>
    `;
  }

  protected wrapInFormGroup(
    field: IFormFieldConfig,
    content: string,
    context?: IRenderContext
  ): string {
    const containerClass = context?.containerClass || CSS_CLASSES.FORM_GROUP;
    const fieldName = context?.fieldNamePath || field.field;

    // Собираем data-атрибуты
    const dataAttributes: string[] = [`data-field-name="${fieldName}"`];

    if (context?.containerDataAttributes) {
      Object.entries(context.containerDataAttributes).forEach(([key, value]) => {
        dataAttributes.push(`data-${key}="${this.escapeHtml(value)}"`);
      });
    }

    const dataAttrsString = dataAttributes.join(' ');

    return `
      <div class="${containerClass}" ${dataAttrsString}>
        ${content}
      </div>
    `;
  }

  protected renderErrors(context?: IRenderContext): string {
    if (!context?.showErrors || !context.errors || context.errors.length === 0) {
      return '';
    }

    const errorMessage = this.escapeHtml(context.errors[0]);
    return `<div class="${CSS_CLASSES.FORM_ERRORS}"><div class="${CSS_CLASSES.ERROR}">${errorMessage}</div></div>`;
  }

  protected getInputClass(context?: IRenderContext, defaultClass?: string): string {
    if (context?.inputClass) {
      return context.inputClass;
    }
    return defaultClass || CSS_CLASSES.FORM_CONTROL;
  }

  protected getInputDataAttributes(context?: IRenderContext): string {
    if (!context?.inputDataAttributes) {
      return '';
    }

    return Object.entries(context.inputDataAttributes)
      .map(([key, value]) => `data-${key}="${this.escapeHtml(value)}"`)
      .join(' ');
  }

  protected getFieldName(context?: IRenderContext, field?: IFormFieldConfig): string {
    return context?.fieldNamePath || field?.field || '';
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
