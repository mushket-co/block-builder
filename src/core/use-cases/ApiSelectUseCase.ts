/**
 * Use Case для работы с API Select
 * Обрабатывает запросы к внешним API пользователя
 */

import { IHttpClient } from '../ports/HttpClient';
import {
  IApiSelectConfig,
  IApiSelectResponse,
  IApiSelectItem,
  IApiRequestParams,
} from '../types/form';

export class ApiSelectUseCase {
  constructor(private readonly httpClient: IHttpClient) {}

  /**
   * Загрузить данные из API согласно конфигурации
   */
  async fetchItems(
  config: IApiSelectConfig,
  params: IApiRequestParams = {}
  ): Promise<IApiSelectResponse> {
  try {
    // Подготовка параметров запроса
    const requestParams = this.prepareRequestParams(config, params);

    // Выполнение запроса
    const method = config.method || 'GET';
    const response =
      method === 'GET'
        ? await this.httpClient.get(config.url, requestParams, config.headers)
        : await this.httpClient.post(config.url, requestParams, config.headers);

    // Преобразование ответа
    return this.mapResponse(config, response.data);
  } catch (error: any) {
    throw new Error(`Ошибка загрузки данных: ${error.message}`);
  }
  }

  /**
   * Подготовить параметры запроса
   */
  private prepareRequestParams(
  config: IApiSelectConfig,
  params: IApiRequestParams
  ): IApiRequestParams {
  const result: IApiRequestParams = {};

  // Поиск
  if (params.search !== undefined) {
    const searchParam = config.searchParam || 'search';
    result[searchParam] = params.search;
  }

  // Пагинация
  if (params.page !== undefined) {
    const pageParam = config.pageParam || 'page';
    result[pageParam] = params.page;
  }

  if (params.limit !== undefined || config.limit) {
    const limitParam = config.limitParam || 'limit';
    result[limitParam] = params.limit || config.limit || 20;
  }

  // Дополнительные параметры
  Object.keys(params).forEach((key) => {
    if (!['search', 'page', 'limit'].includes(key)) {
      result[key] = params[key];
    }
  });

  return result;
  }

  /**
   * Преобразовать ответ API в стандартный формат
   */
  private mapResponse(
  config: IApiSelectConfig,
  rawResponse: any
  ): IApiSelectResponse {
  // Если есть кастомный маппер
  if (config.responseMapper) {
    return config.responseMapper(rawResponse);
  }

  // Извлечение данных по пути
  let data = rawResponse;
  if (config.dataPath) {
    data = this.getValueByPath(rawResponse, config.dataPath);
  }

  // Если data не массив, попробовать стандартные пути
  if (!Array.isArray(data)) {
    if (Array.isArray(rawResponse.data)) {
      data = rawResponse.data;
    } else if (Array.isArray(rawResponse.items)) {
      data = rawResponse.items;
    } else if (Array.isArray(rawResponse.results)) {
      data = rawResponse.results;
    } else {
      throw new Error(
        'Не удалось определить массив данных в ответе API. Используйте responseMapper или dataPath.'
      );
    }
  }

  // Маппинг элементов
  const idField = config.idField || 'id';
  const nameField = config.nameField || 'name';

  const mappedData: IApiSelectItem[] = data.map((item: any) => ({
    id: item[idField],
    name: item[nameField],
  }));

  return {
    data: mappedData,
    total: rawResponse.total,
    page: rawResponse.page,
    hasMore: rawResponse.hasMore,
  };
  }

  /**
   * Получить значение по пути (например, 'data.items')
   */
  private getValueByPath(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Валидация конфигурации
   */
  validateConfig(config: IApiSelectConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.url) {
    errors.push('URL обязателен');
  } else {
    try {
      new URL(config.url);
    } catch {
      errors.push('Некорректный URL');
    }
  }

  if (config.method && !['GET', 'POST'].includes(config.method)) {
    errors.push('Метод должен быть GET или POST');
  }

  if (config.limit !== undefined && config.limit < 1) {
    errors.push('Limit должен быть больше 0');
  }

  if (config.debounceMs !== undefined && config.debounceMs < 0) {
    errors.push('debounceMs не может быть отрицательным');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
  }
}

