import { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { BaseFieldRenderer } from './BaseFieldRenderer';

export class RepeaterFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'repeater';

  render(_fieldId: string, field: IFormFieldConfig, value: any, _required: string): string {
    const repeaterConfig = field.repeaterConfig || { fields: [] };
    const configJson = JSON.stringify({
      field: field.field,
      label: field.label,
      rules: field.rules || [],
      value: value || [],
      ...repeaterConfig,
    }).replaceAll('"', '&quot;');

    return `
      <div
        class="${CSS_CLASSES.FORM_GROUP} ${CSS_CLASSES.REPEATER_CONTROL_CONTAINER}"
        data-field-type="repeater"
        data-field-name="${field.field}"
        data-repeater-config="${configJson}"
      >
      </div>
    `;
  }

  protected renderInput(
    _fieldId: string,
    _field: IFormFieldConfig,
    _value: any,
    _required: string
  ): string {
    return '';
  }
}
