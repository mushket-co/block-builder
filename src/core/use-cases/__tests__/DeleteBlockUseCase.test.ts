import { DeleteBlockUseCase } from '../DeleteBlockUseCase';
import { IBlockRepository } from '../../ports/BlockRepository';
import { IBlockDto } from '../../types';
describe('DeleteBlockUseCase', () => {
  let useCase: DeleteBlockUseCase;
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
  useCase = new DeleteBlockUseCase(mockRepository);
  });
  describe('execute', () => {
  test('должен удалить блок без дочерних блоков', async () => {
    const mockBlock: IBlockDto = {
      id: 'test-block',
      type: 'TestBlock',
      settings: {},
      props: {},
      locked: false
    };
    mockRepository.getById.mockResolvedValue(mockBlock);
    mockRepository.getChildren.mockResolvedValue([]);
    mockRepository.delete.mockResolvedValue(true);
    const result = await useCase.execute('test-block');
    expect(result).toBe(true);
    expect(mockRepository.getById).toHaveBeenCalledWith('test-block');
    expect(mockRepository.getChildren).toHaveBeenCalledWith('test-block');
    expect(mockRepository.delete).toHaveBeenCalledWith('test-block');
  });
  test('должен вернуть false если блок не найден', async () => {
    mockRepository.getById.mockResolvedValue(null);
    const result = await useCase.execute('non-existent');
    expect(result).toBe(false);
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });
  test('должен бросить ошибку при попытке удалить заблокированный блок', async () => {
    const lockedBlock: IBlockDto = {
      id: 'locked-block',
      type: 'TestBlock',
      settings: {},
      props: {},
      locked: true
    };
    mockRepository.getById.mockResolvedValue(lockedBlock);
    await expect(useCase.execute('locked-block')).rejects.toThrow(
      'Cannot delete locked block'
    );
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });
  test('должен удалить блок с дочерними блоками', async () => {
    const parentBlock: IBlockDto = {
      id: 'parent',
      type: 'Parent',
      settings: {},
      props: {}
    };
    const childBlock1: IBlockDto = {
      id: 'child-1',
      type: 'Child',
      settings: {},
      props: {},
      parent: 'parent'
    };
    const childBlock2: IBlockDto = {
      id: 'child-2',
      type: 'Child',
      settings: {},
      props: {},
      parent: 'parent'
    };
    mockRepository.getById.mockResolvedValue(parentBlock);
    mockRepository.getChildren
      .mockResolvedValueOnce([childBlock1, childBlock2])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    mockRepository.delete.mockResolvedValue(true);
    const result = await useCase.execute('parent');
    expect(result).toBe(true);
    expect(mockRepository.getChildren).toHaveBeenCalledTimes(3);
    expect(mockRepository.delete).toHaveBeenCalledTimes(3);
    expect(mockRepository.delete).toHaveBeenCalledWith('child-1');
    expect(mockRepository.delete).toHaveBeenCalledWith('child-2');
    expect(mockRepository.delete).toHaveBeenCalledWith('parent');
  });
  test('должен рекурсивно удалять вложенные дочерние блоки', async () => {
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
    mockRepository.getById.mockResolvedValue(grandParent);
    mockRepository.getChildren
      .mockResolvedValueOnce([parent])
      .mockResolvedValueOnce([child])
      .mockResolvedValueOnce([]);
    mockRepository.delete.mockResolvedValue(true);
    const result = await useCase.execute('grandparent');
    expect(result).toBe(true);
    expect(mockRepository.delete).toHaveBeenCalledWith('child');
    expect(mockRepository.delete).toHaveBeenCalledWith('parent');
    expect(mockRepository.delete).toHaveBeenCalledWith('grandparent');
    
    const deleteCalls = mockRepository.delete.mock.calls;
    expect(deleteCalls[0][0]).toBe('child');
    expect(deleteCalls[1][0]).toBe('parent');
    expect(deleteCalls[2][0]).toBe('grandparent');
  });
  test('должен удалить блок с множественными уровнями вложенности', async () => {
    const root: IBlockDto = {
      id: 'root',
      type: 'Root',
      settings: {},
      props: {}
    };
    const level1_1: IBlockDto = { id: 'l1-1', type: 'L1', settings: {}, props: {}, parent: 'root' };
    const level1_2: IBlockDto = { id: 'l1-2', type: 'L1', settings: {}, props: {}, parent: 'root' };
    const level2_1: IBlockDto = { id: 'l2-1', type: 'L2', settings: {}, props: {}, parent: 'l1-1' };
    const level2_2: IBlockDto = { id: 'l2-2', type: 'L2', settings: {}, props: {}, parent: 'l1-1' };
    const level3_1: IBlockDto = { id: 'l3-1', type: 'L3', settings: {}, props: {}, parent: 'l2-1' };
    mockRepository.getById.mockResolvedValue(root);
    mockRepository.getChildren
      .mockResolvedValueOnce([level1_1, level1_2])
      .mockResolvedValueOnce([level2_1, level2_2])
      .mockResolvedValueOnce([level3_1])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    mockRepository.delete.mockResolvedValue(true);
    const result = await useCase.execute('root');
    expect(result).toBe(true);
    expect(mockRepository.delete).toHaveBeenCalledTimes(6);
  });
  test('должен обработать ошибку при удалении дочернего блока', async () => {
    const parent: IBlockDto = {
      id: 'parent',
      type: 'Parent',
      settings: {},
      props: {}
    };
    const child: IBlockDto = {
      id: 'child',
      type: 'Child',
      settings: {},
      props: {},
      parent: 'parent'
    };
    mockRepository.getById.mockResolvedValue(parent);
    mockRepository.getChildren
      .mockResolvedValueOnce([child])
      .mockResolvedValueOnce([]);
    mockRepository.delete.mockRejectedValueOnce(new Error('Delete failed'));
    await expect(useCase.execute('parent')).rejects.toThrow('Delete failed');
  });
  test('должен удалить скрытый блок', async () => {
    const hiddenBlock: IBlockDto = {
      id: 'hidden',
      type: 'Hidden',
      settings: {},
      props: {},
      visible: false
    };
    mockRepository.getById.mockResolvedValue(hiddenBlock);
    mockRepository.getChildren.mockResolvedValue([]);
    mockRepository.delete.mockResolvedValue(true);
    const result = await useCase.execute('hidden');
    expect(result).toBe(true);
    expect(mockRepository.delete).toHaveBeenCalledWith('hidden');
  });
  });
});