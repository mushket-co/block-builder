import type { IFormFieldConfig, IRepeaterItemFieldConfig } from '../core/types/form';
import { getRepeaterFormFields } from './repeaterItemId';

export type TFormFieldGroup =
  | {
      type: 'toggle-group';
      key: string;
      toggleField: IFormFieldConfig;
      dependentFields: IFormFieldConfig[];
    }
  | {
      type: 'single';
      key: string;
      field: IFormFieldConfig;
    };

export function groupFormFields(
  fields: IFormFieldConfig[],
  options?: { keyPrefix?: string }
): TFormFieldGroup[] {
  const keyPrefix = options?.keyPrefix ? `${options.keyPrefix}-` : '';
  const visibleFields = getRepeaterFormFields(fields as IRepeaterItemFieldConfig[]);
  const groups: TFormFieldGroup[] = [];
  const processedFields = new Set<string>();

  for (const field of visibleFields) {
    if (processedFields.has(field.field)) {
      continue;
    }

    if (field.type === 'checkbox') {
      const dependentFields = visibleFields.filter(
        f =>
          f.dependsOn?.field === field.field &&
          f.dependsOn?.value === true &&
          f.dependsOn?.operator !== 'notEquals' &&
          !processedFields.has(f.field)
      );

      if (dependentFields.length > 0) {
        groups.push({
          type: 'toggle-group',
          key: `${keyPrefix}toggle-${field.field}`,
          toggleField: field,
          dependentFields,
        });
        processedFields.add(field.field);
        dependentFields.forEach(f => processedFields.add(f.field));
        continue;
      }
    }

    if (!processedFields.has(field.field)) {
      groups.push({
        type: 'single',
        key: `${keyPrefix}field-${field.field}`,
        field,
      });
      processedFields.add(field.field);
    }
  }

  return groups;
}
