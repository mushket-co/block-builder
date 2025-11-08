import { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { BaseFieldRenderer } from './BaseFieldRenderer';

export class SpacingFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'spacing';

  render(_fieldId: string, field: IFormFieldConfig, value: any, required: string): string {
    const spacingConfig = field.spacingConfig || {};
    const configJson = JSON.stringify({
      field: field.field,
      label: field.label,
      required: !!required,
      value: value || {},
      ...spacingConfig,
    }).replaceAll('"', '&quot;');

    return `
      <div
        class="${CSS_CLASSES.FORM_GROUP} ${CSS_CLASSES.SPACING_CONTROL_CONTAINER}"
        data-field-type="spacing"
        data-field-name="${field.field}"
        data-spacing-config="${configJson}"
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
