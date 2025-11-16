import { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IRenderContext } from './IRenderContext';

export class CheckboxFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'checkbox';

  render(
    fieldId: string,
    field: IFormFieldConfig,
    value: any,
    _required: string,
    context?: IRenderContext
  ): string {
    const escapedLabel = this.escapeHtml(field.label);
    const checked = value ? 'checked' : '';
    const checkboxContainerClass = context?.checkboxContainerClass || CSS_CLASSES.FORM_CHECKBOX;
    const checkboxLabelClass = context?.checkboxLabelClass || CSS_CLASSES.FORM_CHECKBOX_LABEL;
    const checkboxInputClass = context?.checkboxInputClass || CSS_CLASSES.FORM_CHECKBOX_INPUT;
    const fieldName = this.getFieldName(context, field);
    const dataAttributes = this.getInputDataAttributes(context);

    const content = `
      <label class="${checkboxContainerClass}">
        <input
          type="checkbox"
          id="${fieldId}"
          name="${fieldName}"
          class="${checkboxInputClass}"
          ${checked}
          ${dataAttributes}
        />
        <span class="${checkboxLabelClass}">${escapedLabel}</span>
      </label>
    `;

    return this.wrapInFormGroup(field, content, context);
  }

  protected renderInput(
    _fieldId: string,
    _field: IFormFieldConfig,
    _value: any,
    _required: string,
    _context?: IRenderContext
  ): string {
    return '';
  }
}
