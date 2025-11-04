/**
 * Реализация HTTP клиента на основе Fetch API
 * Infrastructure слой
 */

import {
  IHttpClient,
  IHttpResponse,
  IHttpError,
  IHttpRequestOptions,
} from '../../core/ports/HttpClient';
import { IApiRequestParams } from '../../core/types/form';
import { HTTP_DEFAULT_TIMEOUT_MS } from '../../utils/constants';

export class FetchHttpClient implements IHttpClient {
  private readonly defaultTimeout: number = HTTP_DEFAULT_TIMEOUT_MS;

  /**
   * Построить URL с query параметрами
   */
  private buildUrlWithParams(url: string, params?: IApiRequestParams): string {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const urlObj = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      urlObj.searchParams.append(key, String(value));
    }
  });

  return urlObj.toString();
  }

  /**
   * Выполнить HTTP запрос
   */
  async request<T = any>(options: IHttpRequestOptions): Promise<IHttpResponse<T>> {
  const {
    url,
    method = 'GET',
    headers = {},
    params,
    data,
    timeout = this.defaultTimeout,
  } = options;

  const fullUrl = method === 'GET' && params
    ? this.buildUrlWithParams(url, params)
    : url;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: controller.signal,
    };

    // Добавляем body для POST запросов
    if (method === 'POST' && data) {
      if (params) {
        // Для POST запросов params могут быть в body
        fetchOptions.body = JSON.stringify({ ...params, ...data });
      } else {
        fetchOptions.body = JSON.stringify(data);
      }
    }

    const response = await fetch(fullUrl, fetchOptions);

    clearTimeout(timeoutId);

    // Парсим ответ
    let responseData: T;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = (await response.text()) as any;
    }

    // Проверяем статус
    if (!response.ok) {
      const error: IHttpError = {
        message: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        statusText: response.statusText,
        url: fullUrl,
      };
      throw error;
    }

    return {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: this.extractHeaders(response.headers),
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      const timeoutError: IHttpError = {
        message: `Превышено время ожидания запроса (${timeout}ms)`,
        url: fullUrl,
      };
      throw timeoutError;
    }

    if ((error as IHttpError).url) {
      throw error; // Уже наша ошибка
    }

    const httpError: IHttpError = {
      message: error.message || 'Неизвестная ошибка сети',
      url: fullUrl,
    };
    throw httpError;
  }
  }

  /**
   * GET запрос
   */
  async get<T = any>(
  url: string,
  params?: IApiRequestParams,
  headers?: Record<string, string>
  ): Promise<IHttpResponse<T>> {
  return this.request<T>({
    url,
    method: 'GET',
    params,
    headers,
  });
  }

  /**
   * POST запрос
   */
  async post<T = any>(
  url: string,
  data?: any,
  headers?: Record<string, string>
  ): Promise<IHttpResponse<T>> {
  return this.request<T>({
    url,
    method: 'POST',
    data,
    headers,
  });
  }

  /**
   * Извлечь заголовки из Headers объекта
   */
  private extractHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
  }
}

