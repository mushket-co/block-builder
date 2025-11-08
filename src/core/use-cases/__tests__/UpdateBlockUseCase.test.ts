import { UpdateBlockUseCase } from '../UpdateBlockUseCase';
import { IBlockRepository } from '../../ports/BlockRepository';
import { IUpdateBlockDto, IBlockDto } from '../../types';
describe('UpdateBlockUseCase', () => {
  let useCase: UpdateBlockUseCase;
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
  useCase = new UpdateBlockUseCase(mockRepository);
  });
  const mockExistingBlock: IBlockDto = {
  id: 'test-block',
  type: 'TestBlock',
  settings: { oldKey: 'oldValue' },
  props: { oldProp: 'oldValue' },
  metadata: {
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    version: 1
  }
  };
  describe('execute', () => {
  test('должен обновить блок с валидными данными', async () => {
    const updates: IUpdateBlockDto = {
      settings: { newKey: 'newValue' },
      props: { newProp: 'newValue' }
    };
    const updatedBlock: IBlockDto = {
      ...mockExistingBlock,
      settings: { oldKey: 'oldValue', newKey: 'newValue' },
      props: { oldProp: 'oldValue', newProp: 'newValue' },
      metadata: {
        ...mockExistingBlock.metadata!,
        version: 2
      }
    };
    mockRepository.getById.mockResolvedValue(mockExistingBlock);
    mockRepository.update.mockResolvedValue(updatedBlock);
    const result = await useCase.execute('test-block', updates);
    expect(mockRepository.getById).toHaveBeenCalledWith('test-block');
    expect(mockRepository.update).toHaveBeenCalledWith('test-block', updates);
    expect(result).toEqual(updatedBlock);
  });
  test('должен вернуть null если блок не найден', async () => {
    mockRepository.getById.mockResolvedValue(null);
    const result = await useCase.execute('non-existent', {});
    expect(mockRepository.getById).toHaveBeenCalledWith('non-existent');
    expect(mockRepository.update).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
  test('должен обновить только settings', async () => {
    const updates: IUpdateBlockDto = {
      settings: { newSetting: 'value' }
    };
    const updatedBlock = { ...mockExistingBlock };
    mockRepository.getById.mockResolvedValue(mockExistingBlock);
    mockRepository.update.mockResolvedValue(updatedBlock);
    await useCase.execute('test-block', updates);
    expect(mockRepository.update).toHaveBeenCalledWith('test-block', updates);
  });
  test('должен обновить только props', async () => {
    const updates: IUpdateBlockDto = {
      props: { newProp: 'value' }
    };
    const updatedBlock = { ...mockExistingBlock };
    mockRepository.getById.mockResolvedValue(mockExistingBlock);
    mockRepository.update.mockResolvedValue(updatedBlock);
    await useCase.execute('test-block', updates);
    expect(mockRepository.update).toHaveBeenCalledWith('test-block', updates);
  });
  test('должен обновить только style', async () => {
    const updates: IUpdateBlockDto = {
      style: { color: 'red' }
    };
    const updatedBlock = { ...mockExistingBlock };
    mockRepository.getById.mockResolvedValue(mockExistingBlock);
    mockRepository.update.mockResolvedValue(updatedBlock);
    await useCase.execute('test-block', updates);
    expect(mockRepository.update).toHaveBeenCalledWith('test-block', updates);
  });
  test('должен обновить visible', async () => {
    const updates: IUpdateBlockDto = {
      visible: false
    };
    const updatedBlock = { ...mockExistingBlock, visible: false };
    mockRepository.getById.mockResolvedValue(mockExistingBlock);
    mockRepository.update.mockResolvedValue(updatedBlock);
    const result = await useCase.execute('test-block', updates);
    expect(result?.visible).toBe(false);
  });
  test('должен обновить locked', async () => {
    const updates: IUpdateBlockDto = {
      locked: true
    };
    const updatedBlock = { ...mockExistingBlock, locked: true };
    mockRepository.getById.mockResolvedValue(mockExistingBlock);
    mockRepository.update.mockResolvedValue(updatedBlock);
    const result = await useCase.execute('test-block', updates);
    expect(result?.locked).toBe(true);
  });
  test('должен обновить render', async () => {
    const updates: IUpdateBlockDto = {
      render: { kind: 'html', template: '<div>New</div>' }
    };
    const updatedBlock = { ...mockExistingBlock, render: updates.render };
    mockRepository.getById.mockResolvedValue(mockExistingBlock);
    mockRepository.update.mockResolvedValue(updatedBlock);
    const result = await useCase.execute('test-block', updates);
    expect(result?.render).toEqual(updates.render);
  });
  test('должен обновить formConfig', async () => {
    const formConfig = { fields: [{ name: 'test', type: 'text' }] };
    const updates: IUpdateBlockDto = {
      formConfig
    };
    const updatedBlock = { ...mockExistingBlock, formConfig };
    mockRepository.getById.mockResolvedValue(mockExistingBlock);
    mockRepository.update.mockResolvedValue(updatedBlock);
    const result = await useCase.execute('test-block', updates);
    expect(result?.formConfig).toEqual(formConfig);
  });
  });
  describe('Валидация settings', () => {
  beforeEach(() => {
    mockRepository.getById.mockResolvedValue(mockExistingBlock);
  });
  test('должен принять примитивные типы в settings', async () => {
    const updates: IUpdateBlockDto = {
      settings: {
        stringValue: 'test',
        numberValue: 42,
        booleanValue: true,
        nullValue: null
      }
    };
    mockRepository.update.mockResolvedValue({ ...mockExistingBlock, settings: updates.settings! });
    await expect(useCase.execute('test-block', updates)).resolves.toBeDefined();
  });
  test('должен бросить ошибку для непримитивных типов в settings', async () => {
    const updates: IUpdateBlockDto = {
      settings: {
        objectValue: { nested: 'value' }
      }
    };
    await expect(useCase.execute('test-block', updates)).rejects.toThrow(
      "Invalid setting value for key 'objectValue': must be primitive type"
    );
  });
  test('должен бросить ошибку для массивов в settings', async () => {
    const updates: IUpdateBlockDto = {
      settings: {
        arrayValue: [1, 2, 3]
      }
    };
    await expect(useCase.execute('test-block', updates)).rejects.toThrow(
      "Invalid setting value for key 'arrayValue': must be primitive type"
    );
  });
  });
  describe('Валидация props', () => {
  beforeEach(() => {
    mockRepository.getById.mockResolvedValue(mockExistingBlock);
  });
  test('должен принять примитивные типы в props', async () => {
    const updates: IUpdateBlockDto = {
      props: {
        stringValue: 'test',
        numberValue: 42,
        booleanValue: true,
        nullValue: null
      }
    };
    mockRepository.update.mockResolvedValue({ ...mockExistingBlock, props: updates.props! });
    await expect(useCase.execute('test-block', updates)).resolves.toBeDefined();
  });
  test('должен принять массивы в props (для repeater полей)', async () => {
    const updates: IUpdateBlockDto = {
      props: {
        cards: [{ title: 'Card 1' }, { title: 'Card 2' }],
        slides: [{ image: 'img1.jpg' }]
      }
    };
    mockRepository.update.mockResolvedValue({ ...mockExistingBlock, props: updates.props! });
    await expect(useCase.execute('test-block', updates)).resolves.toBeDefined();
  });
  test('должен принять spacing объект в props', async () => {
    const updates: IUpdateBlockDto = {
      props: {
        spacing: {
          mobile: { top: '10px', bottom: '10px' },
          desktop: { top: '20px', bottom: '20px' }
        }
      }
    };
    mockRepository.update.mockResolvedValue({ ...mockExistingBlock, props: updates.props! });
    await expect(useCase.execute('test-block', updates)).resolves.toBeDefined();
  });
  test('должен бросить ошибку для непримитивных типов в props (кроме spacing и массивов)', async () => {
    const updates: IUpdateBlockDto = {
      props: {
        objectValue: { nested: 'value' }
      }
    };
    await expect(useCase.execute('test-block', updates)).rejects.toThrow(
      "Invalid prop value for key 'objectValue': must be primitive type"
    );
  });
  });
  describe('Валидация style', () => {
  beforeEach(() => {
    mockRepository.getById.mockResolvedValue(mockExistingBlock);
  });
  test('должен принять строковые значения в style', async () => {
    const updates: IUpdateBlockDto = {
      style: {
        color: 'red',
        backgroundColor: '#ffffff',
        margin: '10px'
      }
    };
    mockRepository.update.mockResolvedValue({ ...mockExistingBlock, style: updates.style! });
    await expect(useCase.execute('test-block', updates)).resolves.toBeDefined();
  });
  test('должен принять числовые значения в style', async () => {
    const updates: IUpdateBlockDto = {
      style: {
        fontSize: 14,
        lineHeight: 1.5,
        zIndex: 100
      }
    };
    mockRepository.update.mockResolvedValue({ ...mockExistingBlock, style: updates.style! });
    await expect(useCase.execute('test-block', updates)).resolves.toBeDefined();
  });
  test('должен бросить ошибку для неправильных типов в style', async () => {
    const updates: IUpdateBlockDto = {
      style: {
        invalidStyle: { nested: 'value' } as any
      }
    };
    await expect(useCase.execute('test-block', updates)).rejects.toThrow(
      "Invalid style value for key 'invalidStyle': must be string or number"
    );
  });
  test('должен бросить ошибку для boolean в style', async () => {
    const updates: IUpdateBlockDto = {
      style: {
        visible: true as any
      }
    };
    await expect(useCase.execute('test-block', updates)).rejects.toThrow(
      "Invalid style value for key 'visible': must be string or number"
    );
  });
  });
});