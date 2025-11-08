import { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { BaseFieldRenderer } from './BaseFieldRenderer';

export class ApiSelectFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'api-select';

  render(_fieldId: string, field: IFormFieldConfig, value: any, _required: string): string {
    const apiSelectConfig = field.apiSelectConfig || { url: '', multiple: false };
    const configData = {
      field: field.field,
      label: field.label,
      rules: field.rules || [],
      value: value || (apiSelectConfig.multiple ? [] : null),
      ...apiSelectConfig,
    };
    
    const configJson = JSON.stringify(configData).replaceAll('"', '&quot;');

    return `
      <div
        class="${CSS_CLASSES.FORM_GROUP} ${CSS_CLASSES.API_SELECT_CONTROL_CONTAINER}"
        data-field-type="api-select"
        data-field-name="${field.field}"
        data-api-select-config="${configJson}"
      >
        <div class="api-select-placeholder bb-placeholder-box">
          ⏳ Инициализация API Select...
        </div>
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
