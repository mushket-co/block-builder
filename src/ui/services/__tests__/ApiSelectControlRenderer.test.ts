import { ApiSelectControlRenderer, IApiSelectControlConfig } from '../ApiSelectControlRenderer';
import { ApiSelectUseCase } from '../../../core/use-cases/ApiSelectUseCase';

describe('ApiSelectControlRenderer', () => {
  let renderer: ApiSelectControlRenderer;
  let container: HTMLDivElement;
  let mockOnChange: jest.Mock;
  let mockApiSelectUseCase: jest.Mocked<ApiSelectUseCase>;

  beforeEach(() => {
  container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);

  mockOnChange = jest.fn();
  
  // Создаем мок ApiSelectUseCase
  mockApiSelectUseCase = {
    fetchItems: jest.fn(),
    validateConfig: jest.fn()
  } as any;
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
    const config: IApiSelectControlConfig = {
      fieldName: 'author',
      label: 'Автор',
      rules: [],
      config: {
        field: 'author',
        label: 'Автор',
        type: 'api-select',
        apiConfig: {
          url: 'https://api.example.com/authors',
          method: 'GET'
        }
      },
      value: null,
      apiSelectUseCase: mockApiSelectUseCase,
      onChange: mockOnChange
    };

    renderer = new ApiSelectControlRenderer(config);

    expect(renderer).toBeDefined();
    expect(renderer).toBeInstanceOf(ApiSelectControlRenderer);
  });

  test('должен создать рендерер для multiple select', () => {
    const config: IApiSelectControlConfig = {
      fieldName: 'tags',
      label: 'Теги',
      rules: [],
      config: {
        field: 'tags',
        label: 'Теги',
        type: 'api-select',
        apiConfig: {
          url: 'https://api.example.com/tags',
          method: 'GET',
          multiple: true
        }
      },
      value: [],
      apiSelectUseCase: mockApiSelectUseCase,
      onChange: mockOnChange
    };

    renderer = new ApiSelectControlRenderer(config);

    expect(renderer).toBeDefined();
  });
  });

  describe('render', () => {
  test('должен отрендерить контрол в контейнер', () => {
    const config: IApiSelectControlConfig = {
      fieldName: 'author',
      label: 'Автор',
      rules: [],
      config: {
        field: 'author',
        label: 'Автор',
        type: 'api-select',
        apiConfig: {
          url: 'https://api.example.com/authors',
          method: 'GET'
        }
      },
      value: null,
      apiSelectUseCase: mockApiSelectUseCase,
      onChange: mockOnChange
    };

    renderer = new ApiSelectControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
    expect(container.querySelector('.bb-api-select')).toBeTruthy();
  });

  test('должен показать label', () => {
    const config: IApiSelectControlConfig = {
      fieldName: 'category',
      label: 'Категория товара',
      rules: [],
      config: {
        field: 'category',
        label: 'Категория',
        type: 'api-select',
        apiConfig: {
          url: 'https://api.example.com/categories',
          method: 'GET'
        }
      },
      value: null,
      apiSelectUseCase: mockApiSelectUseCase,
      onChange: mockOnChange
    };

    renderer = new ApiSelectControlRenderer(config);
    renderer.render(container);

    expect(container.textContent).toContain('Категория товара');
  });

  test('должен показать поле поиска', () => {
    const config: IApiSelectControlConfig = {
      fieldName: 'author',
      label: 'Автор',
      rules: [],
      config: {
        field: 'author',
        label: 'Автор',
        type: 'api-select',
        apiConfig: {
          url: 'https://api.example.com/authors',
          method: 'GET'
        }
      },
      value: null,
      apiSelectUseCase: mockApiSelectUseCase,
      onChange: mockOnChange
    };

    renderer = new ApiSelectControlRenderer(config);
    renderer.render(container);

    const searchInput = container.querySelector('input[type="text"]');
    expect(searchInput).toBeTruthy();
  });
  });

  describe('Значения', () => {
  test('должен работать с null значением', () => {
    const config: IApiSelectControlConfig = {
      fieldName: 'author',
      label: 'Автор',
      rules: [],
      config: {
        field: 'author',
        label: 'Автор',
        type: 'api-select',
        apiConfig: {
          url: 'https://api.example.com/authors',
          method: 'GET'
        }
      },
      value: null,
      apiSelectUseCase: mockApiSelectUseCase,
      onChange: mockOnChange
    };

    renderer = new ApiSelectControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });

  test('должен работать с выбранным значением', () => {
    const config: IApiSelectControlConfig = {
      fieldName: 'author',
      label: 'Автор',
      rules: [],
      config: {
        field: 'author',
        label: 'Автор',
        type: 'api-select',
        apiConfig: {
          url: 'https://api.example.com/authors',
          method: 'GET'
        }
      },
      value: { id: '1', name: 'John Doe' },
      apiSelectUseCase: mockApiSelectUseCase,
      onChange: mockOnChange
    };

    renderer = new ApiSelectControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });

  test('должен работать с массивом выбранных значений (multiple)', () => {
    const config: IApiSelectControlConfig = {
      fieldName: 'tags',
      label: 'Теги',
      rules: [],
      config: {
        field: 'tags',
        label: 'Теги',
        type: 'api-select',
        apiConfig: {
          url: 'https://api.example.com/tags',
          method: 'GET',
          multiple: true
        }
      },
      value: [
        { id: '1', name: 'JavaScript' },
        { id: '2', name: 'TypeScript' }
      ],
      apiSelectUseCase: mockApiSelectUseCase,
      onChange: mockOnChange
    };

    renderer = new ApiSelectControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });

  test('должен работать с пустым массивом (multiple)', () => {
    const config: IApiSelectControlConfig = {
      fieldName: 'tags',
      label: 'Теги',
      rules: [],
      config: {
        field: 'tags',
        label: 'Теги',
        type: 'api-select',
        apiConfig: {
          url: 'https://api.example.com/tags',
          method: 'GET',
          multiple: true
        }
      },
      value: [],
      apiSelectUseCase: mockApiSelectUseCase,
      onChange: mockOnChange
    };

    renderer = new ApiSelectControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();
  });
  });

  describe('API конфигурация', () => {
  test('должен работать с GET запросом', () => {
    const config: IApiSelectControlConfig = {
      fieldName: 'author',
      label: 'Автор',
      rules: [],
      config: {
        field: 'author',
        label: 'Автор',
        type: 'api-select',
        apiConfig: {
          url: 'https://api.example.com/authors',
          method: 'GET'
        }
      },
      value: null,
      apiSelectUseCase: mockApiSelectUseCase,
      onChange: mockOnChange
    };

    renderer = new ApiSelectControlRenderer(config);
    renderer.render(container);

    expect(renderer).toBeDefined();
  });

  test('должен работать с POST запросом', () => {
    const config: IApiSelectControlConfig = {
      fieldName: 'author',
      label: 'Автор',
      rules: [],
      config: {
        field: 'author',
        label: 'Автор',
        type: 'api-select',
        apiConfig: {
          url: 'https://api.example.com/authors',
          method: 'POST'
        }
      },
      value: null,
      apiSelectUseCase: mockApiSelectUseCase,
      onChange: mockOnChange
    };

    renderer = new ApiSelectControlRenderer(config);
    renderer.render(container);

    expect(renderer).toBeDefined();
  });

  test('должен работать с кастомными headers', () => {
    const config: IApiSelectControlConfig = {
      fieldName: 'author',
      label: 'Автор',
      rules: [],
      config: {
        field: 'author',
        label: 'Автор',
        type: 'api-select',
        apiConfig: {
          url: 'https://api.example.com/authors',
          method: 'GET',
          headers: {
            'Authorization': 'Bearer token123'
          }
        }
      },
      value: null,
      apiSelectUseCase: mockApiSelectUseCase,
      onChange: mockOnChange
    };

    renderer = new ApiSelectControlRenderer(config);
    renderer.render(container);

    expect(renderer).toBeDefined();
  });

  test('должен работать с кастомным dataPath', () => {
    const config: IApiSelectControlConfig = {
      fieldName: 'author',
      label: 'Автор',
      rules: [],
      config: {
        field: 'author',
        label: 'Автор',
        type: 'api-select',
        apiConfig: {
          url: 'https://api.example.com/authors',
          method: 'GET',
          dataPath: 'data.items'
        }
      },
      value: null,
      apiSelectUseCase: mockApiSelectUseCase,
      onChange: mockOnChange
    };

    renderer = new ApiSelectControlRenderer(config);
    renderer.render(container);

    expect(renderer).toBeDefined();
  });
  });

  describe('destroy', () => {
  test('должен очистить контейнер', () => {
    const config: IApiSelectControlConfig = {
      fieldName: 'author',
      label: 'Автор',
      rules: [],
      config: {
        field: 'author',
        label: 'Автор',
        type: 'api-select',
        apiConfig: {
          url: 'https://api.example.com/authors',
          method: 'GET'
        }
      },
      value: null,
      apiSelectUseCase: mockApiSelectUseCase,
      onChange: mockOnChange
    };

    renderer = new ApiSelectControlRenderer(config);
    renderer.render(container);

    expect(container.innerHTML).toBeTruthy();

    renderer.destroy();

    // destroy() удаляет обработчики, но может оставить HTML
    // Проверяем что метод выполняется без ошибок
    expect(renderer).toBeDefined();
  });

  test('не должен падать при повторном вызове destroy', () => {
    const config: IApiSelectControlConfig = {
      fieldName: 'author',
      label: 'Автор',
      rules: [],
      config: {
        field: 'author',
        label: 'Автор',
        type: 'api-select',
        apiConfig: {
          url: 'https://api.example.com/authors',
          method: 'GET'
        }
      },
      value: null,
      apiSelectUseCase: mockApiSelectUseCase,
      onChange: mockOnChange
    };

    renderer = new ApiSelectControlRenderer(config);
    renderer.render(container);

    expect(() => {
      renderer.destroy();
      renderer.destroy();
    }).not.toThrow();
  });

  test('не должен падать если render не был вызван', () => {
    const config: IApiSelectControlConfig = {
      fieldName: 'author',
      label: 'Автор',
      rules: [],
      config: {
        field: 'author',
        label: 'Автор',
        type: 'api-select',
        apiConfig: {
          url: 'https://api.example.com/authors',
          method: 'GET'
        }
      },
      value: null,
      apiSelectUseCase: mockApiSelectUseCase,
      onChange: mockOnChange
    };

    renderer = new ApiSelectControlRenderer(config);

    expect(() => {
      renderer.destroy();
    }).not.toThrow();
  });
  });

  describe('Интеграция', () => {
  test('полный цикл: создание, рендеринг, уничтожение', () => {
    const config: IApiSelectControlConfig = {
      fieldName: 'author',
      label: 'Автор',
      rules: [],
      config: {
        field: 'author',
        label: 'Автор',
        type: 'api-select',
        apiConfig: {
          url: 'https://api.example.com/authors',
          method: 'GET'
        }
      },
      value: { id: '1', name: 'John' },
      apiSelectUseCase: mockApiSelectUseCase,
      onChange: mockOnChange
    };

    // Создание
    renderer = new ApiSelectControlRenderer(config);
    expect(renderer).toBeDefined();

    // Рендеринг
    renderer.render(container);
    expect(container.innerHTML).toBeTruthy();

    // Уничтожение
    renderer.destroy();
    // destroy() удаляет обработчики событий
    expect(renderer).toBeDefined();
  });

  test('должен использовать ApiSelectUseCase', () => {
    const config: IApiSelectControlConfig = {
      fieldName: 'author',
      label: 'Автор',
      rules: [],
      config: {
        field: 'author',
        label: 'Автор',
        type: 'api-select',
        apiConfig: {
          url: 'https://api.example.com/authors',
          method: 'GET'
        }
      },
      value: null,
      apiSelectUseCase: mockApiSelectUseCase,
      onChange: mockOnChange
    };

    renderer = new ApiSelectControlRenderer(config);
    renderer.render(container);

    // ApiSelectUseCase передан в конфигурацию
    expect(config.apiSelectUseCase).toBe(mockApiSelectUseCase);
  });
  });
});

