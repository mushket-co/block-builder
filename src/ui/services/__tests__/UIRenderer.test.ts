import { UIRenderer, IUIRendererConfig } from '../UIRenderer';
import { IBlockDto } from '../../../core/types';

describe('UIRenderer', () => {
  let uiRenderer: UIRenderer;
  let config: IUIRendererConfig;
  let container: HTMLDivElement;

  beforeEach(() => {
  // Создаем DOM контейнер
  container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);

  // Создаем мок компонентного реестра
  const mockComponentRegistry = {
    get: jest.fn(),
    has: jest.fn()
  };

  config = {
    containerId: 'test-container',
    blockConfigs: {
      'text': {
        title: 'Текстовый блок',
        template: '<div>{{content}}</div>'
      },
      'button': {
        title: 'Кнопка',
        template: '<button>{{label}}</button>'
      }
    },
    componentRegistry: mockComponentRegistry
  };

  uiRenderer = new UIRenderer(config);

  // Мокируем window.blockBuilder для onclick событий
  (window as any).blockBuilder = {
    showBlockTypeSelectionModal: jest.fn(),
    saveAllBlocksUI: jest.fn(),
    clearAllBlocksUI: jest.fn()
  };
  });

  afterEach(() => {
  // Очищаем DOM
  document.body.innerHTML = '';
  // Очищаем моки
  delete (window as any).blockBuilder;
  });

  describe('renderContainer', () => {
  test('должен отрендерить основной контейнер', () => {
    uiRenderer.renderContainer();

    const appContainer = container.querySelector('.block-builder-app');
    
    expect(appContainer).toBeTruthy();
  });

  test('должен создать область для блоков', () => {
    uiRenderer.renderContainer();

    const blocksContainer = document.getElementById('block-builder-blocks');
    
    expect(blocksContainer).toBeTruthy();
  });

  test('должен создать область для кнопок управления', () => {
    uiRenderer.renderContainer();

    const controlsContainer = container.querySelector('.block-builder-controls');
    
    expect(controlsContainer).toBeTruthy();
  });

  test('должен создать кнопку "Сохранить"', () => {
    uiRenderer.renderContainer();
    
    const saveButton = container.querySelector('button[data-action="saveAllBlocksUI"]');
    
    expect(saveButton).toBeTruthy();
    expect(saveButton?.textContent).toContain('Сохранить');
  });

  test('должен создать кнопку "Очистить все"', () => {
    uiRenderer.renderContainer();
    
    const clearButton = container.querySelector('button[data-action="clearAllBlocksUI"]');
    
    expect(clearButton).toBeTruthy();
    expect(clearButton?.textContent).toContain('Очистить все');
  });

  test('должен создать счетчик блоков', () => {
    uiRenderer.renderContainer();

    const blocksCount = document.getElementById('blocks-count');
    
    expect(blocksCount).toBeTruthy();
    expect(blocksCount?.textContent).toBe('0');
  });

  test('должен обработать отсутствие контейнера без ошибок', () => {
    const invalidRenderer = new UIRenderer({
      ...config,
      containerId: 'non-existent'
    });

    // Не должно выбросить ошибку
    expect(() => invalidRenderer.renderContainer()).not.toThrow();
  });
  });

  describe('renderBlocks', () => {
  beforeEach(() => {
    uiRenderer.renderContainer();
  });

  test('должен показать пустое состояние когда блоков нет', () => {
    uiRenderer.renderBlocks([]);

    const emptyState = container.querySelector('.block-builder-empty-state');
    const addBlockBtn = container.querySelector('.block-builder-add-block-btn');
    
    expect(emptyState).toBeTruthy();
    expect(addBlockBtn).toBeTruthy();
  });

  test('должен обновить счетчик блоков на 0', () => {
    uiRenderer.renderBlocks([]);

    const blocksCount = document.getElementById('blocks-count');
    
    expect(blocksCount?.textContent).toBe('0');
  });

  test('должен отрендерить блоки', () => {
    const blocks: IBlockDto[] = [
      {
        id: 'block-1',
        type: 'text',
        settings: {},
        props: { content: 'Hello World' },
        visible: true,
        locked: false,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      }
    ];

    uiRenderer.renderBlocks(blocks);

    const blockElement = container.querySelector('[data-block-id="block-1"]');
    
    expect(blockElement).toBeTruthy();
  });

  test('должен обновить счетчик блоков', () => {
    const blocks: IBlockDto[] = [
      {
        id: 'block-1',
        type: 'text',
        settings: {},
        props: {},
        visible: true,
        locked: false,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      },
      {
        id: 'block-2',
        type: 'button',
        settings: {},
        props: {},
        visible: true,
        locked: false,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      }
    ];

    uiRenderer.renderBlocks(blocks);

    const blocksCount = document.getElementById('blocks-count');
    
    expect(blocksCount?.textContent).toBe('2');
  });

  test('должен создать кнопки добавления между блоками', () => {
    const blocks: IBlockDto[] = [
      {
        id: 'block-1',
        type: 'text',
        settings: {},
        props: {},
        visible: true,
        locked: false,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      },
      {
        id: 'block-2',
        type: 'text',
        settings: {},
        props: {},
        visible: true,
        locked: false,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      }
    ];

    uiRenderer.renderBlocks(blocks);

    // Должно быть 3 кнопки: перед первым, между блоками, после последнего
    const addButtons = container.querySelectorAll('.block-builder-add-block-btn');
    
    expect(addButtons.length).toBe(3);
  });

  test('должен добавить класс hidden для невидимых блоков', () => {
    const blocks: IBlockDto[] = [
      {
        id: 'block-1',
        type: 'text',
        settings: {},
        props: {},
        visible: false, // Невидимый блок
        locked: false,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      }
    ];

    uiRenderer.renderBlocks(blocks);

    const blockElement = container.querySelector('[data-block-id="block-1"]');
    
    // Проверяем что блок отрендерен
    expect(blockElement).toBeTruthy();
    // UIRenderer рендерит все блоки, видимость управляется через класс hidden
    expect(blockElement?.classList.contains('hidden')).toBe(true);
  });

  test('не должен рендерить блоки с неизвестным типом', () => {
    const blocks: IBlockDto[] = [
      {
        id: 'block-1',
        type: 'unknown-type',
        settings: {},
        props: {},
        visible: true,
        locked: false,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      }
    ];

    uiRenderer.renderBlocks(blocks);

    const blockElement = container.querySelector('[data-block-id="block-1"]');
    
    expect(blockElement).toBeNull();
  });

  test('должен корректно работать без блоков после очистки', () => {
    // Сначала рендерим блоки
    const blocks: IBlockDto[] = [
      {
        id: 'block-1',
        type: 'text',
        settings: {},
        props: {},
        visible: true,
        locked: false,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      }
    ];

    uiRenderer.renderBlocks(blocks);
    expect(document.getElementById('blocks-count')?.textContent).toBe('1');

    // Затем очищаем
    uiRenderer.renderBlocks([]);

    const blocksCount = document.getElementById('blocks-count');
    const emptyState = container.querySelector('.block-builder-empty-state');
    
    expect(blocksCount?.textContent).toBe('0');
    expect(emptyState).toBeTruthy();
  });
  });

  describe('Счетчик блоков', () => {
  beforeEach(() => {
    uiRenderer.renderContainer();
  });

  test('должен обновляться через renderBlocks', () => {
    const blocks: IBlockDto[] = [
      {
        id: 'block-1',
        type: 'text',
        settings: {},
        props: {},
        visible: true,
        locked: false,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      },
      {
        id: 'block-2',
        type: 'text',
        settings: {},
        props: {},
        visible: true,
        locked: false,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      }
    ];

    uiRenderer.renderBlocks(blocks);

    const blocksCount = document.getElementById('blocks-count');
    
    expect(blocksCount?.textContent).toBe('2');
  });

  test('должен показывать 0 для пустого массива', () => {
    uiRenderer.renderBlocks([]);

    const blocksCount = document.getElementById('blocks-count');
    
    expect(blocksCount?.textContent).toBe('0');
  });

  test('должен обновляться при изменении количества блоков', () => {
    uiRenderer.renderBlocks([{
      id: 'block-1',
      type: 'text',
      settings: {},
      props: {},
      visible: true,
      locked: false,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    }]);
    
    expect(document.getElementById('blocks-count')?.textContent).toBe('1');

    uiRenderer.renderBlocks([
      { id: 'block-1', type: 'text', settings: {}, props: {}, visible: true, locked: false, metadata: { createdAt: new Date(), updatedAt: new Date(), version: 1 }},
      { id: 'block-2', type: 'text', settings: {}, props: {}, visible: true, locked: false, metadata: { createdAt: new Date(), updatedAt: new Date(), version: 1 }}
    ]);
    
    expect(document.getElementById('blocks-count')?.textContent).toBe('2');

    uiRenderer.renderBlocks([]);
    
    expect(document.getElementById('blocks-count')?.textContent).toBe('0');
  });
  });

  describe('Интеграция', () => {
  test('полный цикл рендеринга', () => {
    // Создаем контейнер
    uiRenderer.renderContainer();
    
    expect(container.querySelector('.block-builder-app')).toBeTruthy();
    expect(document.getElementById('blocks-count')?.textContent).toBe('0');

    // Рендерим блоки
    const blocks: IBlockDto[] = [
      {
        id: 'block-1',
        type: 'text',
        settings: {},
        props: { content: 'Test' },
        visible: true,
        locked: false,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      }
    ];

    uiRenderer.renderBlocks(blocks);

    expect(document.getElementById('blocks-count')?.textContent).toBe('1');
    expect(container.querySelector('[data-block-id="block-1"]')).toBeTruthy();

    // Счетчик должен корректно отображаться
    const blocksCount = document.getElementById('blocks-count');
    expect(blocksCount?.textContent).toBe('1');
  });
  });
});

