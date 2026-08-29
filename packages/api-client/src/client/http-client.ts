import { ApiClientConfig, DEFAULT_TIMEOUT_MS, validateApiUrl } from '../config/api-config';
import { ApiError } from '../errors/api-error';
import { TokenManager } from '../auth/token-manager';
import { HttpMethod, RequestCredentialsMode, RequestOptions, buildUrl } from './request';
import { parseResponse } from './response';

export class HttpClient {
  public readonly baseUrl: string;
  public readonly timeout: number;
  public readonly tokenManager: TokenManager;
  private refreshHandler?: () => Promise<string | null>;
  private credentials: RequestCredentialsMode;
  private defaultHeaders: Record<string, string>;
  private fetchFn: typeof fetch;
  private onUnauthorized?: () => void | Promise<void>;

  constructor(config: ApiClientConfig) {
    this.baseUrl = validateApiUrl(config.baseUrl);
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT_MS;
    this.tokenManager = new TokenManager(config.tokenProvider);
    this.refreshHandler = config.refreshHandler;
    this.credentials = config.credentials ?? 'include';
    this.defaultHeaders = config.headers ?? {};
    this.fetchFn = config.fetch ?? (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : (fetch as typeof fetch));
    this.onUnauthorized = config.onUnauthorized;
  }

  public setRefreshHandler(handler: () => Promise<string | null>): void {
    this.refreshHandler = handler;
  }

  public async request<T = unknown>(options: RequestOptions, isRetry = false): Promise<T> {
    const url = buildUrl(this.baseUrl, options.path, options.params);
    const method: HttpMethod = options.method ?? 'GET';
    const timeoutMs = options.timeout ?? this.timeout;

    // Build headers
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...this.defaultHeaders,
      ...options.headers,
    };

    let bodyData: any = undefined;
    if (options.body !== undefined && options.body !== null) {
      if (typeof options.body === 'string') {
        bodyData = options.body;
      } else if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
        bodyData = options.body;
      } else if (typeof URLSearchParams !== 'undefined' && options.body instanceof URLSearchParams) {
        bodyData = options.body;
      } else {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
        bodyData = JSON.stringify(options.body);
      }
    }

    // Attach access token if auth is not explicitly skipped
    if (!options.skipAuth) {
      const accessToken = await this.tokenManager.getAccessToken();
      if (accessToken && !headers['Authorization'] && !headers['authorization']) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    // Setup cancellation and timeout handling
    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    // Relay external signal if provided
    if (options.signal) {
      if (options.signal.aborted) {
        clearTimeout(timeoutId);
        controller.abort();
      } else {
        options.signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          controller.abort();
        });
      }
    }

    let response: Response;
    try {
      response = await this.fetchFn(url, {
        method,
        headers,
        body: bodyData,
        credentials: options.credentials ?? this.credentials,
        signal: controller.signal,
      });
    } catch (networkError) {
      clearTimeout(timeoutId);
      if (timedOut) {
        throw ApiError.fromTimeout(timeoutMs);
      }
      throw ApiError.fromNetworkError(networkError);
    } finally {
      clearTimeout(timeoutId);
    }

    // Handle 401 Unauthorized for automatic token refresh & retry (max 1 retry)
    if (response.status === 401 && !options.skipAuth && !isRetry && this.refreshHandler) {
      try {
        const newAccessToken = await this.tokenManager.executeSingleFlightRefresh(
          this.refreshHandler
        );

        if (newAccessToken) {
          // Retry the request once with the new access token
          return await this.request<T>(
            {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${newAccessToken}`,
              },
            },
            true
          );
        }
      } catch (refreshErr) {
        // Refresh failed: clear credentials and notify
        await this.tokenManager.clear();
        if (this.onUnauthorized) {
          await this.onUnauthorized();
        }
        // Let normal parseResponse throw the 401 ApiError
      }
    }

    return parseResponse<T>(response);
  }

  public async get<T = unknown>(
    path: string,
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<T> {
    return this.request<T>({ ...options, method: 'GET', path });
  }

  public async post<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<T> {
    return this.request<T>({ ...options, method: 'POST', path, body });
  }

  public async patch<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<T> {
    return this.request<T>({ ...options, method: 'PATCH', path, body });
  }

  public async put<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<T> {
    return this.request<T>({ ...options, method: 'PUT', path, body });
  }

  public async delete<T = unknown>(
    path: string,
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<T> {
    return this.request<T>({ ...options, method: 'DELETE', path });
  }
}
