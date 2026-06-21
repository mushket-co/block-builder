import type {
  IFormFieldConfig,
  IRepeaterItemFieldConfig,
} from '../core/types/form';
import {
  type IResolvedSelectOption,
  resolveDynamicSelectOptions,
} from './resolveDynamicSelectOptions';

export function areSelectValuesEqual(
  current: unknown,
  next: unknown,
  multiple: boolean
): boolean {
  if (multiple) {
    const currentValues = Array.isArray(current) ? current : [];
    const nextValues = Array.isArray(next) ? next : [];
    return (
      currentValues.length === nextValues.length &&
      currentValues.every((value, index) => value === nextValues[index])
    );
  }

  return current === next;
}

export function pruneSelectValueByOptions(
  modelValue: unknown,
  options: IResolvedSelectOption[],
  multiple: boolean
): unknown {
  const allowedValues = new Set(options.map(option => option.value));

  if (multiple) {
    const currentValues = Array.isArray(modelValue) ? modelValue : [];
    return currentValues.filter(value => allowedValues.has(value as string | number));
  }

  if (modelValue === null || modelValue === undefined || modelValue === '') {
    return modelValue;
  }

  return allowedValues.has(modelValue as string | number) ? modelValue : '';
}

export function fieldTreeHasOptionsFromSource(
  fields: Array<IFormFieldConfig | IRepeaterItemFieldConfig>,
  sourceFieldName: string
): boolean {
  for (const field of fields) {
    if (field.optionsFrom?.source === sourceFieldName) {
      return true;
    }

    if (field.type === 'repeater' && field.repeaterConfig?.fields?.length) {
      if (fieldTreeHasOptionsFromSource(field.repeaterConfig.fields, sourceFieldName)) {
        return true;
      }
    }
  }

  return false;
}

function walkAndPruneOptionsFromDependents(
  formData: Record<string, unknown>,
  fields: IRepeaterItemFieldConfig[],
  itemData: Record<string, unknown> | undefined,
  dataContainer: Record<string, unknown>,
  changedSourceField: string
): boolean {
  let changed = false;

  for (const field of fields) {
    if (field.optionsFrom?.source === changedSourceField && field.type === 'select') {
      const options = resolveDynamicSelectOptions(field, formData, itemData ?? dataContainer);
      const currentValue = dataContainer[field.field];
      const prunedValue = pruneSelectValueByOptions(
        currentValue,
        options,
        field.multiple ?? false
      );

      if (!areSelectValuesEqual(currentValue, prunedValue, field.multiple ?? false)) {
        dataContainer[field.field] = prunedValue;
        changed = true;
      }
    }

    if (field.type === 'repeater' && field.repeaterConfig?.fields?.length) {
      const nestedItems = dataContainer[field.field];
      if (!Array.isArray(nestedItems)) {
        continue;
      }

      for (const nestedItem of nestedItems) {
        if (!nestedItem || typeof nestedItem !== 'object') {
          continue;
        }

        const nestedChanged = walkAndPruneOptionsFromDependents(
          formData,
          field.repeaterConfig.fields,
          nestedItem as Record<string, unknown>,
          nestedItem as Record<string, unknown>,
          changedSourceField
        );
        changed = nestedChanged || changed;
      }
    }
  }

  return changed;
}

export function pruneOptionsFromDependents(
  formData: Record<string, unknown>,
  fields: IFormFieldConfig[],
  changedSourceField: string
): boolean {
  if (!fieldTreeHasOptionsFromSource(fields, changedSourceField)) {
    return false;
  }

  return walkAndPruneOptionsFromDependents(
    formData,
    fields as IRepeaterItemFieldConfig[],
    undefined,
    formData,
    changedSourceField
  );
}
