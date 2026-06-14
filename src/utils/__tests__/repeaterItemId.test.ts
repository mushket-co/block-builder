import {
  assignRepeaterItemId,
  generateRepeaterItemId,
  getRepeaterFormFields,
  isAutoRepeaterItemIdField,
  usesAutoRepeaterItemId,
} from '../repeaterItemId';

describe('repeaterItemId', () => {
  test('isAutoRepeaterItemIdField detects text id only', () => {
    expect(isAutoRepeaterItemIdField({ field: 'id', label: 'ID', type: 'text' })).toBe(true);
    expect(isAutoRepeaterItemIdField({ field: 'id', label: 'Статья', type: 'api-select' })).toBe(
      false
    );
  });

  test('usesAutoRepeaterItemId when no id field or text id', () => {
    expect(usesAutoRepeaterItemId([{ field: 'title', label: 'Title', type: 'text' }])).toBe(true);
    expect(usesAutoRepeaterItemId([{ field: 'id', label: 'ID', type: 'text' }])).toBe(true);
    expect(
      usesAutoRepeaterItemId([{ field: 'id', label: 'Статья', type: 'api-select' }])
    ).toBe(false);
  });

  test('getRepeaterFormFields hides text id', () => {
    const fields = [
      { field: 'id', label: 'ID', type: 'text' as const },
      { field: 'title', label: 'Title', type: 'text' as const },
    ];
    expect(getRepeaterFormFields(fields)).toEqual([{ field: 'title', label: 'Title', type: 'text' }]);
  });

  test('assignRepeaterItemId preserves existing id', () => {
    const fields = [{ field: 'title', label: 'Title', type: 'text' as const }];
    expect(assignRepeaterItemId({ id: 'keep-me', title: 'A' }, fields)).toEqual({
      id: 'keep-me',
      title: 'A',
    });
  });

  test('assignRepeaterItemId generates missing id', () => {
    const fields = [{ field: 'title', label: 'Title', type: 'text' as const }];
    const result = assignRepeaterItemId({ title: 'A' }, fields);
    expect(result.title).toBe('A');
    expect(result.id).toBeDefined();
    expect(String(result.id).length).toBeGreaterThan(0);
  });

  test('assignRepeaterItemId skips api-select id field config', () => {
    const fields = [{ field: 'id', label: 'Статья', type: 'api-select' as const }];
    expect(assignRepeaterItemId({ id: null }, fields)).toEqual({ id: null });
  });

  test('generateRepeaterItemId returns non-empty string', () => {
    expect(generateRepeaterItemId()).toEqual(expect.any(String));
  });
});
