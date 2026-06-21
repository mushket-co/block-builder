import type { IFormFieldConfig, IRepeaterItemFieldConfig } from '../core/types/form';

function shouldPersistField(field: { persist?: boolean; type?: string }): boolean {
  if (field.type === 'file-import') {
    return false;
  }
  return field.persist !== false;
}

function stripRepeaterItems(
  items: unknown[],
  fields: IRepeaterItemFieldConfig[]
): unknown[] {
  return items.map(item => {
    if (!item || typeof item !== 'object') {
      return item;
    }

    const record = { ...(item as Record<string, unknown>) };
    fields.forEach(field => {
      if (!shouldPersistField(field)) {
        delete record[field.field];
        return;
      }

      if (field.type === 'repeater' && Array.isArray(record[field.field])) {
        record[field.field] = stripRepeaterItems(
          record[field.field] as unknown[],
          field.repeaterConfig?.fields || []
        );
      }
    });

    return record;
  });
}

export function stripNonPersistedFields(
  props: Record<string, unknown>,
  fields: IFormFieldConfig[]
): Record<string, unknown> {
  const result = { ...props };

  fields.forEach(field => {
    if (!shouldPersistField(field)) {
      delete result[field.field];
      return;
    }

    if (field.type === 'repeater' && Array.isArray(result[field.field])) {
      result[field.field] = stripRepeaterItems(
        result[field.field] as unknown[],
        field.repeaterConfig?.fields || []
      );
    }
  });

  return result;
}
