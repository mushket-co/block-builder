import { IFormFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IRenderContext } from './IRenderContext';

export class ApiSelectFieldRenderer extends BaseFieldRenderer {
  readonly fieldType = 'api-select';

  render(
    _fieldId: string,
    field: IFormFieldConfig,
    value: any,
    _required: string,
    context?: IRenderContext
  ): string {
    const apiSelectConfig = field.apiSelectConfig || { url: '', multiple: false };
    const configData = {
      field: field.field,
      fieldPath: context?.fieldNamePath || field.field,
      label: field.label,
      rules: field.rules || [],
      value: value || (apiSelectConfig.multiple ? [] : null),
      config: apiSelectConfig,
      ...apiSelectConfig,
    };

    const configJson = JSON.stringify(configData).replaceAll('"', '&quot;');

    const baseContainerClass = context?.containerClass || CSS_CLASSES.FORM_GROUP;
    const containerClass = baseContainerClass.includes(CSS_CLASSES.API_SELECT_CONTROL_CONTAINER)
      ? baseContainerClass
      : `${baseContainerClass} ${CSS_CLASSES.API_SELECT_CONTROL_CONTAINER}`;

    const extraDataAttributes = this.buildDataAttributes(context?.containerDataAttributes);
    const fieldPathAttribute = context?.fieldNamePath
      ? ` data-field-path="${this.escapeHtml(context.fieldNamePath)}"`
      : '';
    const combinedDataAttributes = `${fieldPathAttribute}${extraDataAttributes ? ` ${extraDataAttributes}` : ''}`;

    return `
      <div
        class="${containerClass}"
        data-field-type="api-select"
        data-field-name="${field.field}"
        ${combinedDataAttributes}
        data-api-select-config="${configJson}"
      >
        <div class="${CSS_CLASSES.API_SELECT_PLACEHOLDER} ${CSS_CLASSES.BB_PLACEHOLDER_BOX}">
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

  private buildDataAttributes(attributes?: Record<string, string>): string {
    if (!attributes) {
      return '';
    }

    return Object.entries(attributes)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `data-${key}="${this.escapeHtml(value)}"`)
      .join(' ');
  }
}
