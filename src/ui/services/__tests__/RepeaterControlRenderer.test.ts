import { RepeaterControlRenderer, IRepeaterControlConfig } from '../RepeaterControlRenderer';
import { CSS_CLASSES } from '../../../utils/constants';

describe('RepeaterControlRenderer', () => {
  let renderer: RepeaterControlRenderer;
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
    const config: IRepeaterControlConfig = {
      fieldName: 'items',
      label: 'Элементы',
      rules: [],
      config: {
        fields: [
          { field: 'title', label: 'Заголовок', type: 'text' }
        ]
      },
      value: [],
      onChange: mockOnChange
    };

    renderer = new RepeaterControlRenderer(config);

    expect(renderer).toBeDefined();
    expect(renderer).toBeInstanceOf(RepeaterControlRenderer);
  });

  test('должен создать рендерер с несколькими полями', () => {
    const config: IRepeaterControlConfig = {
      fieldName: 'items',
      label: 'Элементы списка',
      rules: [],
      config: {
        fields: [
          { field: 'title', label: 'Заголовок', type: 'text' },
          { field: 'description', label: 'Описание', type: 'textarea' },
          { field: 'active', label: 'Активен', type: 'checkbox' }
        ]
      },
      value: [],
      onChange: mockOnChange
    };

    renderer = new RepeaterControlRenderer(config);

    expect(renderer).toBeDefined();
  });
  });

  describe('render', () => {
  test('должен отрендерить контрол в контейнер', () => {
    const config: IRepeaterControlConfig = {
      fieldName: 'items',
      label: 'Элементы',
      rules: [],
      config: {
        fields: [
          { field: 'title', label: 'Заголовок', type: 'text' }
        ]
      },
      value: [],
      onChange: mockOnChange
    };

    renderer = new RepeaterControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
    expect(container.querySelector(`.${CSS_CLASSES.REPEATER_CONTROL_CONTAINER}`)).toBeTruthy();
  });

  test('должен показать label', () => {
    const config: IRepeaterControlConfig = {
      fieldName: 'items',
      label: 'Список элементов',
      rules: [],
      config: {
        fields: [
          { field: 'name', label: 'Имя', type: 'text' }
        ]
      },
      value: [],
      onChange: mockOnChange
    };

    renderer = new RepeaterControlRenderer(config);
    renderer.render(container);

    expect(container.textContent).toContain('Список элементов');
  });

  test('должен показать кнопку добавления', () => {
    const config: IRepeaterControlConfig = {
      fieldName: 'items',
      label: 'Элементы',
      rules: [],
      config: {
        fields: [
          { field: 'title', label: 'Заголовок', type: 'text' }
        ]
      },
      value: [],
      onChange: mockOnChange
    };

    renderer = new RepeaterControlRenderer(config);
    renderer.render(container);

    const addButton = container.querySelector('button');
    expect(addButton).toBeTruthy();
  });
  });

  describe('Значения', () => {
  test('должен работать с пустым массивом', () => {
    const config: IRepeaterControlConfig = {
      fieldName: 'items',
      label: 'Элементы',
      rules: [],
      config: {
        fields: [
          { field: 'title', label: 'Заголовок', type: 'text' }
        ]
      },
      value: [],
      onChange: mockOnChange
    };

    renderer = new RepeaterControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });

  test('должен отобразить начальные значения', () => {
    const config: IRepeaterControlConfig = {
      fieldName: 'items',
      label: 'Элементы',
      rules: [],
      config: {
        fields: [
          { field: 'title', label: 'Заголовок', type: 'text' }
        ]
      },
      value: [
        { title: 'Элемент 1' },
        { title: 'Элемент 2' }
      ],
      onChange: mockOnChange
    };

    renderer = new RepeaterControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });

  test('должен работать с null', () => {
    const config: IRepeaterControlConfig = {
      fieldName: 'items',
      label: 'Элементы',
      rules: [],
      config: {
        fields: [
          { field: 'title', label: 'Заголовок', type: 'text' }
        ]
      },
      value: null as any,
      onChange: mockOnChange
    };

    renderer = new RepeaterControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });
  });

  describe('Различные типы полей', () => {
  test('должен работать с текстовыми полями', () => {
    const config: IRepeaterControlConfig = {
      fieldName: 'items',
      label: 'Элементы',
      rules: [],
      config: {
        fields: [
          { field: 'title', label: 'Заголовок', type: 'text' }
        ]
      },
      value: [],
      onChange: mockOnChange
    };

    renderer = new RepeaterControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });

  test('должен работать с textarea', () => {
    const config: IRepeaterControlConfig = {
      fieldName: 'items',
      label: 'Элементы',
      rules: [],
      config: {
        fields: [
          { field: 'description', label: 'Описание', type: 'textarea' }
        ]
      },
      value: [],
      onChange: mockOnChange
    };

    renderer = new RepeaterControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });

  test('должен работать с checkbox', () => {
    const config: IRepeaterControlConfig = {
      fieldName: 'items',
      label: 'Элементы',
      rules: [],
      config: {
        fields: [
          { field: 'active', label: 'Активен', type: 'checkbox' }
        ]
      },
      value: [],
      onChange: mockOnChange
    };

    renderer = new RepeaterControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });

  test('должен работать с select', () => {
    const config: IRepeaterControlConfig = {
      fieldName: 'items',
      label: 'Элементы',
      rules: [],
      config: {
        fields: [
          {
            field: 'category',
            label: 'Категория',
            type: 'select',
            options: [
              { value: 'cat1', label: 'Категория 1' },
              { value: 'cat2', label: 'Категория 2' }
            ]
          }
        ]
      },
      value: [],
      onChange: mockOnChange
    };

    renderer = new RepeaterControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });

  test('должен работать с несколькими типами полей', () => {
    const config: IRepeaterControlConfig = {
      fieldName: 'items',
      label: 'Элементы',
      rules: [],
      config: {
        fields: [
          { field: 'title', label: 'Заголовок', type: 'text' },
          { field: 'description', label: 'Описание', type: 'textarea' },
          { field: 'active', label: 'Активен', type: 'checkbox' },
          { field: 'color', label: 'Цвет', type: 'color' }
        ]
      },
      value: [],
      onChange: mockOnChange
    };

    renderer = new RepeaterControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });
  });

  describe('destroy', () => {
  test('должен очистить контейнер', () => {
    const config: IRepeaterControlConfig = {
      fieldName: 'items',
      label: 'Элементы',
      rules: [],
      config: {
        fields: [
          { field: 'title', label: 'Заголовок', type: 'text' }
        ]
      },
      value: [],
      onChange: mockOnChange
    };

    renderer = new RepeaterControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();

    renderer.destroy();

    expect(container.innerHTML).toBe('');
  });

  test('не должен падать при повторном вызове destroy', () => {
    const config: IRepeaterControlConfig = {
      fieldName: 'items',
      label: 'Элементы',
      rules: [],
      config: {
        fields: [
          { field: 'title', label: 'Заголовок', type: 'text' }
        ]
      },
      value: [],
      onChange: mockOnChange
    };

    renderer = new RepeaterControlRenderer(config);
    renderer.render(container);

    expect(() => {
      renderer.destroy();
      renderer.destroy();
    }).not.toThrow();
  });

  test('не должен падать если render не был вызван', () => {
    const config: IRepeaterControlConfig = {
      fieldName: 'items',
      label: 'Элементы',
      rules: [],
      config: {
        fields: [
          { field: 'title', label: 'Заголовок', type: 'text' }
        ]
      },
      value: [],
      onChange: mockOnChange
    };

    renderer = new RepeaterControlRenderer(config);

    expect(() => {
      renderer.destroy();
    }).not.toThrow();
  });
  });

  describe('Конфигурация полей', () => {
  test('должен работать с одним полем', () => {
    const config: IRepeaterControlConfig = {
      fieldName: 'items',
      label: 'Элементы',
      rules: [],
      config: {
        fields: [
          { field: 'title', label: 'Заголовок', type: 'text' }
        ]
      },
      value: [],
      onChange: mockOnChange
    };

    renderer = new RepeaterControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });

  test('должен работать с множеством полей', () => {
    const config: IRepeaterControlConfig = {
      fieldName: 'items',
      label: 'Элементы',
      rules: [],
      config: {
        fields: [
          { field: 'field1', label: 'Поле 1', type: 'text' },
          { field: 'field2', label: 'Поле 2', type: 'text' },
          { field: 'field3', label: 'Поле 3', type: 'text' },
          { field: 'field4', label: 'Поле 4', type: 'text' },
          { field: 'field5', label: 'Поле 5', type: 'text' }
        ]
      },
      value: [],
      onChange: mockOnChange
    };

    renderer = new RepeaterControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });
  });

  describe('Интеграция', () => {
  test('полный цикл: создание, рендеринг, уничтожение', () => {
    const config: IRepeaterControlConfig = {
      fieldName: 'items',
      label: 'Элементы',
      rules: [],
      config: {
        fields: [
          { field: 'title', label: 'Заголовок', type: 'text' }
        ]
      },
      value: [{ title: 'Test' }],
      onChange: mockOnChange
    };

    // Создание
    renderer = new RepeaterControlRenderer(config);
    expect(renderer).toBeDefined();

    // Рендеринг
    renderer.render(container);
    expect(container.innerHTML).toBeTruthy();

    // Уничтожение
    renderer.destroy();
    expect(container.innerHTML).toBe('');
  });

  test('множественные рендеры в один контейнер', () => {
    const config: IRepeaterControlConfig = {
      fieldName: 'items',
      label: 'Элементы',
      rules: [],
      config: {
        fields: [
          { field: 'title', label: 'Заголовок', type: 'text' }
        ]
      },
      value: [],
      onChange: mockOnChange
    };

    renderer = new RepeaterControlRenderer(config);
    
    renderer.render(container);
    expect(container.innerHTML).toBeTruthy();
    
    renderer.render(container);
    expect(container.innerHTML).toBeTruthy();
  });
  });
});

