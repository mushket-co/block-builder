import {
  IHttpClient,
  IHttpError,
  IHttpRequestOptions,
  IHttpResponse,
} from '../../core/ports/HttpClient';
import { IApiRequestParams } from '../../core/types/form';
import { HTTP_DEFAULT_TIMEOUT_MS } from '../../utils/constants';

export class FetchHttpClient implements IHttpClient {
  private readonly defaultTimeout: number = HTTP_DEFAULT_TIMEOUT_MS;

  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  }

  private normalizeUrl(url: string): string {
    try {
      new URL(url);
      return url;
    } catch {
      const baseUrl = this.getBaseUrl();
      return new URL(url, baseUrl).toString();
    }
  }

  private buildUrlWithParams(url: string, params?: IApiRequestParams): string {
    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const absoluteUrl = this.normalizeUrl(url);
    const urlObj = new URL(absoluteUrl);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObj.searchParams.append(key, String(value));
      }
    });

    const result = urlObj.toString();

    try {
      new URL(url);
      return result;
    } catch {
      return urlObj.pathname + urlObj.search;
    }
  }

  async request<T = unknown>(options: IHttpRequestOptions): Promise<IHttpResponse<T>> {
    const {
      url,
      method = 'GET',
      headers = {},
      params,
      data,
      timeout = this.defaultTimeout,
    } = options;

    const fullUrl = method === 'GET' && params ? this.buildUrlWithParams(url, params) : url;
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
      if (method === 'POST' && data) {
        fetchOptions.body = params ? JSON.stringify({ ...params, ...data }) : JSON.stringify(data);
      }
      const response = await fetch(fullUrl, fetchOptions);
      clearTimeout(timeoutId);
      const contentType = response.headers.get('content-type');
      const responseData: T =
        contentType && contentType.includes('application/json')
          ? await response.json()
          : ((await response.text()) as T);
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
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        const timeoutError: IHttpError = {
          message: `Превышено время ожидания запроса (${timeout}ms)`,
          url: fullUrl,
        };
        throw timeoutError;
      }
      if (error && typeof error === 'object' && 'url' in error) {
        throw error as IHttpError;
      }
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка сети';
      const httpError: IHttpError = {
        message,
        url: fullUrl,
      };
      throw httpError;
    }
  }

  async get<T = unknown>(
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

  async post<T = unknown>(
    url: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<IHttpResponse<T>> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
      headers,
    });
  }

  private extractHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
}
