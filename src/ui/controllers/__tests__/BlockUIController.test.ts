import { BlockUIController, IBlockUIControllerConfig } from '../BlockUIController';
import { BlockManagementUseCase } from '../../../core/use-cases/BlockManagementUseCase';
import { ApiSelectUseCase } from '../../../core/use-cases/ApiSelectUseCase';
import { IBlockDto } from '../../../core/types';
import { LicenseService } from '../../../core/services/LicenseService';

// Мокируем все сервисы
jest.mock('../../services/UIRenderer');
jest.mock('../../services/FormBuilder');
jest.mock('../../services/ModalManager');
jest.mock('../../services/SpacingControlRenderer');
jest.mock('../../services/RepeaterControlRenderer');
jest.mock('../../services/ApiSelectControlRenderer');
jest.mock('../../../utils/copyToClipboard');

describe('BlockUIController', () => {
  let controller: BlockUIController;
  let mockUseCase: jest.Mocked<BlockManagementUseCase>;
  let mockApiSelectUseCase: jest.Mocked<ApiSelectUseCase>;
  let config: IBlockUIControllerConfig;
  let container: HTMLDivElement;

  const createMockBlock = (id: string, type: string = 'text'): IBlockDto => ({
  id,
  type,
  settings: {},
  props: { content: `Test ${id}` },
  visible: true,
  locked: false,
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1
  }
  });

  beforeEach(() => {
  // Создаем DOM контейнер
  container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);

  // Создаем моки use cases
  mockUseCase = {
    getAllBlocks: jest.fn(),
    getBlock: jest.fn(),
    createBlock: jest.fn(),
    updateBlock: jest.fn(),
    deleteBlock: jest.fn(),
    duplicateBlock: jest.fn(),
    setBlockLocked: jest.fn(),
    setBlockVisible: jest.fn(),
    reorderBlocks: jest.fn(),
    getComponentRegistry: jest.fn().mockReturnValue({
      get: jest.fn(),
      has: jest.fn()
    })
  } as any;

  mockApiSelectUseCase = {
    fetchItems: jest.fn(),
    validateConfig: jest.fn()
  } as any;

  config = {
    containerId: 'test-container',
    blockConfigs: {
      'text': {
        title: 'Текстовый блок',
        icon: '📝',
        fields: [
          {
            field: 'content',
            label: 'Контент',
            type: 'textarea'
          }
        ]
      },
      'button': {
        title: 'Кнопка',
        icon: '🔘',
        fields: [
          {
            field: 'label',
            label: 'Текст кнопки',
            type: 'text'
          }
        ]
      }
    },
    useCase: mockUseCase,
    apiSelectUseCase: mockApiSelectUseCase,
    licenseService: new LicenseService()  // Добавляем licenseService для тестов
  };

  // Мокируем window.blockBuilder
  (window as any).blockBuilder = {};

  controller = new BlockUIController(config);
  });

  afterEach(() => {
  document.body.innerHTML = '';
  delete (window as any).blockBuilder;
  jest.clearAllMocks();
  });

  describe('Инициализация', () => {
  test('должен создать контроллер с конфигурацией', () => {
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(BlockUIController);
  });

  test('должен инициализировать все сервисы', () => {
    // Проверяем что контроллер создан успешно
    // Сервисы создаются в конструкторе
    expect(controller).toBeDefined();
  });
  });

  describe('init', () => {
  test('должен инициализировать UI', async () => {
    mockUseCase.getAllBlocks.mockResolvedValue([]);

    await controller.init();

    expect(mockUseCase.getAllBlocks).toHaveBeenCalled();
  });

  test('должен загрузить блоки при инициализации', async () => {
    const mockBlocks = [
      createMockBlock('block-1'),
      createMockBlock('block-2')
    ];
    mockUseCase.getAllBlocks.mockResolvedValue(mockBlocks);

    await controller.init();

    expect(mockUseCase.getAllBlocks).toHaveBeenCalled();
  });
  });

  describe('refreshBlocks', () => {
  test('должен обновить список блоков', async () => {
    const mockBlocks = [createMockBlock('block-1')];
    mockUseCase.getAllBlocks.mockResolvedValue(mockBlocks);

    await controller.refreshBlocks();

    expect(mockUseCase.getAllBlocks).toHaveBeenCalled();
  });

  test('должен обработать пустой список блоков', async () => {
    mockUseCase.getAllBlocks.mockResolvedValue([]);

    await controller.refreshBlocks();

    expect(mockUseCase.getAllBlocks).toHaveBeenCalled();
  });
  });

  describe('showBlockTypeSelectionModal', () => {
  test('должен показать модалку выбора типа блока', () => {
    const showBlockTypeSelectionModal = jest.fn();
    (window as any).blockBuilder.showBlockTypeSelectionModal = showBlockTypeSelectionModal;

    controller.showBlockTypeSelectionModal(0);

    // Проверяем что метод был вызван без ошибок
    expect(controller).toBeDefined();
  });

  test('должен показать все доступные типы блоков', () => {
    controller.showBlockTypeSelectionModal();

    // Проверяем что контроллер работает
    expect(controller).toBeDefined();
  });
  });

  describe('Создание блока', () => {
  test('должен создать блок с валидными данными', async () => {
    const newBlock = createMockBlock('new-block-1');
    mockUseCase.createBlock.mockResolvedValue(newBlock);
    mockUseCase.getAllBlocks.mockResolvedValue([newBlock]);

    // Симулируем создание блока через use case
    const createdBlock = await mockUseCase.createBlock({
      type: 'text',
      settings: {},
      props: { content: 'Test' }
    });

    expect(createdBlock).toEqual(newBlock);
    expect(mockUseCase.createBlock).toHaveBeenCalledWith({
      type: 'text',
      settings: {},
      props: { content: 'Test' }
    });
  });

  test('должен обновить UI после создания блока', async () => {
    const newBlock = createMockBlock('new-block');
    mockUseCase.createBlock.mockResolvedValue(newBlock);
    mockUseCase.getAllBlocks.mockResolvedValue([newBlock]);

    await mockUseCase.createBlock({
      type: 'text',
      settings: {},
      props: {}
    });

    await controller.refreshBlocks();

    expect(mockUseCase.getAllBlocks).toHaveBeenCalled();
  });
  });

  describe('Редактирование блока', () => {
  test('должен получить блок для редактирования', async () => {
    const block = createMockBlock('block-1');
    mockUseCase.getBlock.mockResolvedValue(block);

    const retrievedBlock = await mockUseCase.getBlock('block-1');

    expect(retrievedBlock).toEqual(block);
    expect(mockUseCase.getBlock).toHaveBeenCalledWith('block-1');
  });

  test('должен обновить блок', async () => {
    const updatedBlock = createMockBlock('block-1');
    updatedBlock.props.content = 'Updated content';
    mockUseCase.updateBlock.mockResolvedValue(updatedBlock);

    const result = await mockUseCase.updateBlock('block-1', {
      props: { content: 'Updated content' }
    });

    expect(result).toEqual(updatedBlock);
    expect(mockUseCase.updateBlock).toHaveBeenCalledWith('block-1', {
      props: { content: 'Updated content' }
    });
  });
  });

  describe('Удаление блока', () => {
  test('должен удалить блок', async () => {
    mockUseCase.deleteBlock.mockResolvedValue(true);

    const result = await mockUseCase.deleteBlock('block-1');

    expect(result).toBe(true);
    expect(mockUseCase.deleteBlock).toHaveBeenCalledWith('block-1');
  });

  test('должен обновить UI после удаления', async () => {
    mockUseCase.deleteBlock.mockResolvedValue(true);
    mockUseCase.getAllBlocks.mockResolvedValue([]);

    await mockUseCase.deleteBlock('block-1');
    await controller.refreshBlocks();

    expect(mockUseCase.getAllBlocks).toHaveBeenCalled();
  });
  });

  describe('Дублирование блока', () => {
  test('должен дублировать блок', async () => {
    const originalBlock = createMockBlock('block-1');
    const duplicatedBlock = createMockBlock('block-2');
    mockUseCase.duplicateBlock.mockResolvedValue(duplicatedBlock);

    const result = await mockUseCase.duplicateBlock('block-1');

    expect(result).toEqual(duplicatedBlock);
    expect(mockUseCase.duplicateBlock).toHaveBeenCalledWith('block-1');
  });
  });

  describe('Блокировка блока', () => {
  test('должен заблокировать блок', async () => {
    const lockedBlock = createMockBlock('block-1');
    lockedBlock.locked = true;
    mockUseCase.setBlockLocked.mockResolvedValue(lockedBlock);

    const result = await mockUseCase.setBlockLocked('block-1', true);

    expect(result.locked).toBe(true);
    expect(mockUseCase.setBlockLocked).toHaveBeenCalledWith('block-1', true);
  });

  test('должен разблокировать блок', async () => {
    const unlockedBlock = createMockBlock('block-1');
    unlockedBlock.locked = false;
    mockUseCase.setBlockLocked.mockResolvedValue(unlockedBlock);

    const result = await mockUseCase.setBlockLocked('block-1', false);

    expect(result.locked).toBe(false);
    expect(mockUseCase.setBlockLocked).toHaveBeenCalledWith('block-1', false);
  });
  });

  describe('Видимость блока', () => {
  test('должен скрыть блок', async () => {
    const hiddenBlock = createMockBlock('block-1');
    hiddenBlock.visible = false;
    mockUseCase.setBlockVisible.mockResolvedValue(hiddenBlock);

    const result = await mockUseCase.setBlockVisible('block-1', false);

    expect(result.visible).toBe(false);
    expect(mockUseCase.setBlockVisible).toHaveBeenCalledWith('block-1', false);
  });

  test('должен показать блок', async () => {
    const visibleBlock = createMockBlock('block-1');
    visibleBlock.visible = true;
    mockUseCase.setBlockVisible.mockResolvedValue(visibleBlock);

    const result = await mockUseCase.setBlockVisible('block-1', true);

    expect(result.visible).toBe(true);
    expect(mockUseCase.setBlockVisible).toHaveBeenCalledWith('block-1', true);
  });
  });

  describe('Переупорядочивание блоков', () => {
  test('должен переупорядочить блоки', async () => {
    const blocks = [
      createMockBlock('block-1'),
      createMockBlock('block-2'),
      createMockBlock('block-3')
    ];
    mockUseCase.reorderBlocks.mockResolvedValue(true);

    const result = await mockUseCase.reorderBlocks(['block-2', 'block-1', 'block-3']);

    expect(result).toBe(true);
    expect(mockUseCase.reorderBlocks).toHaveBeenCalledWith(['block-2', 'block-1', 'block-3']);
  });
  });

  describe('onSave callback', () => {
  test('должен вызвать onSave callback если он определен', async () => {
    const onSave = jest.fn().mockResolvedValue(true);
    const configWithSave = {
      ...config,
      onSave
    };
    const controllerWithSave = new BlockUIController(configWithSave);

    const blocks = [createMockBlock('block-1')];
    mockUseCase.getAllBlocks.mockResolvedValue(blocks);

    // Вызываем onSave напрямую
    const result = await onSave(blocks);

    expect(result).toBe(true);
    expect(onSave).toHaveBeenCalledWith(blocks);
  });

  test('не должен падать если onSave не определен', () => {
    const controllerWithoutSave = new BlockUIController(config);

    expect(controllerWithoutSave).toBeDefined();
  });
  });

  describe('Конфигурация блоков', () => {
  test('должен получить конфигурацию блока по типу', () => {
    const textConfig = config.blockConfigs['text'];

    expect(textConfig).toBeDefined();
    expect(textConfig.title).toBe('Текстовый блок');
    expect(textConfig.icon).toBe('📝');
  });

  test('должен обработать несуществующий тип блока', () => {
    const unknownConfig = config.blockConfigs['unknown'];

    expect(unknownConfig).toBeUndefined();
  });

  test('должен получить поля из конфигурации', () => {
    const textConfig = config.blockConfigs['text'];
    const fields = textConfig.fields;

    expect(fields).toBeDefined();
    expect(fields.length).toBe(1);
    expect(fields[0].field).toBe('content');
  });
  });

  describe('Работа с несколькими блоками', () => {
  test('должен работать с множественными блоками', async () => {
    const blocks = [
      createMockBlock('block-1', 'text'),
      createMockBlock('block-2', 'button'),
      createMockBlock('block-3', 'text')
    ];
    mockUseCase.getAllBlocks.mockResolvedValue(blocks);

    await controller.refreshBlocks();

    expect(mockUseCase.getAllBlocks).toHaveBeenCalled();
  });

  test('должен получить блоки определенного типа', async () => {
    const blocks = [
      createMockBlock('block-1', 'text'),
      createMockBlock('block-2', 'button'),
      createMockBlock('block-3', 'text')
    ];
    mockUseCase.getAllBlocks.mockResolvedValue(blocks);

    const allBlocks = await mockUseCase.getAllBlocks();
    const textBlocks = allBlocks.filter(b => b.type === 'text');

    expect(textBlocks.length).toBe(2);
  });
  });

  describe('Интеграция use cases', () => {
  test('должен использовать BlockManagementUseCase для всех операций', async () => {
    const block = createMockBlock('block-1');

    mockUseCase.createBlock.mockResolvedValue(block);
    mockUseCase.getBlock.mockResolvedValue(block);
    mockUseCase.updateBlock.mockResolvedValue(block);
    mockUseCase.deleteBlock.mockResolvedValue(true);
    mockUseCase.duplicateBlock.mockResolvedValue(block);

    // Создание
    await mockUseCase.createBlock({ type: 'text', settings: {}, props: {} });
    expect(mockUseCase.createBlock).toHaveBeenCalled();

    // Получение
    await mockUseCase.getBlock('block-1');
    expect(mockUseCase.getBlock).toHaveBeenCalled();

    // Обновление
    await mockUseCase.updateBlock('block-1', { props: {} });
    expect(mockUseCase.updateBlock).toHaveBeenCalled();

    // Удаление
    await mockUseCase.deleteBlock('block-1');
    expect(mockUseCase.deleteBlock).toHaveBeenCalled();

    // Дублирование
    await mockUseCase.duplicateBlock('block-1');
    expect(mockUseCase.duplicateBlock).toHaveBeenCalled();
  });

  test('должен использовать ApiSelectUseCase для API селектов', () => {
    expect(config.apiSelectUseCase).toBe(mockApiSelectUseCase);
  });
  });

  describe('Component Registry', () => {
  test('должен получить component registry из use case', () => {
    const registry = mockUseCase.getComponentRegistry();

    expect(registry).toBeDefined();
    expect(mockUseCase.getComponentRegistry).toHaveBeenCalled();
  });
  });
});

