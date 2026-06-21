import {
  applyFileImportMergeRules,
  formatFileImportMergeMessage,
  mergeImportedArray,
} from '../fileImportMerge';

describe('mergeImportedArray', () => {
  it('appends when dedupeBy is not set', () => {
    const result = mergeImportedArray(
      [{ title: 'A' }],
      [{ title: 'B' }, { title: 'A' }]
    );

    expect(result.merged).toHaveLength(3);
    expect(result.added).toBe(2);
    expect(result.skipped).toBe(0);
  });

  it('skips duplicates by dedupeBy', () => {
    const result = mergeImportedArray(
      [{ title: 'Card 1' }],
      [{ title: 'Card 1' }, { title: 'Card 2' }],
      { dedupeBy: 'title' }
    );

    expect(result.merged).toEqual([{ title: 'Card 1' }, { title: 'Card 2' }]);
    expect(result.added).toBe(1);
    expect(result.skipped).toBe(1);
  });

  it('replaces entire array in replace mode', () => {
    const result = mergeImportedArray(
      [{ title: 'Old' }],
      [{ title: 'New' }],
      { mode: 'replace' }
    );

    expect(result.merged).toEqual([{ title: 'New' }]);
    expect(result.added).toBe(1);
    expect(result.skipped).toBe(0);
  });
});

describe('applyFileImportMergeRules', () => {
  it('merges into formScope with mapItem and dedupe', () => {
    const formData: Record<string, unknown> = {
      items: [{ title: 'Existing', filters: [] }],
    };

    const stats = applyFileImportMergeRules(
      {
        formData,
        setField: (name, value) => {
          formData[name] = value;
        },
      },
      {
        data: {
          cards: [
            { title: 'Existing', filters: [] },
            { title: 'New card', filters: ['A'] },
          ],
        },
      },
      [
        {
          targetField: 'items',
          sourceKey: 'data.cards',
          mode: 'append',
          dedupeBy: 'title',
          mapItem: card => ({
            title: (card as { title: string }).title,
            filters: [],
          }),
        },
      ]
    );

    expect(formData.items).toEqual([
      { title: 'Existing', filters: [] },
      { title: 'New card', filters: [] },
    ]);
    expect(stats[0]).toMatchObject({ added: 1, skipped: 1, total: 2 });
  });
});

describe('formatFileImportMergeMessage', () => {
  it('formats append stats with skipped duplicates', () => {
    const message = formatFileImportMergeMessage([
      { targetField: 'items', mode: 'append', added: 2, skipped: 1, total: 5 },
    ]);

    expect(message).toBe('items: +2, пропущено дубликатов 1');
  });
});
