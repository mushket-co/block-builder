import { resolveFormFieldDefaultValue } from '../formFieldDefaults';

describe('resolveFormFieldDefaultValue', () => {
  test('returns explicit defaultValue when set', () => {
    expect(
      resolveFormFieldDefaultValue({
        type: 'select',
        multiple: true,
        defaultValue: ['a'],
      })
    ).toEqual(['a']);
  });

  test('select multiple defaults to empty array', () => {
    expect(
      resolveFormFieldDefaultValue({
        type: 'select',
        multiple: true,
      })
    ).toEqual([]);
  });

  test('matrix-table defaults to table head and body', () => {
    const value = resolveFormFieldDefaultValue({ type: 'matrix-table' });
    expect(value).toEqual(
      expect.objectContaining({
        tableHead: expect.any(Array),
        tableBody: expect.any(Array),
      })
    );
    expect(value.tableHead.length).toBeGreaterThan(0);
  });

  test('select single defaults to empty string', () => {
    expect(
      resolveFormFieldDefaultValue({
        type: 'select',
        multiple: false,
      })
    ).toBe('');
  });

  test('api-select multiple defaults to empty array', () => {
    expect(
      resolveFormFieldDefaultValue({
        type: 'api-select',
        apiSelectConfig: { url: '/api', multiple: true },
      })
    ).toEqual([]);
  });
});
