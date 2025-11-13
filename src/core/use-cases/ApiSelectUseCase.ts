import { IHttpClient } from '../ports/HttpClient';
import {
  IApiRequestParams,
  IApiSelectConfig,
  IApiSelectItem,
  IApiSelectResponse,
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      throw new Error(`Ошибка загрузки данных: ${message}`);
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
    Object.keys(params).forEach(key => {
      if (!['search', 'page', 'limit'].includes(key)) {
        result[key] = params[key];
      }
    });
    return result;
  }

  private mapResponse(config: IApiSelectConfig, rawResponse: unknown): IApiSelectResponse {
    if (config.responseMapper) {
      return config.responseMapper(rawResponse);
    }
    let data: unknown = rawResponse;
    if (config.dataPath) {
      data = this.getValueByPath(rawResponse, config.dataPath);
    }
    if (!Array.isArray(data)) {
      const responseObj = rawResponse as Record<string, unknown>;
      if (Array.isArray(responseObj.data)) {
        data = responseObj.data;
      } else if (Array.isArray(responseObj.items)) {
        data = responseObj.items;
      } else if (Array.isArray(responseObj.results)) {
        data = responseObj.results;
      } else {
        throw new TypeError(
          'Не удалось определить массив данных в ответе API. Используйте responseMapper или dataPath.'
        );
      }
    }
    if (!Array.isArray(data)) {
      throw new TypeError('Данные должны быть массивом');
    }
    const dataArray = data as Array<Record<string, unknown>>;
    const idField = config.idField || 'id';
    const nameField = config.nameField || 'name';
    const mappedData: IApiSelectItem[] = dataArray.map((item: Record<string, unknown>) => ({
      id: item[idField] as string | number,
      name: String(item[nameField] || ''),
    }));
    const responseObj = rawResponse as Record<string, unknown>;
    return {
      data: mappedData,
      total: responseObj.total as number | undefined,
      page: responseObj.page as number | undefined,
      hasMore: responseObj.hasMore as boolean | undefined,
    };
  }

  private getValueByPath(obj: unknown, path: string): unknown {
    if (typeof obj !== 'object' || obj === null) {
      return undefined;
    }
    return path.split('.').reduce((current: unknown, key: string) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  validateConfig(config: IApiSelectConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!config.url) {
      errors.push('URL обязателен');
    } else {
      try {
        // Пытаемся создать URL - если это относительный путь, выбросит ошибку
        new URL(config.url);
      } catch {
        // Проверяем, что это хотя бы похоже на относительный путь
        if (!config.url.startsWith('/') && !config.url.match(/^https?:\/\//)) {
          errors.push('Некорректный URL');
        }
        // Относительные URL (начинающиеся с /) считаем валидными
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
