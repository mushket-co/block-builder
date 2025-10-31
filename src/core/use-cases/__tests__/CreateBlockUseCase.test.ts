import { CreateBlockUseCase } from '../CreateBlockUseCase';
import { IBlockRepository } from '../../ports/BlockRepository';
import { ICreateBlockDto, IBlockDto } from '../../types';

describe('CreateBlockUseCase', () => {
  let useCase: CreateBlockUseCase;
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

  useCase = new CreateBlockUseCase(mockRepository);
  });

  describe('execute', () => {
  test('должен создать блок с валидными данными', async () => {
    const blockData: ICreateBlockDto = {
      type: 'TestBlock',
      settings: { key: 'value' },
      props: { prop: 'value' }
    };

    const createdBlock: IBlockDto = {
      id: 'generated-id',
      type: 'TestBlock',
      settings: { key: 'value' },
      props: { prop: 'value' },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    mockRepository.create.mockResolvedValue(createdBlock);

    const result = await useCase.execute(blockData);

    expect(mockRepository.create).toHaveBeenCalledTimes(1);
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'TestBlock',
        settings: { key: 'value' },
        props: { prop: 'value' },
        metadata: expect.objectContaining({
          version: 1
        })
      })
    );
    expect(result).toEqual(createdBlock);
  });

  test('должен добавлять metadata при создании', async () => {
    const blockData: ICreateBlockDto = {
      type: 'TestBlock',
      settings: {},
      props: {}
    };

    const createdBlock: IBlockDto = {
      id: 'id',
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

    await useCase.execute(blockData);

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

  test('должен бросить ошибку если type не указан', async () => {
    const blockData = {
      settings: {},
      props: {}
    } as ICreateBlockDto;

    await expect(useCase.execute(blockData)).rejects.toThrow(
      'Block type is required and must be a string'
    );
  });

  test('должен бросить ошибку если type не строка', async () => {
    const blockData = {
      type: 123,
      settings: {},
      props: {}
    } as any;

    await expect(useCase.execute(blockData)).rejects.toThrow(
      'Block type is required and must be a string'
    );
  });

  test('должен создать блок со стилями', async () => {
    const blockData: ICreateBlockDto = {
      type: 'StyledBlock',
      settings: {},
      props: {},
      style: { color: 'red', fontSize: 14 }
    };

    const createdBlock: IBlockDto = {
      id: 'id',
      ...blockData,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    mockRepository.create.mockResolvedValue(createdBlock);

    const result = await useCase.execute(blockData);

    expect(result.style).toEqual({ color: 'red', fontSize: 14 });
  });

  test('должен создать блок с render конфигурацией', async () => {
    const blockData: ICreateBlockDto = {
      type: 'CustomBlock',
      settings: {},
      props: {},
      render: {
        kind: 'html',
        template: '<div>Test</div>'
      }
    };

    const createdBlock: IBlockDto = {
      id: 'id',
      ...blockData,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    mockRepository.create.mockResolvedValue(createdBlock);

    const result = await useCase.execute(blockData);

    expect(result.render).toEqual({
      kind: 'html',
      template: '<div>Test</div>'
    });
  });

  test('должен создать блок с родителем', async () => {
    const blockData: ICreateBlockDto = {
      type: 'ChildBlock',
      settings: {},
      props: {},
      parent: 'parent-id'
    };

    const createdBlock: IBlockDto = {
      id: 'id',
      ...blockData,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    mockRepository.create.mockResolvedValue(createdBlock);

    const result = await useCase.execute(blockData);

    expect(result.parent).toBe('parent-id');
  });

  test('должен создать скрытый блок', async () => {
    const blockData: ICreateBlockDto = {
      type: 'HiddenBlock',
      settings: {},
      props: {},
      visible: false
    };

    const createdBlock: IBlockDto = {
      id: 'id',
      ...blockData,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    mockRepository.create.mockResolvedValue(createdBlock);

    const result = await useCase.execute(blockData);

    expect(result.visible).toBe(false);
  });

  test('должен создать заблокированный блок', async () => {
    const blockData: ICreateBlockDto = {
      type: 'LockedBlock',
      settings: {},
      props: {},
      locked: true
    };

    const createdBlock: IBlockDto = {
      id: 'id',
      ...blockData,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    mockRepository.create.mockResolvedValue(createdBlock);

    const result = await useCase.execute(blockData);

    expect(result.locked).toBe(true);
  });

  test('должен создать блок с formConfig', async () => {
    const formConfig = {
      fields: [
        { name: 'title', type: 'text', label: 'Title' }
      ]
    };

    const blockData: ICreateBlockDto = {
      type: 'FormBlock',
      settings: {},
      props: {},
      formConfig
    };

    const createdBlock: IBlockDto = {
      id: 'id',
      ...blockData,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    mockRepository.create.mockResolvedValue(createdBlock);

    const result = await useCase.execute(blockData);

    expect(result.formConfig).toEqual(formConfig);
  });
  });
});

