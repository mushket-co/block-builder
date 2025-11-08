import { IHttpClient } from '../ports/HttpClient';
import {
  IApiSelectConfig,
  IApiSelectResponse,
  IApiSelectItem,
  IApiRequestParams,
} from '../types/form';
export class ApiSelectUseCase {
  constructor(private readonly httpClient: IHttpClient) {}
  
  async fetchItems(
  config: IApiSelectConfig,
  params: IApiRequestParams = {}
  ): Promise<IApiSelectResponse> {
  try {
    const requestParams = this.prepareRequestParams(config, params);
    const method = config.method || 'GET';
    const response =
      method === 'GET'
        ? await this.httpClient.get(config.url, requestParams, config.headers)
        : await this.httpClient.post(config.url, requestParams, config.headers);
    return this.mapResponse(config, response.data);
  } catch (error: any) {
    throw new Error(`Ошибка загрузки данных: ${error.message}`);
  }
  }
  
  private prepareRequestParams(
  config: IApiSelectConfig,
  params: IApiRequestParams
  ): IApiRequestParams {
  const result: IApiRequestParams = {};
  if (params.search !== undefined) {
    const searchParam = config.searchParam || 'search';
    result[searchParam] = params.search;
  }
  if (params.page !== undefined) {
    const pageParam = config.pageParam || 'page';
    result[pageParam] = params.page;
  }
  if (params.limit !== undefined || config.limit) {
    const limitParam = config.limitParam || 'limit';
    result[limitParam] = params.limit || config.limit || 20;
  }
  Object.keys(params).forEach((key) => {
    if (!['search', 'page', 'limit'].includes(key)) {
      result[key] = params[key];
    }
  });
  return result;
  }
  
  private mapResponse(
  config: IApiSelectConfig,
  rawResponse: any
  ): IApiSelectResponse {
  if (config.responseMapper) {
    return config.responseMapper(rawResponse);
  }
  let data = rawResponse;
  if (config.dataPath) {
    data = this.getValueByPath(rawResponse, config.dataPath);
  }
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
  
  private getValueByPath(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
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