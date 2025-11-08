import {
  cloneBlock,
  buildBlockHierarchy,
  getAllChildren,
  isChildOf,
  TBlock
} from '../blockHelpers';
describe('blockHelpers', () => {
  describe('cloneBlock', () => {
  test('должен клонировать блок с новым ID', () => {
    const block: TBlock = {
      id: 'original',
      type: 'TestBlock',
      settings: { key: 'value' },
      props: { prop: 'value' },
      metadata: {
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        version: 5
      }
    };
    const cloned = cloneBlock(block, 'new-id');
    expect(cloned.id).toBe('new-id');
    expect(cloned.type).toBe('TestBlock');
    expect(cloned.settings).toEqual({ key: 'value' });
    expect(cloned.props).toEqual({ prop: 'value' });
  });
  test('должен сбросить metadata при клонировании', () => {
    const block: TBlock = {
      id: 'original',
      type: 'TestBlock',
      settings: {},
      props: {},
      metadata: {
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2023-01-01'),
        version: 10
      }
    };
    const cloned = cloneBlock(block, 'new-id');
    expect(cloned.metadata?.version).toBe(1);
    expect(cloned.metadata?.createdAt).not.toEqual(block.metadata?.createdAt);
    expect(cloned.metadata?.updatedAt).not.toEqual(block.metadata?.updatedAt);
  });
  test('должен клонировать массив children если он есть', () => {
    const block: TBlock = {
      id: 'original',
      type: 'TestBlock',
      settings: {},
      props: {},
      children: ['child-1', 'child-2']
    };
    const cloned = cloneBlock(block, 'new-id');
    expect(cloned.children).toEqual(['child-1', 'child-2']);
    expect(cloned.children).not.toBe(block.children);
  });
  test('должен обработать блок без children', () => {
    const block: TBlock = {
      id: 'original',
      type: 'TestBlock',
      settings: {},
      props: {}
    };
    const cloned = cloneBlock(block, 'new-id');
    expect(cloned.children).toBeUndefined();
  });
  test('не должен влиять на оригинальный блок', () => {
    const block: TBlock = {
      id: 'original',
      type: 'TestBlock',
      settings: { key: 'value' },
      props: {}
    };
    const cloned = cloneBlock(block, 'new-id');
    cloned.settings.key = 'modified';
    expect(block.settings.key).toBe('value');
  });
  });
  describe('buildBlockHierarchy', () => {
  test('должен построить иерархию из плоского списка', () => {
    const blocks: TBlock[] = [
      { id: 'root', type: 'Root', settings: {}, props: {} },
      { id: 'child-1', type: 'Child', settings: {}, props: {}, parent: 'root' },
      { id: 'child-2', type: 'Child', settings: {}, props: {}, parent: 'root' }
    ];
    const hierarchy = buildBlockHierarchy(blocks);
    expect(hierarchy).toHaveLength(1);
    expect(hierarchy[0].id).toBe('root');
    expect(hierarchy[0].children).toHaveLength(2);
    expect(hierarchy[0].children![0].id).toBe('child-1');
    expect(hierarchy[0].children![1].id).toBe('child-2');
  });
  test('должен обработать несколько корневых блоков', () => {
    const blocks: TBlock[] = [
      { id: 'root-1', type: 'Root', settings: {}, props: {} },
      { id: 'root-2', type: 'Root', settings: {}, props: {} }
    ];
    const hierarchy = buildBlockHierarchy(blocks);
    expect(hierarchy).toHaveLength(2);
    expect(hierarchy[0].id).toBe('root-1');
    expect(hierarchy[1].id).toBe('root-2');
  });
  test('должен построить вложенную иерархию', () => {
    const blocks: TBlock[] = [
      { id: 'root', type: 'Root', settings: {}, props: {} },
      { id: 'level-1', type: 'L1', settings: {}, props: {}, parent: 'root' },
      { id: 'level-2', type: 'L2', settings: {}, props: {}, parent: 'level-1' },
      { id: 'level-3', type: 'L3', settings: {}, props: {}, parent: 'level-2' }
    ];
    const hierarchy = buildBlockHierarchy(blocks);
    expect(hierarchy).toHaveLength(1);
    expect(hierarchy[0].id).toBe('root');
    expect(hierarchy[0].children).toHaveLength(1);
    expect(hierarchy[0].children![0].id).toBe('level-1');
    expect(hierarchy[0].children![0].children).toHaveLength(1);
    expect(hierarchy[0].children![0].children![0].id).toBe('level-2');
    expect(hierarchy[0].children![0].children![0].children).toHaveLength(1);
    expect(hierarchy[0].children![0].children![0].children![0].id).toBe('level-3');
  });
  test('должен обработать блок с несуществующим parent', () => {
    const blocks: TBlock[] = [
      { id: 'orphan', type: 'Orphan', settings: {}, props: {}, parent: 'non-existent' },
      { id: 'root', type: 'Root', settings: {}, props: {} }
    ];
    const hierarchy = buildBlockHierarchy(blocks);
    expect(hierarchy).toHaveLength(1);
    expect(hierarchy[0].id).toBe('root');
  });
  test('должен обработать пустой массив', () => {
    const hierarchy = buildBlockHierarchy([]);
    expect(hierarchy).toHaveLength(0);
  });
  test('должен обработать сложную структуру', () => {
    const blocks: TBlock[] = [
      { id: 'root-1', type: 'Root', settings: {}, props: {} },
      { id: 'root-2', type: 'Root', settings: {}, props: {} },
      { id: 'child-1-1', type: 'Child', settings: {}, props: {}, parent: 'root-1' },
      { id: 'child-1-2', type: 'Child', settings: {}, props: {}, parent: 'root-1' },
      { id: 'child-2-1', type: 'Child', settings: {}, props: {}, parent: 'root-2' },
      { id: 'grandchild-1-1-1', type: 'Grandchild', settings: {}, props: {}, parent: 'child-1-1' }
    ];
    const hierarchy = buildBlockHierarchy(blocks);
    expect(hierarchy).toHaveLength(2);
    expect(hierarchy[0].children).toHaveLength(2);
    expect(hierarchy[1].children).toHaveLength(1);
    expect(hierarchy[0].children![0].children).toHaveLength(1);
  });
  });
  describe('getAllChildren', () => {
  const allBlocks: TBlock[] = [
    { id: 'root', type: 'Root', settings: {}, props: {} },
    { id: 'child-1', type: 'Child', settings: {}, props: {}, parent: 'root' },
    { id: 'child-2', type: 'Child', settings: {}, props: {}, parent: 'root' },
    { id: 'grandchild-1', type: 'Grandchild', settings: {}, props: {}, parent: 'child-1' },
    { id: 'grandchild-2', type: 'Grandchild', settings: {}, props: {}, parent: 'child-1' },
    { id: 'great-grandchild', type: 'GreatGrandchild', settings: {}, props: {}, parent: 'grandchild-1' }
  ];
  test('должен получить всех дочерних блоков рекурсивно', () => {
    const rootBlock = allBlocks[0];
    const children = getAllChildren(rootBlock, allBlocks);
    expect(children).toHaveLength(5);
    expect(children.map(c => c.id)).toContain('child-1');
    expect(children.map(c => c.id)).toContain('child-2');
    expect(children.map(c => c.id)).toContain('grandchild-1');
    expect(children.map(c => c.id)).toContain('grandchild-2');
    expect(children.map(c => c.id)).toContain('great-grandchild');
  });
  test('должен вернуть пустой массив для блока без детей', () => {
    const leafBlock = allBlocks.find(b => b.id === 'child-2')!;
    const children = getAllChildren(leafBlock, allBlocks);
    expect(children).toHaveLength(0);
  });
  test('должен получить дочерние блоки на один уровень глубже', () => {
    const childBlock = allBlocks.find(b => b.id === 'child-1')!;
    const children = getAllChildren(childBlock, allBlocks);
    expect(children).toHaveLength(3);
  });
  test('должен работать для глубокой вложенности', () => {
    const grandchildBlock = allBlocks.find(b => b.id === 'grandchild-1')!;
    const children = getAllChildren(grandchildBlock, allBlocks);
    expect(children).toHaveLength(1);
    expect(children[0].id).toBe('great-grandchild');
  });
  });
  describe('isChildOf', () => {
  const allBlocks: TBlock[] = [
    { id: 'root', type: 'Root', settings: {}, props: {} },
    { id: 'child', type: 'Child', settings: {}, props: {}, parent: 'root' },
    { id: 'grandchild', type: 'Grandchild', settings: {}, props: {}, parent: 'child' },
    { id: 'great-grandchild', type: 'GreatGrandchild', settings: {}, props: {}, parent: 'grandchild' },
    { id: 'other-root', type: 'Root', settings: {}, props: {} }
  ];
  test('должен вернуть true для прямого дочернего блока', () => {
    const child = allBlocks.find(b => b.id === 'child')!;
    const parent = allBlocks.find(b => b.id === 'root')!;
    expect(isChildOf(child, parent, allBlocks)).toBe(true);
  });
  test('должен вернуть true для косвенного дочернего блока', () => {
    const grandchild = allBlocks.find(b => b.id === 'grandchild')!;
    const root = allBlocks.find(b => b.id === 'root')!;
    expect(isChildOf(grandchild, root, allBlocks)).toBe(true);
  });
  test('должен вернуть true для глубоко вложенного дочернего блока', () => {
    const greatGrandchild = allBlocks.find(b => b.id === 'great-grandchild')!;
    const root = allBlocks.find(b => b.id === 'root')!;
    expect(isChildOf(greatGrandchild, root, allBlocks)).toBe(true);
  });
  test('должен вернуть false для блока из другой ветви', () => {
    const child = allBlocks.find(b => b.id === 'child')!;
    const otherRoot = allBlocks.find(b => b.id === 'other-root')!;
    expect(isChildOf(child, otherRoot, allBlocks)).toBe(false);
  });
  test('должен вернуть false для корневого блока', () => {
    const root = allBlocks.find(b => b.id === 'root')!;
    const otherRoot = allBlocks.find(b => b.id === 'other-root')!;
    expect(isChildOf(root, otherRoot, allBlocks)).toBe(false);
  });
  test('должен вернуть false если parent не существует', () => {
    const orphan: TBlock = {
      id: 'orphan',
      type: 'Orphan',
      settings: {},
      props: {},
      parent: 'non-existent'
    };
    const root = allBlocks.find(b => b.id === 'root')!;
    expect(isChildOf(orphan, root, allBlocks)).toBe(false);
  });
  test('должен вернуть false для одного и того же блока', () => {
    const root = allBlocks.find(b => b.id === 'root')!;
    expect(isChildOf(root, root, allBlocks)).toBe(false);
  });
  });
});