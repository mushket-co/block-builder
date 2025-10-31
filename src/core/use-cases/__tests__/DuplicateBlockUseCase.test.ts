import { DuplicateBlockUseCase } from '../DuplicateBlockUseCase';
import { IBlockRepository } from '../../ports/BlockRepository';
import { IBlockDto } from '../../types';

describe('DuplicateBlockUseCase', () => {
  let useCase: DuplicateBlockUseCase;
  let mockRepository: jest.Mocked<IBlockRepository>;

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

  useCase = new DuplicateBlockUseCase(mockRepository);
  });

  describe('execute', () => {
  test('должен дублировать простой блок', async () => {
    const originalBlock: IBlockDto = {
      id: 'original',
      type: 'TestBlock',
      settings: { key: 'value' },
      props: { prop: 'value' },
      style: { color: 'red' },
      metadata: {
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        version: 1
      }
    };

    const duplicatedBlock: IBlockDto = {
      id: 'duplicated',
      type: 'TestBlock',
      settings: { key: 'value' },
      props: { prop: 'value' },
      style: { color: 'red' },
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

    const result = await useCase.execute('original');

    expect(result).toBeDefined();
    expect(result?.id).toBe('duplicated');
    expect(result?.type).toBe('TestBlock');
    expect(result?.settings).toEqual({ key: 'value' });
    expect(result?.props).toEqual({ prop: 'value' });
    expect(result?.locked).toBe(false);
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
  });

  test('должен вернуть null если блок не найден', async () => {
    mockRepository.getById.mockResolvedValue(null);

    const result = await useCase.execute('non-existent');

    expect(result).toBeNull();
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  test('должен разблокировать дубликат заблокированного блока', async () => {
    const lockedBlock: IBlockDto = {
      id: 'locked',
      type: 'LockedBlock',
      settings: {},
      props: {},
      locked: true
    };

    const duplicatedBlock: IBlockDto = {
      id: 'duplicated',
      type: 'LockedBlock',
      settings: {},
      props: {},
      locked: false,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    mockRepository.getById.mockResolvedValue(lockedBlock);
    mockRepository.getChildren.mockResolvedValue([]);
    mockRepository.create.mockResolvedValue(duplicatedBlock);

    const result = await useCase.execute('locked');

    expect(result?.locked).toBe(false);
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        locked: false
      })
    );
  });

  test('должен сохранить visible состояние', async () => {
    const hiddenBlock: IBlockDto = {
      id: 'hidden',
      type: 'HiddenBlock',
      settings: {},
      props: {},
      visible: false
    };

    const duplicatedBlock: IBlockDto = {
      id: 'duplicated',
      type: 'HiddenBlock',
      settings: {},
      props: {},
      visible: false,
      locked: false,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    mockRepository.getById.mockResolvedValue(hiddenBlock);
    mockRepository.getChildren.mockResolvedValue([]);
    mockRepository.create.mockResolvedValue(duplicatedBlock);

    const result = await useCase.execute('hidden');

    expect(result?.visible).toBe(false);
  });

  test('должен дублировать блок с render конфигурацией', async () => {
    const blockWithRender: IBlockDto = {
      id: 'with-render',
      type: 'CustomBlock',
      settings: {},
      props: {},
      render: {
        kind: 'html',
        template: '<div>Test</div>'
      }
    };

    const duplicatedBlock: IBlockDto = {
      id: 'duplicated',
      ...blockWithRender,
      locked: false,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    mockRepository.getById.mockResolvedValue(blockWithRender);
    mockRepository.getChildren.mockResolvedValue([]);
    mockRepository.create.mockResolvedValue(duplicatedBlock);

    const result = await useCase.execute('with-render');

    expect(result?.render).toEqual({
      kind: 'html',
      template: '<div>Test</div>'
    });
  });

  test('должен сохранить parent при дублировании', async () => {
    const childBlock: IBlockDto = {
      id: 'child',
      type: 'ChildBlock',
      settings: {},
      props: {},
      parent: 'parent-id'
    };

    const duplicatedBlock: IBlockDto = {
      id: 'duplicated',
      type: 'ChildBlock',
      settings: {},
      props: {},
      parent: 'parent-id',
      locked: false,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    mockRepository.getById.mockResolvedValue(childBlock);
    mockRepository.getChildren.mockResolvedValue([]);
    mockRepository.create.mockResolvedValue(duplicatedBlock);

    const result = await useCase.execute('child');

    expect(result?.parent).toBe('parent-id');
  });

  test('должен дублировать блок с дочерними блоками', async () => {
    const parentBlock: IBlockDto = {
      id: 'parent',
      type: 'Parent',
      settings: {},
      props: {}
    };

    const child1: IBlockDto = {
      id: 'child-1',
      type: 'Child',
      settings: {},
      props: {},
      parent: 'parent'
    };

    const child2: IBlockDto = {
      id: 'child-2',
      type: 'Child',
      settings: {},
      props: {},
      parent: 'parent'
    };

    const duplicatedParent: IBlockDto = {
      id: 'duplicated-parent',
      type: 'Parent',
      settings: {},
      props: {},
      locked: false,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    const duplicatedChild1: IBlockDto = {
      id: 'duplicated-child-1',
      type: 'Child',
      settings: {},
      props: {},
      parent: 'duplicated-parent',
      locked: false,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    const duplicatedChild2: IBlockDto = {
      id: 'duplicated-child-2',
      type: 'Child',
      settings: {},
      props: {},
      parent: 'duplicated-parent',
      locked: false,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    mockRepository.getById.mockResolvedValue(parentBlock);
    mockRepository.getChildren
      .mockResolvedValueOnce([child1, child2]) // Дети родителя
      .mockResolvedValueOnce([]) // Дети child-1
      .mockResolvedValueOnce([]); // Дети child-2
    
    mockRepository.create
      .mockResolvedValueOnce(duplicatedParent)
      .mockResolvedValueOnce(duplicatedChild1)
      .mockResolvedValueOnce(duplicatedChild2);

    const result = await useCase.execute('parent');

    expect(result).toBeDefined();
    expect(mockRepository.create).toHaveBeenCalledTimes(3); // parent + 2 children
    
    // Проверяем что дочерние блоки созданы с правильным parent
    const createCalls = mockRepository.create.mock.calls;
    expect(createCalls[1][0]).toMatchObject({
      type: 'Child',
      parent: 'duplicated-parent'
    });
    expect(createCalls[2][0]).toMatchObject({
      type: 'Child',
      parent: 'duplicated-parent'
    });
  });

  test('должен рекурсивно дублировать вложенные блоки', async () => {
    const grandParent: IBlockDto = {
      id: 'grandparent',
      type: 'GrandParent',
      settings: {},
      props: {}
    };

    const parent: IBlockDto = {
      id: 'parent',
      type: 'Parent',
      settings: {},
      props: {},
      parent: 'grandparent'
    };

    const child: IBlockDto = {
      id: 'child',
      type: 'Child',
      settings: {},
      props: {},
      parent: 'parent'
    };

    const duplicatedGrandParent: IBlockDto = {
      id: 'dup-grandparent',
      type: 'GrandParent',
      settings: {},
      props: {},
      locked: false,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    const duplicatedParent: IBlockDto = {
      id: 'dup-parent',
      type: 'Parent',
      settings: {},
      props: {},
      parent: 'dup-grandparent',
      locked: false,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    const duplicatedChild: IBlockDto = {
      id: 'dup-child',
      type: 'Child',
      settings: {},
      props: {},
      parent: 'dup-parent',
      locked: false,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    mockRepository.getById.mockResolvedValue(grandParent);
    mockRepository.getChildren
      .mockResolvedValueOnce([parent]) // Дети grandparent
      .mockResolvedValueOnce([child]) // Дети parent
      .mockResolvedValueOnce([]); // Дети child
    
    mockRepository.create
      .mockResolvedValueOnce(duplicatedGrandParent)
      .mockResolvedValueOnce(duplicatedParent)
      .mockResolvedValueOnce(duplicatedChild);

    const result = await useCase.execute('grandparent');

    expect(result).toBeDefined();
    expect(mockRepository.create).toHaveBeenCalledTimes(3);
  });

  test('должен создать новые metadata для дубликата', async () => {
    const originalBlock: IBlockDto = {
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

    mockRepository.getById.mockResolvedValue(originalBlock);
    mockRepository.getChildren.mockResolvedValue([]);
    mockRepository.create.mockImplementation((blockData) => {
      return Promise.resolve({
        ...blockData,
        id: 'duplicated'
      } as IBlockDto);
    });

    await useCase.execute('original');

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          version: 1
        })
      })
    );
  });

  test('должен обработать блок без стилей', async () => {
    const blockWithoutStyle: IBlockDto = {
      id: 'no-style',
      type: 'SimpleBlock',
      settings: {},
      props: {}
    };

    const duplicatedBlock: IBlockDto = {
      id: 'duplicated',
      type: 'SimpleBlock',
      settings: {},
      props: {},
      locked: false,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    mockRepository.getById.mockResolvedValue(blockWithoutStyle);
    mockRepository.getChildren.mockResolvedValue([]);
    mockRepository.create.mockResolvedValue(duplicatedBlock);

    const result = await useCase.execute('no-style');

    expect(result).toBeDefined();
    expect(result?.style).toBeUndefined();
  });
  });
});

