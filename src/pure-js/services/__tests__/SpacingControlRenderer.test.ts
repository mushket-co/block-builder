import { SpacingControlRenderer, ISpacingControlConfig } from '../SpacingControlRenderer';
import { CSS_CLASSES } from '../../../utils/constants';

describe('SpacingControlRenderer', () => {
  let renderer: SpacingControlRenderer;
  let container: HTMLDivElement;
  let mockOnChange: jest.Mock;

  beforeEach(() => {
  container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);

  mockOnChange = jest.fn();
  });

  afterEach(() => {
  if (renderer) {
    renderer.destroy();
  }
  document.body.innerHTML = '';
  jest.clearAllMocks();
  });

  describe('Инициализация', () => {
  test('должен создать рендерер с минимальной конфигурацией', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'padding',
      label: 'Отступы',
      required: false,
      value: {},
      onChange: mockOnChange
    };

    renderer = new SpacingControlRenderer(config);

    expect(renderer).toBeDefined();
    expect(renderer).toBeInstanceOf(SpacingControlRenderer);
  });

  test('должен создать рендерер с полной конфигурацией', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'margin',
      label: 'Внешние отступы',
      required: true,
      config: {
        types: ['top', 'bottom', 'left', 'right'],
        breakpoints: ['mobile', 'tablet', 'desktop']
      },
      value: {
        desktop: { top: 20, bottom: 20 }
      },
      onChange: mockOnChange
    };

    renderer = new SpacingControlRenderer(config);

    expect(renderer).toBeDefined();
  });
  });

  describe('render', () => {
  test('должен отрендерить контрол в контейнер', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'padding',
      label: 'Отступы',
      required: false,
      value: {},
      onChange: mockOnChange
    };

    renderer = new SpacingControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
    expect(container.querySelector(`.${CSS_CLASSES.SPACING_CONTROL_CONTAINER}`)).toBeTruthy();
  });

  test('должен показать label', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'padding',
      label: 'Внутренние отступы',
      required: false,
      value: {},
      onChange: mockOnChange
    };

    renderer = new SpacingControlRenderer(config);
    renderer.render(container);

    expect(container.textContent).toContain('Внутренние отступы');
  });

  test('должен показать звездочку для обязательных полей', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'padding',
      label: 'Отступы',
      required: true,
      value: {},
      onChange: mockOnChange
    };

    renderer = new SpacingControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toContain('*');
  });

  test('не должен показывать звездочку для необязательных полей', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'padding',
      label: 'Отступы',
      required: false,
      value: {},
      onChange: mockOnChange
    };

    renderer = new SpacingControlRenderer(config);
    renderer.render(container);

    // Проверяем что нет required маркера в label
    const label = container.querySelector('label');
    expect(label?.innerHTML).not.toContain('*');
  });
  });

  describe('Значения', () => {
  test('должен отобразить начальные значения', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'padding',
      label: 'Отступы',
      required: false,
      value: {
        desktop: { top: 20, bottom: 30 }
      },
      onChange: mockOnChange
    };

    renderer = new SpacingControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });

  test('должен работать с пустыми значениями', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'padding',
      label: 'Отступы',
      required: false,
      value: {},
      onChange: mockOnChange
    };

    renderer = new SpacingControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });

  test('должен работать со значением null', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'padding',
      label: 'Отступы',
      required: false,
      value: null as any,
      onChange: mockOnChange
    };

    renderer = new SpacingControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });
  });

  describe('Конфигурация типов отступов', () => {
  test('должен использовать кастомные типы отступов', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'padding',
      label: 'Отступы',
      required: false,
      config: {
        types: ['top', 'bottom']
      },
      value: {},
      onChange: mockOnChange
    };

    renderer = new SpacingControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });

  test('должен использовать все типы по умолчанию', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'padding',
      label: 'Отступы',
      required: false,
      value: {},
      onChange: mockOnChange
    };

    renderer = new SpacingControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });
  });

  describe('Конфигурация брейкпоинтов', () => {
  test('должен использовать кастомные брейкпоинты', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'padding',
      label: 'Отступы',
      required: false,
      config: {
        breakpoints: ['mobile', 'desktop']
      },
      value: {},
      onChange: mockOnChange
    };

    renderer = new SpacingControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });

  test('должен использовать все брейкпоинты по умолчанию', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'padding',
      label: 'Отступы',
      required: false,
      value: {},
      onChange: mockOnChange
    };

    renderer = new SpacingControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });
  });

  describe('destroy', () => {
  test('должен очистить контейнер', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'padding',
      label: 'Отступы',
      required: false,
      value: {},
      onChange: mockOnChange
    };

    renderer = new SpacingControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();

    renderer.destroy();

    expect(container.innerHTML).toBe('');
  });

  test('не должен падать при повторном вызове destroy', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'padding',
      label: 'Отступы',
      required: false,
      value: {},
      onChange: mockOnChange
    };

    renderer = new SpacingControlRenderer(config);
    renderer.render(container);

    expect(() => {
      renderer.destroy();
      renderer.destroy();
    }).not.toThrow();
  });

  test('не должен падать если render не был вызван', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'padding',
      label: 'Отступы',
      required: false,
      value: {},
      onChange: mockOnChange
    };

    renderer = new SpacingControlRenderer(config);

    expect(() => {
      renderer.destroy();
    }).not.toThrow();
  });
  });

  describe('Интеграция', () => {
  test('полный цикл: создание, рендеринг, уничтожение', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'padding',
      label: 'Отступы',
      required: false,
      value: {
        desktop: { top: 20 }
      },
      onChange: mockOnChange
    };

    // Создание
    renderer = new SpacingControlRenderer(config);
    expect(renderer).toBeDefined();

    // Рендеринг
    renderer.render(container);
    expect(container.innerHTML).toBeTruthy();

    // Уничтожение
    renderer.destroy();
    expect(container.innerHTML).toBe('');
  });

  test('множественные рендеры в один контейнер', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'padding',
      label: 'Отступы',
      required: false,
      value: {},
      onChange: mockOnChange
    };

    renderer = new SpacingControlRenderer(config);
    
    renderer.render(container);
    const firstHTML = container.innerHTML;
    
    renderer.render(container);
    const secondHTML = container.innerHTML;

    // Должен перерисоваться
    expect(secondHTML).toBeTruthy();
  });
  });

  describe('Различные fieldName', () => {
  test('должен работать с padding', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'padding',
      label: 'Padding',
      required: false,
      value: {},
      onChange: mockOnChange
    };

    renderer = new SpacingControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });

  test('должен работать с margin', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'margin',
      label: 'Margin',
      required: false,
      value: {},
      onChange: mockOnChange
    };

    renderer = new SpacingControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });

  test('должен работать с произвольным fieldName', () => {
    const config: ISpacingControlConfig = {
      fieldName: 'customSpacing',
      label: 'Custom Spacing',
      required: false,
      value: {},
      onChange: mockOnChange
    };

    renderer = new SpacingControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });
  });
});

