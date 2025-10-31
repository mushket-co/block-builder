import { MemoryBlockRepositoryImpl } from '../MemoryBlockRepositoryImpl';
import { ICreateBlockDto, IUpdateBlockDto } from '../../../core/types';

describe('MemoryBlockRepositoryImpl', () => {
  let repository: MemoryBlockRepositoryImpl;

  beforeEach(() => {
  repository = new MemoryBlockRepositoryImpl();
  });

  describe('create', () => {
  test('должен создать блок с автогенерированным ID', async () => {
    const blockData: ICreateBlockDto = {
      type: 'TestBlock',
      settings: { key: 'value' },
      props: { prop: 'value' }
    };

    const block = await repository.create(blockData);

    expect(block.id).toBeDefined();
    expect(block.id).toMatch(/^block_\d+_/);
    expect(block.type).toBe('TestBlock');
    expect(block.settings).toEqual({ key: 'value' });
    expect(block.props).toEqual({ prop: 'value' });
  });

  test('должен создать блок с указанным ID', async () => {
    const blockData = {
      id: 'custom-id',
      type: 'TestBlock',
      settings: {},
      props: {}
    };

    const block = await repository.create(blockData);

    expect(block.id).toBe('custom-id');
  });

  test('должен установить visible = true по умолчанию', async () => {
    const blockData: ICreateBlockDto = {
      type: 'TestBlock',
      settings: {},
      props: {}
    };

    const block = await repository.create(blockData);

    expect(block.visible).toBe(true);
  });

  test('должен установить locked = false по умолчанию', async () => {
    const blockData: ICreateBlockDto = {
      type: 'TestBlock',
      settings: {},
      props: {}
    };

    const block = await repository.create(blockData);

    expect(block.locked).toBe(false);
  });

  test('должен создать metadata при создании', async () => {
    const blockData: ICreateBlockDto = {
      type: 'TestBlock',
      settings: {},
      props: {}
    };

    const block = await repository.create(blockData);

    expect(block.metadata).toBeDefined();
    expect(block.metadata?.version).toBe(1);
    expect(block.metadata?.createdAt).toBeInstanceOf(Date);
    expect(block.metadata?.updatedAt).toBeInstanceOf(Date);
  });

  test('должен использовать переданную metadata', async () => {
    const customDate = new Date('2024-01-01');
    const blockData: ICreateBlockDto = {
      type: 'TestBlock',
      settings: {},
      props: {},
      metadata: {
        createdAt: customDate,
        updatedAt: customDate,
        version: 5
      }
    };

    const block = await repository.create(blockData);

    expect(block.metadata?.version).toBe(5);
  });

  test('должен создать блок с parent', async () => {
    const blockData: ICreateBlockDto = {
      type: 'ChildBlock',
      settings: {},
      props: {},
      parent: 'parent-id'
    };

    const block = await repository.create(blockData);

    expect(block.parent).toBe('parent-id');
  });

  test('должен вернуть копию блока', async () => {
    const blockData: ICreateBlockDto = {
      type: 'TestBlock',
      settings: {},
      props: {}
    };

    const block = await repository.create(blockData);
    block.settings.newKey = 'newValue';

    const retrieved = await repository.getById(block.id);
    expect(retrieved?.settings).not.toHaveProperty('newKey');
  });
  });

  describe('getById', () => {
  test('должен получить блок по ID', async () => {
    const created = await repository.create({
      type: 'TestBlock',
      settings: {},
      props: {}
    });

    const retrieved = await repository.getById(created.id);

    expect(retrieved).toEqual(created);
  });

  test('должен вернуть null для несуществующего ID', async () => {
    const retrieved = await repository.getById('non-existent');

    expect(retrieved).toBeNull();
  });

  test('должен вернуть копию блока', async () => {
    const created = await repository.create({
      type: 'TestBlock',
      settings: { key: 'value' },
      props: {}
    });

    const retrieved = await repository.getById(created.id);
    retrieved!.settings.key = 'modified';

    const retrievedAgain = await repository.getById(created.id);
    expect(retrievedAgain?.settings.key).toBe('value');
  });
  });

  describe('getAll', () => {
  test('должен получить все блоки', async () => {
    await repository.create({ type: 'Block1', settings: {}, props: {} });
    await repository.create({ type: 'Block2', settings: {}, props: {} });
    await repository.create({ type: 'Block3', settings: {}, props: {} });

    const blocks = await repository.getAll();

    expect(blocks).toHaveLength(3);
  });

  test('должен вернуть пустой массив если блоков нет', async () => {
    const blocks = await repository.getAll();

    expect(blocks).toEqual([]);
  });

  test('должен отсортировать блоки по order', async () => {
    await repository.create({ type: 'Block1', settings: {}, props: {}, order: 2 });
    await repository.create({ type: 'Block2', settings: {}, props: {}, order: 0 });
    await repository.create({ type: 'Block3', settings: {}, props: {}, order: 1 });

    const blocks = await repository.getAll();

    expect(blocks[0].type).toBe('Block2');
    expect(blocks[1].type).toBe('Block3');
    expect(blocks[2].type).toBe('Block1');
  });

  test('должен отсортировать по дате создания если нет order', async () => {
    // Создаем блоки с небольшой задержкой
    const block1 = await repository.create({ type: 'Block1', settings: {}, props: {} });
    await new Promise(resolve => setTimeout(resolve, 10));
    const block2 = await repository.create({ type: 'Block2', settings: {}, props: {} });

    const blocks = await repository.getAll();

    expect(blocks[0].id).toBe(block1.id);
    expect(blocks[1].id).toBe(block2.id);
  });
  });

  describe('getByType', () => {
  test('должен получить блоки по типу', async () => {
    await repository.create({ type: 'Button', settings: {}, props: {} });
    await repository.create({ type: 'Text', settings: {}, props: {} });
    await repository.create({ type: 'Button', settings: {}, props: {} });

    const buttons = await repository.getByType('Button');

    expect(buttons).toHaveLength(2);
    expect(buttons.every(b => b.type === 'Button')).toBe(true);
  });

  test('должен вернуть пустой массив если блоков типа нет', async () => {
    await repository.create({ type: 'Button', settings: {}, props: {} });

    const texts = await repository.getByType('Text');

    expect(texts).toEqual([]);
  });
  });

  describe('getChildren', () => {
  test('должен получить дочерние блоки', async () => {
    const parent = await repository.create({
      type: 'Parent',
      settings: {},
      props: {}
    });

    await repository.create({
      type: 'Child1',
      settings: {},
      props: {},
      parent: parent.id
    });

    await repository.create({
      type: 'Child2',
      settings: {},
      props: {},
      parent: parent.id
    });

    await repository.create({
      type: 'OtherChild',
      settings: {},
      props: {},
      parent: 'other-parent'
    });

    const children = await repository.getChildren(parent.id);

    expect(children).toHaveLength(2);
    expect(children.every(c => c.parent === parent.id)).toBe(true);
  });

  test('должен вернуть пустой массив если нет дочерних блоков', async () => {
    const children = await repository.getChildren('non-existent');

    expect(children).toEqual([]);
  });
  });

  describe('update', () => {
  test('должен обновить блок', async () => {
    const created = await repository.create({
      type: 'TestBlock',
      settings: { key: 'value' },
      props: {}
    });

    const updates: IUpdateBlockDto = {
      settings: { key: 'newValue' }
    };

    const updated = await repository.update(created.id, updates);

    expect(updated.settings.key).toBe('newValue');
  });

  test('должен обновить metadata при обновлении', async () => {
    const created = await repository.create({
      type: 'TestBlock',
      settings: {},
      props: {}
    });

    const originalVersion = created.metadata?.version;
    const originalUpdatedAt = created.metadata?.updatedAt;

    // Ждем немного чтобы время точно изменилось
    await new Promise(resolve => setTimeout(resolve, 10));

    await repository.update(created.id, { settings: { key: 'value' } });

    const updated = await repository.getById(created.id);
    expect(updated?.metadata?.version).toBe((originalVersion || 0) + 1);
    
    // Проверяем что время обновилось (должно быть позже)
    if (originalUpdatedAt && updated?.metadata?.updatedAt) {
      expect(updated.metadata.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    }
  });

  test('должен объединить стили', async () => {
    const created = await repository.create({
      type: 'TestBlock',
      settings: {},
      props: {},
      style: { color: 'red', fontSize: 14 }
    });

    const updated = await repository.update(created.id, {
      style: { color: 'blue' }
    });

    expect(updated.style).toEqual({ color: 'blue', fontSize: 14 });
  });

  test('должен бросить ошибку для несуществующего блока', async () => {
    await expect(
      repository.update('non-existent', { settings: {} })
    ).rejects.toThrow('Block with id non-existent not found');
  });

  test('должен обновить visible', async () => {
    const created = await repository.create({
      type: 'TestBlock',
      settings: {},
      props: {},
      visible: true
    });

    const updated = await repository.update(created.id, { visible: false });

    expect(updated.visible).toBe(false);
  });

  test('должен обновить locked', async () => {
    const created = await repository.create({
      type: 'TestBlock',
      settings: {},
      props: {},
      locked: false
    });

    const updated = await repository.update(created.id, { locked: true });

    expect(updated.locked).toBe(true);
  });
  });

  describe('delete', () => {
  test('должен удалить блок', async () => {
    const created = await repository.create({
      type: 'TestBlock',
      settings: {},
      props: {}
    });

    const result = await repository.delete(created.id);

    expect(result).toBe(true);
    const retrieved = await repository.getById(created.id);
    expect(retrieved).toBeNull();
  });

  test('должен вернуть false для несуществующего блока', async () => {
    const result = await repository.delete('non-existent');

    expect(result).toBe(false);
  });
  });

  describe('exists', () => {
  test('должен вернуть true для существующего блока', async () => {
    const created = await repository.create({
      type: 'TestBlock',
      settings: {},
      props: {}
    });

    const exists = await repository.exists(created.id);

    expect(exists).toBe(true);
  });

  test('должен вернуть false для несуществующего блока', async () => {
    const exists = await repository.exists('non-existent');

    expect(exists).toBe(false);
  });
  });

  describe('count', () => {
  test('должен вернуть количество блоков', async () => {
    await repository.create({ type: 'Block1', settings: {}, props: {} });
    await repository.create({ type: 'Block2', settings: {}, props: {} });
    await repository.create({ type: 'Block3', settings: {}, props: {} });

    const count = await repository.count();

    expect(count).toBe(3);
  });

  test('должен вернуть 0 если блоков нет', async () => {
    const count = await repository.count();

    expect(count).toBe(0);
  });

  test('должен уменьшить счетчик после удаления', async () => {
    const created = await repository.create({
      type: 'TestBlock',
      settings: {},
      props: {}
    });

    await repository.delete(created.id);

    const count = await repository.count();
    expect(count).toBe(0);
  });
  });

  describe('clear', () => {
  test('должен очистить все блоки', async () => {
    await repository.create({ type: 'Block1', settings: {}, props: {} });
    await repository.create({ type: 'Block2', settings: {}, props: {} });

    await repository.clear();

    const count = await repository.count();
    expect(count).toBe(0);

    const blocks = await repository.getAll();
    expect(blocks).toEqual([]);
  });

  test('должен работать на пустом репозитории', async () => {
    await expect(repository.clear()).resolves.not.toThrow();
  });
  });
});

