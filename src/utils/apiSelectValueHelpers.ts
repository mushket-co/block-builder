import type { IApiSelectItem } from '../core/types/form';

export type TApiSelectStoredValue =
  | string
  | number
  | IApiSelectItem
  | Array<string | number | IApiSelectItem>
  | null;

export function normalizeApiSelectInitialValue(
  value: unknown,
  isMultiple: boolean
): TApiSelectStoredValue {
  if (value === undefined) {
    return isMultiple ? [] : null;
  }

  if (isMultiple) {
    if (!Array.isArray(value)) {
      return [];
    }

    return extractApiSelectItemsFromValue(value).map(item => ({ ...item }));
  }

  if (value === null || value === '') {
    return null;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  const item = extractApiSelectItemsFromValue(value)[0];
  return item ? { ...item } : null;
}

export function isApiSelectStoredItem(value: unknown): value is IApiSelectItem {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;
  const id = record.id;

  if (typeof id !== 'string' && typeof id !== 'number') {
    return false;
  }

  if ('name' in record && record.name !== undefined && typeof record.name !== 'string') {
    return false;
  }

  return Object.keys(record).every(key => key === 'id' || key === 'name');
}

export function extractApiSelectValueId(value: unknown): string | number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (Array.isArray(value)) {
    return null;
  }

  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: string | number }).id;
    if (id !== null && id !== undefined && id !== '') {
      return id;
    }
    return null;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  return null;
}

export function extractApiSelectValueIds(value: unknown): Array<string | number> {
  if (Array.isArray(value)) {
    return value
      .map(entry => extractApiSelectValueId(entry))
      .filter((id): id is string | number => id !== null);
  }

  const id = extractApiSelectValueId(value);
  return id === null ? [] : [id];
}

function toApiSelectItem(entry: unknown): IApiSelectItem | null {
  if (entry === null || entry === undefined || entry === '') {
    return null;
  }

  if (typeof entry === 'object' && entry !== null && 'id' in entry) {
    const id = (entry as { id?: string | number }).id;
    if (id === null || id === undefined || id === '') {
      return null;
    }

    const name =
      'name' in entry && typeof (entry as { name?: unknown }).name === 'string'
        ? (entry as { name: string }).name
        : String(id);

    return { id, name };
  }

  if (typeof entry === 'string' || typeof entry === 'number') {
    return { id: entry, name: String(entry) };
  }

  return null;
}

export function extractApiSelectItemsFromValue(value: unknown): IApiSelectItem[] {
  if (value === null || value === undefined || value === '') {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map(entry => toApiSelectItem(entry))
      .filter((item): item is IApiSelectItem => item !== null);
  }

  const item = toApiSelectItem(value);
  return item ? [item] : [];
}

export function hasApiSelectValue(value: unknown, isMultiple: boolean): boolean {
  if (isMultiple) {
    return extractApiSelectValueIds(value).length > 0;
  }

  return extractApiSelectValueId(value) !== null;
}

export function toApiSelectDropdownValue(
  value: unknown,
  isMultiple: boolean
): string | number | Array<string | number> | null {
  if (isMultiple) {
    return extractApiSelectValueIds(value);
  }

  return extractApiSelectValueId(value);
}

export function toApiSelectStoredValue(
  dropdownValue: string | number | Array<string | number> | null,
  isMultiple: boolean,
  resolveItem: (id: string | number) => IApiSelectItem | undefined
): TApiSelectStoredValue {
  if (isMultiple) {
    const ids = Array.isArray(dropdownValue) ? dropdownValue : [];
    return ids.map(id => resolveItem(id) ?? { id, name: String(id) });
  }

  if (dropdownValue === null || dropdownValue === undefined || dropdownValue === '') {
    return null;
  }

  if (Array.isArray(dropdownValue)) {
    return null;
  }

  return resolveItem(dropdownValue) ?? { id: dropdownValue, name: String(dropdownValue) };
}

export function isSameApiSelectModelValue(
  first: unknown,
  second: unknown,
  isMultiple: boolean
): boolean {
  if (!isMultiple) {
    return extractApiSelectValueId(first) === extractApiSelectValueId(second);
  }

  const firstIds = extractApiSelectValueIds(first);
  const secondIds = extractApiSelectValueIds(second);

  if (firstIds.length !== secondIds.length) {
    return false;
  }

  return firstIds.every((id, index) => id === secondIds[index]);
}

export function removeApiSelectItemById(
  value: unknown,
  id: string | number
): Array<string | number | IApiSelectItem> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(entry => extractApiSelectValueId(entry) !== id);
}

export function cloneApiSelectStoredValue(value: unknown): TApiSelectStoredValue {
  if (Array.isArray(value)) {
    return value.map(entry =>
      typeof entry === 'object' && entry !== null ? { ...(entry as IApiSelectItem) } : entry
    );
  }

  if (typeof value === 'object' && value !== null) {
    return { ...(value as IApiSelectItem) };
  }

  return value as TApiSelectStoredValue;
}
