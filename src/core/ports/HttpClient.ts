import { IApiRequestParams, THttpMethod } from '../types/form';

export interface IHttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers?: Record<string, string>;
}
export interface IHttpError {
  message: string;
  status?: number;
  statusText?: string;
  url: string;
}
export interface IHttpRequestOptions {
  url: string;
  method?: THttpMethod;
  headers?: Record<string, string>;
  params?: IApiRequestParams;
  data?: unknown;
  timeout?: number;
}
export interface IHttpClient {
  request<T = unknown>(options: IHttpRequestOptions): Promise<IHttpResponse<T>>;

  get<T = unknown>(
    url: string,
    params?: IApiRequestParams,
    headers?: Record<string, string>
  ): Promise<IHttpResponse<T>>;

  post<T = unknown>(
    url: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<IHttpResponse<T>>;
}
