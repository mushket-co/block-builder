import { ApiSelectUseCase } from '../ApiSelectUseCase';
import { IHttpClient } from '../../ports/HttpClient';
import { IApiSelectConfig, IApiRequestParams } from '../../types/form';

describe('ApiSelectUseCase', () => {
  let useCase: ApiSelectUseCase;
  let mockHttpClient: jest.Mocked<IHttpClient>;

  beforeEach(() => {
  mockHttpClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn()
  };

  useCase = new ApiSelectUseCase(mockHttpClient);
  });

  describe('fetchItems', () => {
  const basicConfig: IApiSelectConfig = {
    url: 'https://api.example.com/items',
    idField: 'id',
    nameField: 'name'
  };

  test('должен загрузить данные через GET запрос', async () => {
    mockHttpClient.get.mockResolvedValue({
      data: {
        data: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ],
        total: 2
      },
      status: 200,
      headers: {}
    });

    const result = await useCase.fetchItems(basicConfig);

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      'https://api.example.com/items',
      {},
      undefined
    );
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({ id: 1, name: 'Item 1' });
    expect(result.total).toBe(2);
  });

  test('должен загрузить данные через POST запрос', async () => {
    const postConfig: IApiSelectConfig = {
      ...basicConfig,
      method: 'POST'
    };

    mockHttpClient.post.mockResolvedValue({
      data: {
        data: [{ id: 1, name: 'Item 1' }],
        total: 1
      },
      status: 200,
      headers: {}
    });

    const result = await useCase.fetchItems(postConfig);

    expect(mockHttpClient.post).toHaveBeenCalled();
    expect(result.data).toHaveLength(1);
  });

  test('должен передать параметры поиска', async () => {
    mockHttpClient.get.mockResolvedValue({
      data: { data: [], total: 0 },
      status: 200,
      headers: {}
    });

    await useCase.fetchItems(basicConfig, { search: 'test' });

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      basicConfig.url,
      { search: 'test' },
      undefined
    );
  });

  test('должен использовать кастомный параметр поиска', async () => {
    const configWithCustomSearch: IApiSelectConfig = {
      ...basicConfig,
      searchParam: 'q'
    };

    mockHttpClient.get.mockResolvedValue({
      data: { data: [], total: 0 },
      status: 200,
      headers: {}
    });

    await useCase.fetchItems(configWithCustomSearch, { search: 'test' });

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      basicConfig.url,
      { q: 'test' },
      undefined
    );
  });

  test('должен передать параметры пагинации', async () => {
    mockHttpClient.get.mockResolvedValue({
      data: { data: [], total: 0 },
      status: 200,
      headers: {}
    });

    await useCase.fetchItems(basicConfig, { page: 2, limit: 10 });

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      basicConfig.url,
      { page: 2, limit: 10 },
      undefined
    );
  });

  test('должен использовать кастомные параметры пагинации', async () => {
    const configWithCustomPagination: IApiSelectConfig = {
      ...basicConfig,
      pageParam: 'p',
      limitParam: 'per_page'
    };

    mockHttpClient.get.mockResolvedValue({
      data: { data: [], total: 0 },
      status: 200,
      headers: {}
    });

    await useCase.fetchItems(configWithCustomPagination, { page: 2, limit: 20 });

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      basicConfig.url,
      { p: 2, per_page: 20 },
      undefined
    );
  });

  test('должен использовать limit из конфига по умолчанию', async () => {
    const configWithDefaultLimit: IApiSelectConfig = {
      ...basicConfig,
      limit: 50
    };

    mockHttpClient.get.mockResolvedValue({
      data: { data: [], total: 0 },
      status: 200,
      headers: {}
    });

    await useCase.fetchItems(configWithDefaultLimit);

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      basicConfig.url,
      { limit: 50 },
      undefined
    );
  });

  test('должен передать дополнительные параметры', async () => {
    mockHttpClient.get.mockResolvedValue({
      data: { data: [], total: 0 },
      status: 200,
      headers: {}
    });

    await useCase.fetchItems(basicConfig, {
      customParam: 'customValue',
      anotherParam: 123
    });

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      basicConfig.url,
      {
        customParam: 'customValue',
        anotherParam: 123
      },
      undefined
    );
  });

  test('должен передать заголовки', async () => {
    const configWithHeaders: IApiSelectConfig = {
      ...basicConfig,
      headers: {
        'Authorization': 'Bearer token123',
        'X-Custom': 'value'
      }
    };

    mockHttpClient.get.mockResolvedValue({
      data: { data: [], total: 0 },
      status: 200,
      headers: {}
    });

    await useCase.fetchItems(configWithHeaders);

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      basicConfig.url,
      {},
      {
        'Authorization': 'Bearer token123',
        'X-Custom': 'value'
      }
    );
  });

  test('должен использовать dataPath для извлечения данных', async () => {
    const configWithDataPath: IApiSelectConfig = {
      ...basicConfig,
      dataPath: 'response.items'
    };

    mockHttpClient.get.mockResolvedValue({
      data: {
        response: {
          items: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' }
          ]
        },
        total: 2
      },
      status: 200,
      headers: {}
    });

    const result = await useCase.fetchItems(configWithDataPath);

    expect(result.data).toHaveLength(2);
  });

  test('должен использовать альтернативные пути данных', async () => {
    mockHttpClient.get.mockResolvedValue({
      data: {
        items: [{ id: 1, name: 'Item 1' }],
        total: 1
      },
      status: 200,
      headers: {}
    });

    const result = await useCase.fetchItems(basicConfig);

    expect(result.data).toHaveLength(1);
  });

  test('должен использовать results как альтернативный путь', async () => {
    mockHttpClient.get.mockResolvedValue({
      data: {
        results: [{ id: 1, name: 'Item 1' }],
        total: 1
      },
      status: 200,
      headers: {}
    });

    const result = await useCase.fetchItems(basicConfig);

    expect(result.data).toHaveLength(1);
  });

  test('должен использовать кастомные поля id и name', async () => {
    const configWithCustomFields: IApiSelectConfig = {
      url: 'https://api.example.com/items',
      idField: 'uuid',
      nameField: 'title'
    };

    mockHttpClient.get.mockResolvedValue({
      data: {
        data: [
          { uuid: 'abc-123', title: 'Title 1' },
          { uuid: 'def-456', title: 'Title 2' }
        ],
        total: 2
      },
      status: 200,
      headers: {}
    });

    const result = await useCase.fetchItems(configWithCustomFields);

    expect(result.data[0]).toEqual({ id: 'abc-123', name: 'Title 1' });
    expect(result.data[1]).toEqual({ id: 'def-456', name: 'Title 2' });
  });

  test('должен использовать кастомный responseMapper', async () => {
    const configWithMapper: IApiSelectConfig = {
      ...basicConfig,
      responseMapper: (raw) => ({
        data: raw.custom_data.map((item: any) => ({
          id: item.key,
          name: item.value
        })),
        total: raw.count,
        page: raw.current_page,
        hasMore: raw.has_next
      })
    };

    mockHttpClient.get.mockResolvedValue({
      data: {
        custom_data: [
          { key: 'k1', value: 'Value 1' },
          { key: 'k2', value: 'Value 2' }
        ],
        count: 2,
        current_page: 1,
        has_next: false
      },
      status: 200,
      headers: {}
    });

    const result = await useCase.fetchItems(configWithMapper);

    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({ id: 'k1', name: 'Value 1' });
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.hasMore).toBe(false);
  });

  test('должен бросить ошибку если не удалось найти массив данных', async () => {
    mockHttpClient.get.mockResolvedValue({
      data: {
        something: 'else'
      },
      status: 200,
      headers: {}
    });

    await expect(useCase.fetchItems(basicConfig)).rejects.toThrow(
      'Не удалось определить массив данных в ответе API'
    );
  });

  test('должен обработать ошибку HTTP запроса', async () => {
    mockHttpClient.get.mockRejectedValue(new Error('Network error'));

    await expect(useCase.fetchItems(basicConfig)).rejects.toThrow(
      'Ошибка загрузки данных: Network error'
    );
  });
  });

  describe('validateConfig', () => {
  test('должен пройти валидацию для корректного конфига', () => {
    const config: IApiSelectConfig = {
      url: 'https://api.example.com/items',
      idField: 'id',
      nameField: 'name'
    };

    const result = useCase.validateConfig(config);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('должен вернуть ошибку если URL не указан', () => {
    const config: IApiSelectConfig = {
      url: '',
      idField: 'id',
      nameField: 'name'
    };

    const result = useCase.validateConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('URL обязателен');
  });

  test('должен вернуть ошибку для невалидного URL', () => {
    const config: IApiSelectConfig = {
      url: 'not-a-valid-url',
      idField: 'id',
      nameField: 'name'
    };

    const result = useCase.validateConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Некорректный URL');
  });

  test('должен вернуть ошибку для неподдерживаемого метода', () => {
    const config: IApiSelectConfig = {
      url: 'https://api.example.com/items',
      method: 'DELETE' as any,
      idField: 'id',
      nameField: 'name'
    };

    const result = useCase.validateConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Метод должен быть GET или POST');
  });

  test('должен вернуть ошибку для отрицательного limit', () => {
    const config: IApiSelectConfig = {
      url: 'https://api.example.com/items',
      limit: -1,
      idField: 'id',
      nameField: 'name'
    };

    const result = useCase.validateConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Limit должен быть больше 0');
  });

  test('должен вернуть ошибку для отрицательного debounceMs', () => {
    const config: IApiSelectConfig = {
      url: 'https://api.example.com/items',
      debounceMs: -100,
      idField: 'id',
      nameField: 'name'
    };

    const result = useCase.validateConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('debounceMs не может быть отрицательным');
  });

  test('должен вернуть все ошибки одновременно', () => {
    const config: IApiSelectConfig = {
      url: '',
      method: 'PATCH' as any,
      limit: -5,
      idField: 'id',
      nameField: 'name'
    };

    const result = useCase.validateConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });

  test('должен принять корректный limit', () => {
    const config: IApiSelectConfig = {
      url: 'https://api.example.com/items',
      limit: 50,
      idField: 'id',
      nameField: 'name'
    };

    const result = useCase.validateConfig(config);

    expect(result.valid).toBe(true);
  });

  test('должен принять корректный debounceMs', () => {
    const config: IApiSelectConfig = {
      url: 'https://api.example.com/items',
      debounceMs: 300,
      idField: 'id',
      nameField: 'name'
    };

    const result = useCase.validateConfig(config);

    expect(result.valid).toBe(true);
  });

  test('должен принять GET метод', () => {
    const config: IApiSelectConfig = {
      url: 'https://api.example.com/items',
      method: 'GET',
      idField: 'id',
      nameField: 'name'
    };

    const result = useCase.validateConfig(config);

    expect(result.valid).toBe(true);
  });

  test('должен принять POST метод', () => {
    const config: IApiSelectConfig = {
      url: 'https://api.example.com/items',
      method: 'POST',
      idField: 'id',
      nameField: 'name'
    };

    const result = useCase.validateConfig(config);

    expect(result.valid).toBe(true);
  });
  });
});

