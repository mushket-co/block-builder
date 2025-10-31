/**
 * Интеграционные тесты для BlockBuilderFacade
 * Проверяют взаимодействие всех слоев приложения
 */

import { BlockBuilderFacade, IBlockBuilderOptions } from '../BlockBuilderFacade';
import { IBlockDto, ICreateBlockDto } from '../core/types';

describe('BlockBuilderFacade Integration Tests', () => {
  let facade: BlockBuilderFacade;
  let container: HTMLDivElement;

  beforeEach(() => {
  // Создаем контейнер для UI
  container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);
  });

  afterEach(() => {
  // Очищаем DOM
  if (container.parentNode) {
    container.parentNode.removeChild(container);
  }
  });

  describe('Инициализация', () => {
  test('должен создать фасад с минимальной конфигурацией', () => {
    const options: IBlockBuilderOptions = {
      containerId: 'test-container',
      blockConfigs: {},
      autoInit: false // Отключаем автоматическую инициализацию для тестов
    };

    expect(() => {
      facade = new BlockBuilderFacade(options);
    }).not.toThrow();
  });

  test('должен использовать memory storage по умолчанию', async () => {
    const options: IBlockBuilderOptions = {
      containerId: 'test-container',
      blockConfigs: {},
      autoInit: false // Отключаем автоматическую инициализацию для тестов
    };

    facade = new BlockBuilderFacade(options);

    const block = await facade.createBlock({
      type: 'TestBlock',
      settings: {},
      props: {}
    });

    const retrieved = await facade.getBlock(block.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(block.id);
  });

  test('должен загрузить начальные блоки', async () => {
    const initialBlocks: IBlockDto[] = [
      {
        id: 'initial-1',
        type: 'Block1',
        settings: {},
        props: {},
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      },
      {
        id: 'initial-2',
        type: 'Block2',
        settings: {},
        props: {},
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      }
    ];

    const options: IBlockBuilderOptions = {
      containerId: 'test-container',
      blockConfigs: {
        'Block1': { title: 'Block 1' },
        'Block2': { title: 'Block 2' }
      },
      initialBlocks,
      autoInit: true  // Включаем autoInit для загрузки начальных блоков
    };

    facade = new BlockBuilderFacade(options);

    // Ждем асинхронной инициализации
    await new Promise(resolve => setTimeout(resolve, 200));

    const allBlocks = await facade.getAllBlocks();
    expect(allBlocks.length).toBeGreaterThanOrEqual(2);
  });

  test('должен установить тему', () => {
    const options: IBlockBuilderOptions = {
      containerId: 'test-container',
      blockConfigs: {},
      theme: 'dark',
      autoInit: false
    };

    facade = new BlockBuilderFacade(options);

    expect(facade.theme).toBe('dark');
  });

  test('должен установить локаль', () => {
    const options: IBlockBuilderOptions = {
      containerId: 'test-container',
      blockConfigs: {},
      locale: 'en',
      autoInit: false
    };

    facade = new BlockBuilderFacade(options);

    expect(facade.locale).toBe('en');
  });
  });

  describe('CRUD операции с блоками', () => {
  beforeEach(() => {
    const options: IBlockBuilderOptions = {
      containerId: 'test-container',
      blockConfigs: {},
      autoInit: false
    };

    facade = new BlockBuilderFacade(options);
  });

  test('должен создать блок через фасад', async () => {
    const blockData: ICreateBlockDto = {
      type: 'TestBlock',
      settings: { key: 'value' },
      props: { prop: 'value' }
    };

    const created = await facade.createBlock(blockData);

    expect(created.id).toBeDefined();
    expect(created.type).toBe('TestBlock');
    expect(created.settings).toEqual({ key: 'value' });
  });

  test('должен получить блок по ID', async () => {
    const created = await facade.createBlock({
      type: 'TestBlock',
      settings: {},
      props: {}
    });

    const retrieved = await facade.getBlock(created.id);

    expect(retrieved).toEqual(created);
  });

  test('должен обновить блок', async () => {
    const created = await facade.createBlock({
      type: 'TestBlock',
      settings: { key: 'oldValue' },
      props: {}
    });

    const updated = await facade.updateBlock(created.id, {
      settings: { key: 'newValue' }
    });

    expect(updated?.settings.key).toBe('newValue');
  });

  test('должен удалить блок', async () => {
    const created = await facade.createBlock({
      type: 'TestBlock',
      settings: {},
      props: {}
    });

    const deleted = await facade.deleteBlock(created.id);
    expect(deleted).toBe(true);

    const retrieved = await facade.getBlock(created.id);
    expect(retrieved).toBeNull();
  });

  test('должен дублировать блок', async () => {
    const original = await facade.createBlock({
      type: 'TestBlock',
      settings: { key: 'value' },
      props: { prop: 'value' }
    });

    const duplicated = await facade.duplicateBlock(original.id);

    expect(duplicated).toBeDefined();
    expect(duplicated?.id).not.toBe(original.id);
    expect(duplicated?.type).toBe(original.type);
    expect(duplicated?.settings).toEqual(original.settings);
  });

  test('должен получить все блоки', async () => {
    await facade.createBlock({ type: 'Block1', settings: {}, props: {} });
    await facade.createBlock({ type: 'Block2', settings: {}, props: {} });
    await facade.createBlock({ type: 'Block3', settings: {}, props: {} });

    const allBlocks = await facade.getAllBlocks();

    expect(allBlocks.length).toBeGreaterThanOrEqual(3);
  });

  test('должен получить блоки по типу', async () => {
    await facade.createBlock({ type: 'Button', settings: {}, props: {} });
    await facade.createBlock({ type: 'Text', settings: {}, props: {} });
    await facade.createBlock({ type: 'Button', settings: {}, props: {} });

    const buttons = await facade.getBlocksByType('Button');

    expect(buttons).toHaveLength(2);
    expect(buttons.every(b => b.type === 'Button')).toBe(true);
  });
  });

  describe('Работа с блокировкой и видимостью', () => {
  beforeEach(() => {
    const options: IBlockBuilderOptions = {
      containerId: 'test-container',
      blockConfigs: {},
      autoInit: false
    };

    facade = new BlockBuilderFacade(options);
  });

  test('должен заблокировать блок', async () => {
    const block = await facade.createBlock({
      type: 'TestBlock',
      settings: {},
      props: {}
    });

    const locked = await facade.setBlockLocked(block.id, true);

    expect(locked?.locked).toBe(true);
  });

  test('должен скрыть блок', async () => {
    const block = await facade.createBlock({
      type: 'TestBlock',
      settings: {},
      props: {}
    });

    const hidden = await facade.setBlockVisible(block.id, false);

    expect(hidden?.visible).toBe(false);
  });
  });

  describe('Работа с иерархией блоков', () => {
  beforeEach(() => {
    const options: IBlockBuilderOptions = {
      containerId: 'test-container',
      blockConfigs: {},
      autoInit: false
    };

    facade = new BlockBuilderFacade(options);
  });

  test('должен создать дочерний блок', async () => {
    const parent = await facade.createBlock({
      type: 'ParentBlock',
      settings: {},
      props: {}
    });

    const child = await facade.createBlock({
      type: 'ChildBlock',
      settings: {},
      props: {},
      parent: parent.id
    });

    expect(child.parent).toBe(parent.id);
  });

  test('должен получить дочерние блоки через getAllBlocks и фильтрацию', async () => {
    const parent = await facade.createBlock({
      type: 'ParentBlock',
      settings: {},
      props: {}
    });

    await facade.createBlock({
      type: 'ChildBlock1',
      settings: {},
      props: {},
      parent: parent.id
    });

    await facade.createBlock({
      type: 'ChildBlock2',
      settings: {},
      props: {},
      parent: parent.id
    });

    const allBlocks = await facade.getAllBlocks();
    const children = allBlocks.filter(b => b.parent === parent.id);

    expect(children).toHaveLength(2);
    expect(children.every(c => c.parent === parent.id)).toBe(true);
  });

  test('должен удалить родительский блок с дочерними', async () => {
    const parent = await facade.createBlock({
      type: 'ParentBlock',
      settings: {},
      props: {}
    });

    const child = await facade.createBlock({
      type: 'ChildBlock',
      settings: {},
      props: {},
      parent: parent.id
    });

    await facade.deleteBlock(parent.id);

    const retrievedParent = await facade.getBlock(parent.id);
    const retrievedChild = await facade.getBlock(child.id);

    expect(retrievedParent).toBeNull();
    expect(retrievedChild).toBeNull();
  });
  });

  describe('Работа с компонентами', () => {
  beforeEach(() => {
    const options: IBlockBuilderOptions = {
      containerId: 'test-container',
      blockConfigs: {},
      autoInit: false
    };

    facade = new BlockBuilderFacade(options);
  });

  test('должен зарегистрировать новый компонент', () => {
    const component = { name: 'NewComponent', template: '<div>New</div>' };

    facade.registerComponent('NewComponent', component);

    expect(facade.hasComponent('NewComponent')).toBe(true);
  });

  test('должен получить зарегистрированный компонент', () => {
    const component = { name: 'TestComponent', template: '<div>Test</div>' };
    facade.registerComponent('TestComponent', component);

    const retrieved = facade.getComponent('TestComponent');

    expect(retrieved).toBeDefined();
    expect(retrieved.name).toBe('TestComponent');
  });

  test('должен получить все компоненты', () => {
    const comp1 = { name: 'Comp1', template: '<div>1</div>' };
    const comp2 = { name: 'Comp2', template: '<div>2</div>' };

    facade.registerComponent('Comp1', comp1);
    facade.registerComponent('Comp2', comp2);

    const allComponents = facade.getAllComponents();

    expect(Object.keys(allComponents).length).toBeGreaterThanOrEqual(2);
    expect(allComponents).toHaveProperty('Comp1');
    expect(allComponents).toHaveProperty('Comp2');
  });
  });

  describe('Сохранение данных', () => {
  test('должен иметь onSave callback если передан', () => {
    const onSave = jest.fn().mockResolvedValue(true);

    const options: IBlockBuilderOptions = {
      containerId: 'test-container',
      blockConfigs: {},
      onSave,
      autoInit: false
    };

    facade = new BlockBuilderFacade(options);

    // Просто проверяем что фасад создан с onSave
    expect(facade).toBeDefined();
  });
  });

  describe('Управление данными', () => {
  beforeEach(() => {
    const options: IBlockBuilderOptions = {
      containerId: 'test-container',
      blockConfigs: {},
      autoInit: false
    };

    facade = new BlockBuilderFacade(options);
  });

  test('должен удалить все блоки через deleteBlock', async () => {
    const block1 = await facade.createBlock({ type: 'Block1', settings: {}, props: {} });
    const block2 = await facade.createBlock({ type: 'Block2', settings: {}, props: {} });

    await facade.deleteBlock(block1.id);
    await facade.deleteBlock(block2.id);

    const block1Retrieved = await facade.getBlock(block1.id);
    const block2Retrieved = await facade.getBlock(block2.id);

    expect(block1Retrieved).toBeNull();
    expect(block2Retrieved).toBeNull();
  });
  });

  describe('Получение всех блоков', () => {
  beforeEach(() => {
    const options: IBlockBuilderOptions = {
      containerId: 'test-container',
      blockConfigs: {},
      autoInit: false
    };

    facade = new BlockBuilderFacade(options);
  });

  test('должен получить все созданные блоки', async () => {
    const block1 = await facade.createBlock({ type: 'Block1', settings: { key: 'value1' }, props: {} });
    const block2 = await facade.createBlock({ type: 'Block2', settings: { key: 'value2' }, props: {} });

    const allBlocks = await facade.getAllBlocks();

    expect(allBlocks.length).toBeGreaterThanOrEqual(2);

    const ids = allBlocks.map(b => b.id);
    expect(ids).toContain(block1.id);
    expect(ids).toContain(block2.id);
  });
  });
});

