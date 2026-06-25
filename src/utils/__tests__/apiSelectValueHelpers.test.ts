import {
  extractApiSelectItemsFromValue,
  extractApiSelectValueId,
  extractApiSelectValueIds,
  isApiSelectStoredItem,
  isSameApiSelectModelValue,
  toApiSelectStoredValue,
} from '../apiSelectValueHelpers';

describe('apiSelectValueHelpers', () => {
  test('detects api-select stored item shape', () => {
    expect(isApiSelectStoredItem({ id: 5, name: 'News 5' })).toBe(true);
    expect(isApiSelectStoredItem({ id: 'abc' })).toBe(true);
    expect(isApiSelectStoredItem({ nested: 'value' })).toBe(false);
    expect(isApiSelectStoredItem([{ id: 1, name: 'A' }])).toBe(false);
  });

  test('extracts ids from stored objects', () => {
    expect(extractApiSelectValueId({ id: 5, name: 'News 5' })).toBe(5);
    expect(extractApiSelectValueIds([{ id: 1, name: 'A' }, { id: 2, name: 'B' }])).toEqual([1, 2]);
  });

  test('builds selected items from stored value without API', () => {
    expect(
      extractApiSelectItemsFromValue([
        { id: 1, name: 'Первая' },
        { id: 15, name: 'Пятнадцатая' },
      ])
    ).toEqual([
      { id: 1, name: 'Первая' },
      { id: 15, name: 'Пятнадцатая' },
    ]);
  });

  test('stores full item on selection', () => {
    const stored = toApiSelectStoredValue([1, 15], true, id => ({
      id,
      name: `News ${id}`,
    }));

    expect(stored).toEqual([
      { id: 1, name: 'News 1' },
      { id: 15, name: 'News 15' },
    ]);
  });

  test('compares model values by id regardless of stored shape', () => {
    expect(
      isSameApiSelectModelValue(
        [{ id: 1, name: 'A' }, 2],
        [1, { id: 2, name: 'B' }],
        true
      )
    ).toBe(true);
  });
});
