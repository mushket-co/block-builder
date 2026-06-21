import type {
  IFormFieldConfig,
  IOptionsFromConfig,
  IOptionsFromGroup,
  IRepeaterItemFieldConfig,
} from '../core/types/form';
import { isFieldVisible } from './formFieldHelpers';

export interface IResolvedSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

function isOptionsFromGroup(value: unknown): value is IOptionsFromGroup {
  return (
    typeof value === 'object' &&
    value !== null &&
    'group' in value &&
    'options' in value &&
    Array.isArray((value as IOptionsFromGroup).options)
  );
}

function evaluateOptionsFromWhen(
  when: NonNullable<IOptionsFromConfig['when']>,
  formData: Record<string, unknown>,
  itemData?: Record<string, unknown>
): boolean {
  const dataSource = formData;
  const dependentValue = dataSource[when.field] ?? itemData?.[when.field];
  const operator = when.operator || 'equals';

  switch (operator) {
    case 'equals':
      return dependentValue === when.value;
    case 'notEquals':
      return dependentValue !== when.value;
    case 'in':
      return Array.isArray(when.value) && when.value.includes(dependentValue as never);
    case 'notIn':
      return Array.isArray(when.value) && !when.value.includes(dependentValue as never);
    default:
      return dependentValue === when.value;
  }
}

function expandMappedOption(
  mapped: unknown,
  options: IResolvedSelectOption[]
): void {
  if (isOptionsFromGroup(mapped)) {
    mapped.options.forEach(option => {
      options.push({
        value: option.value,
        label: option.label,
        disabled: option.disabled,
        group: mapped.group,
      });
    });
    return;
  }

  if (
    typeof mapped === 'object' &&
    mapped !== null &&
    'value' in mapped &&
    'label' in mapped
  ) {
    const option = mapped as IResolvedSelectOption;
    options.push({
      value: option.value,
      label: option.label,
      disabled: option.disabled,
      group: option.group,
    });
  }
}

export function resolveDynamicSelectOptions(
  field: IFormFieldConfig | IRepeaterItemFieldConfig,
  formData: Record<string, unknown>,
  itemData?: Record<string, unknown>
): IResolvedSelectOption[] {
  if (!field.optionsFrom) {
    return (field.options || []).map(option => ({
      value: option.value,
      label: option.label,
      disabled: option.disabled,
    }));
  }

  const { source, when, map } = field.optionsFrom;

  if (when && !evaluateOptionsFromWhen(when, formData, itemData)) {
    return [];
  }

  const sourceValue = formData[source];
  if (!Array.isArray(sourceValue)) {
    return [];
  }

  const options: IResolvedSelectOption[] = [];

  sourceValue.forEach((item, index) => {
    if (map) {
      expandMappedOption(map(item, index, sourceValue), options);
      return;
    }

    if (typeof item === 'object' && item !== null && 'value' in item && 'label' in item) {
      expandMappedOption(item, options);
    }
  });

  return options;
}

export function isDynamicSelectFieldVisible(
  field: IFormFieldConfig | IRepeaterItemFieldConfig,
  formData: Record<string, unknown>,
  itemData?: Record<string, unknown>
): boolean {
  if (!isFieldVisible(field, formData, itemData)) {
    return false;
  }

  if (!field.optionsFrom?.when) {
    return true;
  }

  return evaluateOptionsFromWhen(field.optionsFrom.when, formData, itemData);
}
