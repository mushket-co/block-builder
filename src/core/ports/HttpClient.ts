/**
 * Интерфейс (Port) для HTTP клиента
 * Используется для запросов к внешним API пользователя
 */

import { THttpMethod, IApiRequestParams } from '../types/form';

// Результат HTTP запроса
export interface IHttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers?: Record<string, string>;
}

// Ошибка HTTP запроса
export interface IHttpError {
  message: string;
  status?: number;
  statusText?: string;
  url: string;
}

// Опции для HTTP запроса
export interface IHttpRequestOptions {
  url: string;
  method?: THttpMethod;
  headers?: Record<string, string>;
  params?: IApiRequestParams;
  data?: any;
  timeout?: number;
}

/**
 * Интерфейс HTTP клиента
 * Реализация в Infrastructure слое
 */
export interface IHttpClient {
  /**
   * Выполнить HTTP запрос
   * @param options - параметры запроса
   * @returns Promise с ответом или ошибкой
   */
  request<T = any>(options: IHttpRequestOptions): Promise<IHttpResponse<T>>;

  /**
   * GET запрос
   * @param url - URL
   * @param params - параметры запроса
   * @param headers - заголовки
   */
  get<T = any>(
  url: string,
  params?: IApiRequestParams,
  headers?: Record<string, string>
  ): Promise<IHttpResponse<T>>;

  /**
   * POST запрос
   * @param url - URL
   * @param data - тело запроса
   * @param headers - заголовки
   */
  post<T = any>(
  url: string,
  data?: any,
  headers?: Record<string, string>
  ): Promise<IHttpResponse<T>>;
}

