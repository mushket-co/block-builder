import {
  resolveUiStrings,
  UI_STRINGS_EN,
  UI_STRINGS_RU,
} from '../../shared/i18n/uiStrings';

describe('resolveUiStrings', () => {
  test('returns Russian by default', () => {
    expect(resolveUiStrings()).toEqual(UI_STRINGS_RU);
  });

  test('returns English preset', () => {
    expect(resolveUiStrings('en').save).toBe('Save');
  });

  test('merges overrides', () => {
    expect(resolveUiStrings('ru', { save: 'Publish' }).save).toBe('Publish');
    expect(resolveUiStrings('ru', { save: 'Publish' }).clearAll).toBe(UI_STRINGS_RU.clearAll);
  });
});
