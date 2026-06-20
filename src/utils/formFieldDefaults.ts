import type { IFormFieldConfig, IRepeaterItemFieldConfig } from '../core/types/form';

type TFieldDefaultSource = Pick<
  IFormFieldConfig | IRepeaterItemFieldConfig,
  'type' | 'defaultValue' | 'multiple' | 'apiSelectConfig'
>;

export function resolveFormFieldDefaultValue(field: TFieldDefaultSource): unknown {
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }

  switch (field.type) {
    case 'checkbox':
      return false;
    case 'number':
      return 0;
    case 'api-select':
      return field.apiSelectConfig?.multiple ? [] : null;
    case 'select':
      return field.multiple ? [] : '';
    case 'image':
    case 'file':
      return field.multiple ? [] : '';
    case 'repeater':
      return [];
    case 'custom':
      return '';
    default:
      return '';
  }
}
