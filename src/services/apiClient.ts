import { API_BASE_URL, API_REQUEST_TIMEOUT_MS, buildApiUrl } from './apiConfig';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp?: string;
    [key: string]: unknown;
  };
}

export interface ApiErrorPayload {
  success?: false;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  timestamp?: string;
}

export class ApiClientError extends Error {
  status: number;
  code: string;
  details: unknown;

  constructor(message: string, status = 500, code = 'API_ERROR', details: unknown = null) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

class ApiClient {
  private baseUrl: string;
  // In-memory JWT placeholder for Phase 3 authentication (never stored in localStorage)
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      query,
      signal,
      timeoutMs = API_REQUEST_TIMEOUT_MS,
    } = options;

    const url = buildApiUrl(endpoint, query);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    const onExternalAbort = () => controller.abort();
    if (signal) {
      if (signal.aborted) {
        controller.abort();
      } else {
        signal.addEventListener('abort', onExternalAbort, { once: true });
      }
    }

    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...headers,
    };

    if (body !== undefined) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    if (this.authToken) {
      requestHeaders.Authorization = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const payload = isJson ? await response.json() : null;

      if (!response.ok) {
        const errObj = (payload as ApiErrorPayload | null)?.error;
        throw new ApiClientError(
          errObj?.message || `Request failed with HTTP ${response.status}`,
          response.status,
          errObj?.code || `HTTP_${response.status}`,
          errObj?.details ?? null
        );
      }

      if (payload && typeof payload === 'object' && 'data' in payload) {
        return (payload as ApiEnvelope<T>).data;
      }

      return payload as T;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      if (error instanceof DOMException && error.name === 'AbortError') {
        if (signal?.aborted) {
          throw new ApiClientError('Request was cancelled.', 499, 'REQUEST_ABORTED');
        }
        throw new ApiClientError(
          'Backend API request timed out. Please verify the Express server is running.',
          504,
          'REQUEST_TIMEOUT'
        );
      }
      throw new ApiClientError(
        error instanceof Error
          ? error.message
          : 'Unable to reach BULLSIGHT backend API.',
        0,
        'NETWORK_ERROR'
      );
    } finally {
      window.clearTimeout(timeoutId);
      if (signal) {
        signal.removeEventListener('abort', onExternalAbort);
      }
    }
  }

  get<T>(
    endpoint: string,
    query?: Record<string, string | number | boolean | undefined | null>,
    signal?: AbortSignal
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', query, signal });
  }

  post<T>(endpoint: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, signal });
  }

  delete<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', signal });
  }
}

export const apiClient = new ApiClient();
