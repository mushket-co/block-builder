import type {
  ICustomFieldFormScope,
  ICustomFieldRepeaterScope,
} from '../core/ports/CustomFieldRenderer';

export function createCustomFieldFormScope(
  formData: Record<string, unknown>,
  setField: (name: string, value: unknown) => void,
  repeater?: ICustomFieldRepeaterScope
): ICustomFieldFormScope {
  return {
    formData,
    setField,
    ...(repeater ? { repeater } : {}),
  };
}

export function createRepeaterFormScope(
  formData: Record<string, unknown>,
  setField: (name: string, value: unknown) => void,
  repeaterFieldName: string,
  index: number,
  item: Record<string, unknown>,
  updateItemField: (field: string, value: unknown) => void
): ICustomFieldFormScope {
  return createCustomFieldFormScope(formData, setField, {
    fieldName: repeaterFieldName,
    index,
    item,
    updateItemField,
  });
}
