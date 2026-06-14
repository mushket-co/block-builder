import {
  buildBlockAnchorOptions,
  formatBlockAnchorValue,
  getBlockAnchorOptionLabel,
  getBlockAnchorUserTitle,
  getBlockTypeLabel,
  isBlockAnchorHash,
} from '../blockAnchorHelpers';

describe('blockAnchorHelpers', () => {
  const context = {
    blocks: [
      {
        id: 'a1',
        type: 'text',
        props: { title: 'О компании' },
        settings: { titleComponent: 'Заголовок A' },
        visible: true,
      },
      { id: 'b2', type: 'image', props: { name: 'Баннер' }, visible: true },
      { id: 'c3', type: 'text', visible: false },
    ],
    editingBlockId: 'a1',
    blockTypeLabels: { text: 'Текстовый блок', image: 'Изображение' },
  };

  it('formats anchor hash value', () => {
    expect(formatBlockAnchorValue('block-id')).toBe('#block-id');
  });

  it('extracts user title from props.title or props.name', () => {
    expect(getBlockAnchorUserTitle({ title: '  Заголовок  ' })).toBe('Заголовок');
    expect(getBlockAnchorUserTitle({ name: 'Имя блока' })).toBe('Имя блока');
    expect(getBlockAnchorUserTitle({ title: '', name: 'Fallback' })).toBe('Fallback');
    expect(getBlockAnchorUserTitle({})).toBe('');
  });

  it('builds option label with user title prefix separated by pipe', () => {
    expect(getBlockAnchorOptionLabel(context.blocks[0], context.blockTypeLabels)).toBe(
      'О компании | Текстовый блок (text)'
    );
    expect(getBlockAnchorOptionLabel(context.blocks[1], context.blockTypeLabels)).toBe(
      'Баннер | Изображение (image)'
    );
    expect(getBlockAnchorOptionLabel(context.blocks[2], context.blockTypeLabels)).toBe(
      'Текстовый блок (text)'
    );
  });

  it('resolves block type label', () => {
    expect(getBlockTypeLabel(context.blocks[0], context.blockTypeLabels)).toBe('Текстовый блок');
  });

  it('detects known block anchor hashes', () => {
    const ids = new Set(['a1', 'b2']);
    expect(isBlockAnchorHash('#a1', ids)).toBe(true);
    expect(isBlockAnchorHash('https://example.com', ids)).toBe(false);
    expect(isBlockAnchorHash('#unknown', ids)).toBe(false);
  });

  it('builds options excluding editing block and hidden blocks by default', () => {
    const options = buildBlockAnchorOptions(context);
    expect(options).toEqual([
      { value: '#b2', label: 'Баннер | Изображение (image)' },
    ]);
  });

  it('can include editing block and hidden blocks when configured', () => {
    const options = buildBlockAnchorOptions(context, {
      excludeEditingBlock: false,
      onlyVisibleBlocks: false,
    });

    expect(options).toEqual([
      { value: '#a1', label: 'О компании | Текстовый блок (text)' },
      { value: '#b2', label: 'Баннер | Изображение (image)' },
      { value: '#c3', label: 'Текстовый блок (text)' },
    ]);
  });
});
