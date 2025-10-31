import { BlockManagementUseCase } from '../BlockManagementUseCase';
import { IBlockRepository } from '../../ports/BlockRepository';
import { IComponentRegistry } from '../../ports/ComponentRegistry';
import { ICreateBlockDto, IUpdateBlockDto, IBlockDto } from '../../types';

describe('BlockManagementUseCase', () => {
  let useCase: BlockManagementUseCase;
  let mockRepository: jest.Mocked<IBlockRepository>;
  let mockRegistry: jest.Mocked<IComponentRegistry>;

  beforeEach(() => {
  mockRepository = {
    create: jest.fn(),
    getById: jest.fn(),
    getAll: jest.fn(),
    getByType: jest.fn(),
    getChildren: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
    count: jest.fn(),
    clear: jest.fn()
  };

  mockRegistry = {
    register: jest.fn(),
    get: jest.fn(),
    has: jest.fn(),
    getAll: jest.fn(),
    unregister: jest.fn(),
    clear: jest.fn()
  };

  useCase = new BlockManagementUseCase(mockRepository, mockRegistry);
  });

  describe('createBlock', () => {
  test('должен создать блок через CreateBlockUseCase', async () => {
    const blockData: ICreateBlockDto = {
      type: 'TestBlock',
      settings: {},
      props: {}
    };

    const createdBlock: IBlockDto = {
      id: 'new-id',
      type: 'TestBlock',
      settings: {},
      props: {},
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    mockRepository.create.mockResolvedValue(createdBlock);

    const result = await useCase.createBlock(blockData);

    expect(result).toEqual(createdBlock);
    expect(mockRepository.create).toHaveBeenCalled();
  });
  });

  describe('getBlock', () => {
  test('должен получить блок по ID', async () => {
    const mockBlock: IBlockDto = {
      id: 'test-id',
      type: 'TestBlock',
      settings: {},
      props: {}
    };

    mockRepository.getById.mockResolvedValue(mockBlock);

    const result = await useCase.getBlock('test-id');

    expect(result).toEqual(mockBlock);
    expect(mockRepository.getById).toHaveBeenCalledWith('test-id');
  });

  test('должен вернуть null если блок не найден', async () => {
    mockRepository.getById.mockResolvedValue(null);

    const result = await useCase.getBlock('non-existent');

    expect(result).toBeNull();
  });
  });

  describe('getAllBlocks', () => {
  test('должен получить все блоки', async () => {
    const blocks: IBlockDto[] = [
      { id: '1', type: 'Block1', settings: {}, props: {} },
      { id: '2', type: 'Block2', settings: {}, props: {} }
    ];

    mockRepository.getAll.mockResolvedValue(blocks);

    const result = await useCase.getAllBlocks();

    expect(result).toEqual(blocks);
    expect(mockRepository.getAll).toHaveBeenCalled();
  });

  test('должен вернуть пустой массив если блоков нет', async () => {
    mockRepository.getAll.mockResolvedValue([]);

    const result = await useCase.getAllBlocks();

    expect(result).toEqual([]);
  });
  });

  describe('updateBlock', () => {
  test('должен обновить блок через UpdateBlockUseCase', async () => {
    const updates: IUpdateBlockDto = {
      settings: { key: 'newValue' }
    };

    const existingBlock: IBlockDto = {
      id: 'test-id',
      type: 'TestBlock',
      settings: { key: 'oldValue' },
      props: {}
    };

    const updatedBlock: IBlockDto = {
      ...existingBlock,
      settings: { key: 'newValue' }
    };

    mockRepository.getById.mockResolvedValue(existingBlock);
    mockRepository.update.mockResolvedValue(updatedBlock);

    const result = await useCase.updateBlock('test-id', updates);

    expect(result).toEqual(updatedBlock);
    expect(mockRepository.getById).toHaveBeenCalledWith('test-id');
    expect(mockRepository.update).toHaveBeenCalledWith('test-id', updates);
  });
  });

  describe('deleteBlock', () => {
  test('должен удалить блок через DeleteBlockUseCase', async () => {
    const mockBlock: IBlockDto = {
      id: 'test-id',
      type: 'TestBlock',
      settings: {},
      props: {}
    };

    mockRepository.getById.mockResolvedValue(mockBlock);
    mockRepository.getChildren.mockResolvedValue([]);
    mockRepository.delete.mockResolvedValue(true);

    const result = await useCase.deleteBlock('test-id');

    expect(result).toBe(true);
    expect(mockRepository.getById).toHaveBeenCalledWith('test-id');
    expect(mockRepository.delete).toHaveBeenCalledWith('test-id');
  });
  });

  describe('duplicateBlock', () => {
  test('должен дублировать блок через DuplicateBlockUseCase', async () => {
    const originalBlock: IBlockDto = {
      id: 'original',
      type: 'TestBlock',
      settings: {},
      props: {}
    };

    const duplicatedBlock: IBlockDto = {
      id: 'duplicated',
      type: 'TestBlock',
      settings: {},
      props: {},
      locked: false,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    mockRepository.getById.mockResolvedValue(originalBlock);
    mockRepository.getChildren.mockResolvedValue([]);
    mockRepository.create.mockResolvedValue(duplicatedBlock);

    const result = await useCase.duplicateBlock('original');

    expect(result).toEqual(duplicatedBlock);
  });
  });

  describe('setBlockLocked', () => {
  test('должен заблокировать блок', async () => {
    const block: IBlockDto = {
      id: 'test-id',
      type: 'TestBlock',
      settings: {},
      props: {},
      locked: false
    };

    const lockedBlock: IBlockDto = {
      ...block,
      locked: true
    };

    mockRepository.getById.mockResolvedValue(block);
    mockRepository.update.mockResolvedValue(lockedBlock);

    const result = await useCase.setBlockLocked('test-id', true);

    expect(result?.locked).toBe(true);
    expect(mockRepository.update).toHaveBeenCalledWith('test-id', { locked: true });
  });

  test('должен разблокировать блок', async () => {
    const block: IBlockDto = {
      id: 'test-id',
      type: 'TestBlock',
      settings: {},
      props: {},
      locked: true
    };

    const unlockedBlock: IBlockDto = {
      ...block,
      locked: false
    };

    mockRepository.getById.mockResolvedValue(block);
    mockRepository.update.mockResolvedValue(unlockedBlock);

    const result = await useCase.setBlockLocked('test-id', false);

    expect(result?.locked).toBe(false);
  });
  });

  describe('setBlockVisible', () => {
  test('должен показать блок', async () => {
    const block: IBlockDto = {
      id: 'test-id',
      type: 'TestBlock',
      settings: {},
      props: {},
      visible: false
    };

    const visibleBlock: IBlockDto = {
      ...block,
      visible: true
    };

    mockRepository.getById.mockResolvedValue(block);
    mockRepository.update.mockResolvedValue(visibleBlock);

    const result = await useCase.setBlockVisible('test-id', true);

    expect(result?.visible).toBe(true);
    expect(mockRepository.update).toHaveBeenCalledWith('test-id', { visible: true });
  });

  test('должен скрыть блок', async () => {
    const block: IBlockDto = {
      id: 'test-id',
      type: 'TestBlock',
      settings: {},
      props: {},
      visible: true
    };

    const hiddenBlock: IBlockDto = {
      ...block,
      visible: false
    };

    mockRepository.getById.mockResolvedValue(block);
    mockRepository.update.mockResolvedValue(hiddenBlock);

    const result = await useCase.setBlockVisible('test-id', false);

    expect(result?.visible).toBe(false);
  });
  });

  describe('getBlocksByType', () => {
  test('должен получить блоки по типу', async () => {
    const blocks: IBlockDto[] = [
      { id: '1', type: 'Button', settings: {}, props: {} },
      { id: '2', type: 'Button', settings: {}, props: {} }
    ];

    mockRepository.getByType.mockResolvedValue(blocks);

    const result = await useCase.getBlocksByType('Button');

    expect(result).toEqual(blocks);
    expect(mockRepository.getByType).toHaveBeenCalledWith('Button');
  });
  });

  describe('getChildBlocks', () => {
  test('должен получить дочерние блоки', async () => {
    const children: IBlockDto[] = [
      { id: 'child-1', type: 'Child', settings: {}, props: {}, parent: 'parent-id' },
      { id: 'child-2', type: 'Child', settings: {}, props: {}, parent: 'parent-id' }
    ];

    mockRepository.getChildren.mockResolvedValue(children);

    const result = await useCase.getChildBlocks('parent-id');

    expect(result).toEqual(children);
    expect(mockRepository.getChildren).toHaveBeenCalledWith('parent-id');
  });
  });

  describe('reorderBlocks', () => {
  test('должен переупорядочить блоки', async () => {
    const blockIds = ['block-1', 'block-2', 'block-3'];
    mockRepository.update.mockResolvedValue({} as IBlockDto);

    const result = await useCase.reorderBlocks(blockIds);

    expect(result).toBe(true);
    expect(mockRepository.update).toHaveBeenCalledTimes(3);
    expect(mockRepository.update).toHaveBeenNthCalledWith(1, 'block-1', { order: 0 });
    expect(mockRepository.update).toHaveBeenNthCalledWith(2, 'block-2', { order: 1 });
    expect(mockRepository.update).toHaveBeenNthCalledWith(3, 'block-3', { order: 2 });
  });

  test('должен вернуть false при ошибке', async () => {
    const blockIds = ['block-1', 'block-2'];
    mockRepository.update.mockRejectedValue(new Error('Update failed'));

    const result = await useCase.reorderBlocks(blockIds);

    expect(result).toBe(false);
  });

  test('должен обработать пустой массив', async () => {
    const result = await useCase.reorderBlocks([]);

    expect(result).toBe(true);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });
  });

  describe('Управление компонентами', () => {
  describe('registerComponent', () => {
    test('должен зарегистрировать компонент', () => {
      const mockComponent = { name: 'TestComponent', template: '<div>Test</div>' };

      useCase.registerComponent('TestComponent', mockComponent);

      expect(mockRegistry.register).toHaveBeenCalledWith('TestComponent', mockComponent);
    });
  });

  describe('getComponent', () => {
    test('должен получить компонент', () => {
      const mockComponent = { name: 'TestComponent' };
      mockRegistry.get.mockReturnValue(mockComponent);

      const result = useCase.getComponent('TestComponent');

      expect(result).toEqual(mockComponent);
      expect(mockRegistry.get).toHaveBeenCalledWith('TestComponent');
    });
  });

  describe('hasComponent', () => {
    test('должен вернуть true если компонент существует', () => {
      mockRegistry.has.mockReturnValue(true);

      const result = useCase.hasComponent('TestComponent');

      expect(result).toBe(true);
      expect(mockRegistry.has).toHaveBeenCalledWith('TestComponent');
    });

    test('должен вернуть false если компонент не существует', () => {
      mockRegistry.has.mockReturnValue(false);

      const result = useCase.hasComponent('NonExistent');

      expect(result).toBe(false);
    });
  });

  describe('getAllComponents', () => {
    test('должен получить все компоненты', () => {
      const components = {
        Comp1: { name: 'Comp1' },
        Comp2: { name: 'Comp2' }
      };
      mockRegistry.getAll.mockReturnValue(components);

      const result = useCase.getAllComponents();

      expect(result).toEqual(components);
      expect(mockRegistry.getAll).toHaveBeenCalled();
    });
  });

  describe('unregisterComponent', () => {
    test('должен удалить компонент', () => {
      mockRegistry.unregister.mockReturnValue(true);

      const result = useCase.unregisterComponent('TestComponent');

      expect(result).toBe(true);
      expect(mockRegistry.unregister).toHaveBeenCalledWith('TestComponent');
    });
  });

  describe('registerComponents', () => {
    test('должен зарегистрировать множество компонентов', () => {
      const components = {
        Comp1: { name: 'Comp1' },
        Comp2: { name: 'Comp2' }
      };

      useCase.registerComponents(components);

      expect(mockRegistry.register).toHaveBeenCalledTimes(2);
    });
  });

  describe('getComponentRegistry', () => {
    test('должен вернуть реестр компонентов', () => {
      const result = useCase.getComponentRegistry();

      expect(result).toBe(mockRegistry);
    });
  });
  });

  describe('Vue3 блоки', () => {
  describe('createVueBlock', () => {
    test('должен создать Vue блок', async () => {
      const mockComponent = { name: 'VueComponent', template: '<div>Vue</div>' };
      mockRegistry.has.mockReturnValue(true);

      const createdBlock: IBlockDto = {
        id: 'vue-block',
        type: 'VueBlock',
        settings: {},
        props: { text: 'Hello' },
        render: {
          kind: 'component',
          framework: 'vue',
          name: 'VueComponent',
          props: { text: 'Hello' }
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      };

      mockRepository.create.mockResolvedValue(createdBlock);

      const result = await useCase.createVueBlock(
        'VueBlock',
        'VueComponent',
        { text: 'Hello' }
      );

      expect(result.render).toEqual({
        kind: 'component',
        framework: 'vue',
        name: 'VueComponent',
        props: { text: 'Hello' }
      });
      expect(mockRegistry.has).toHaveBeenCalledWith('VueComponent');
    });

    test('должен бросить ошибку если компонент не зарегистрирован', async () => {
      mockRegistry.has.mockReturnValue(false);

      await expect(
        useCase.createVueBlock('VueBlock', 'UnknownComponent', {})
      ).rejects.toThrow("Component 'UnknownComponent' is not registered");
    });

    test('должен создать Vue блок с настройками', async () => {
      mockRegistry.has.mockReturnValue(true);

      const createdBlock: IBlockDto = {
        id: 'vue-block',
        type: 'VueBlock',
        settings: { theme: 'dark' },
        props: {},
        render: {
          kind: 'component',
          framework: 'vue',
          name: 'VueComponent',
          props: {}
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      };

      mockRepository.create.mockResolvedValue(createdBlock);

      const result = await useCase.createVueBlock(
        'VueBlock',
        'VueComponent',
        {},
        { theme: 'dark' }
      );

      expect(result.settings).toEqual({ theme: 'dark' });
    });
  });

  describe('updateVueComponent', () => {
    test('должен обновить Vue компонент блока', async () => {
      const block: IBlockDto = {
        id: 'vue-block',
        type: 'VueBlock',
        settings: {},
        props: {}
      };

      const updatedBlock: IBlockDto = {
        ...block,
        render: {
          kind: 'component',
          framework: 'vue',
          name: 'NewComponent',
          props: { updated: true }
        }
      };

      mockRegistry.has.mockReturnValue(true);
      mockRepository.getById.mockResolvedValue(block);
      mockRepository.update.mockResolvedValue(updatedBlock);

      const result = await useCase.updateVueComponent(
        'vue-block',
        'NewComponent',
        { updated: true }
      );

      expect(result?.render).toEqual({
        kind: 'component',
        framework: 'vue',
        name: 'NewComponent',
        props: { updated: true }
      });
    });

    test('должен бросить ошибку если компонент не зарегистрирован', async () => {
      mockRegistry.has.mockReturnValue(false);

      await expect(
        useCase.updateVueComponent('vue-block', 'UnknownComponent', {})
      ).rejects.toThrow("Component 'UnknownComponent' is not registered");
    });
  });
  });
});

