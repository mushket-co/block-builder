import type { IRepeaterItemFieldConfig } from '../core/types/form';

export const REPEATER_ITEM_ID_FIELD = 'id';

/**
 * Системное поле id элемента репитера: type text — авто-генерация, не показывается в форме.
 * Поле `id` с другим типом (api-select и т.д.) — пользовательское, в форме остаётся.
 */
export function isAutoRepeaterItemIdField(field: IRepeaterItemFieldConfig): boolean {
  return field.field === REPEATER_ITEM_ID_FIELD && field.type === 'text';
}

export function usesAutoRepeaterItemId(fields: IRepeaterItemFieldConfig[]): boolean {
  const idField = fields.find(f => f.field === REPEATER_ITEM_ID_FIELD);
  if (!idField) {
    return true;
  }
  return idField.type === 'text';
}

export function getRepeaterFormFields<T extends IRepeaterItemFieldConfig>(fields: T[]): T[] {
  return fields.filter(field => !isAutoRepeaterItemIdField(field));
}

export function generateRepeaterItemId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function assignRepeaterItemId(
  item: Record<string, unknown>,
  fields: IRepeaterItemFieldConfig[],
  options: { forceNew?: boolean } = {}
): Record<string, unknown> {
  if (!usesAutoRepeaterItemId(fields)) {
    return item;
  }

  const currentId = item[REPEATER_ITEM_ID_FIELD];
  if (
    !options.forceNew &&
    currentId !== undefined &&
    currentId !== null &&
    String(currentId).length > 0
  ) {
    return item;
  }

  return {
    ...item,
    [REPEATER_ITEM_ID_FIELD]: generateRepeaterItemId(),
  };
}

export function isReadonlyRepeaterItemField(
  fieldName: string,
  fields: IRepeaterItemFieldConfig[]
): boolean {
  return fieldName === REPEATER_ITEM_ID_FIELD && usesAutoRepeaterItemId(fields);
}
