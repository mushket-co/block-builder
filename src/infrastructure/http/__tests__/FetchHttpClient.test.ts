import { FetchHttpClient } from '../FetchHttpClient';
global.fetch = jest.fn();
describe('FetchHttpClient', () => {
  let client: FetchHttpClient;
  let mockFetch: jest.Mock;
  beforeEach(() => {
  client = new FetchHttpClient();
  mockFetch = global.fetch as jest.Mock;
  mockFetch.mockClear();
  jest.clearAllTimers();
  });
  afterEach(() => {
  jest.restoreAllMocks();
  });
  describe('get', () => {
  test('должен выполнить GET запрос', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ data: 'test' })
    });
    const response = await client.get('https://api.example.com/data');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/data',
      expect.objectContaining({
        method: 'GET'
      })
    );
    expect(response.data).toEqual({ data: 'test' });
    expect(response.status).toBe(200);
  });
  test('должен добавить query параметры к URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({})
    });
    await client.get('https://api.example.com/data', {
      page: 1,
      limit: 10,
      search: 'test'
    });
    const callUrl = mockFetch.mock.calls[0][0];
    expect(callUrl).toContain('page=1');
    expect(callUrl).toContain('limit=10');
    expect(callUrl).toContain('search=test');
  });
  test('должен добавить заголовки', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({})
    });
    await client.get(
      'https://api.example.com/data',
      {},
      { 'Authorization': 'Bearer token' }
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer token'
        })
      })
    );
  });
  test('должен пропустить undefined и null параметры', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({})
    });
    await client.get('https://api.example.com/data', {
      valid: 'test',
      nullParam: null,
      undefinedParam: undefined
    });
    const callUrl = mockFetch.mock.calls[0][0];
    expect(callUrl).toContain('valid=test');
    expect(callUrl).not.toContain('nullParam');
    expect(callUrl).not.toContain('undefinedParam');
  });
  test('должен обработать text ответ', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: async () => 'plain text response'
    });
    const response = await client.get('https://api.example.com/data');
    expect(response.data).toBe('plain text response');
  });
  });
  describe('post', () => {
  test('должен выполнить POST запрос', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 201,
      statusText: 'Created',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ id: '123' })
    });
    const response = await client.post(
      'https://api.example.com/data',
      { name: 'Test' }
    );
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/data',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Test' })
      })
    );
    expect(response.data).toEqual({ id: '123' });
    expect(response.status).toBe(201);
  });
  test('должен добавить Content-Type header по умолчанию', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({})
    });
    await client.post('https://api.example.com/data', {});
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );
  });
  test('должен передать кастомные заголовки', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({})
    });
    await client.post(
      'https://api.example.com/data',
      {},
      { 'X-Custom-Header': 'value' }
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Custom-Header': 'value'
        })
      })
    );
  });
  });
  describe('Error handling', () => {
  test('должен бросить ошибку для HTTP ошибок', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Not found' })
    });
    await expect(
      client.get('https://api.example.com/data')
    ).rejects.toMatchObject({
      status: 404,
      statusText: 'Not Found',
      message: expect.stringContaining('404')
    });
  });
  test('должен бросить ошибку для network ошибок', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    await expect(
      client.get('https://api.example.com/data')
    ).rejects.toMatchObject({
      message: 'Network error'
    });
  });
  test('должен обработать timeout', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    const mockAbort = jest.fn();
    global.AbortController = jest.fn(() => ({
      signal: {} as AbortSignal,
      abort: mockAbort
    })) as any;
    const promise = client.request({
      url: 'https://api.example.com/data',
      timeout: 100
    });
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(mockAbort).toHaveBeenCalled();
  });
  });
  describe('request', () => {
  test('должен извлечь заголовки ответа', async () => {
    const headers = new Headers();
    headers.set('X-Custom', 'value');
    headers.set('Content-Type', 'application/json');
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers,
      json: async () => ({})
    });
    const response = await client.get('https://api.example.com/data');
    expect(response.headers).toHaveProperty('x-custom', 'value');
    expect(response.headers).toHaveProperty('content-type', 'application/json');
  });
  test('должен обработать пустые заголовки', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({})
    });
    const response = await client.get('https://api.example.com/data');
    expect(response.headers).toBeDefined();
  });
  test('должен работать с кастомным timeout', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    const mockAbort = jest.fn();
    global.AbortController = jest.fn(() => ({
      signal: {} as AbortSignal,
      abort: mockAbort
    })) as any;
    const promise = client.request({
      url: 'https://api.example.com/data',
      timeout: 50
    });
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(mockAbort).toHaveBeenCalled();
  });
  });
  describe('AbortController', () => {
  test('должен использовать AbortController для timeout', async () => {
    const mockAbort = jest.fn();
    global.AbortController = jest.fn(() => ({
      signal: {} as AbortSignal,
      abort: mockAbort
    })) as any;
    mockFetch.mockImplementation(() => new Promise(() => {}));
    const promise = client.get('https://api.example.com/data');
    
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(global.AbortController).toHaveBeenCalled();
  });
  });
});