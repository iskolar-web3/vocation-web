import { ApiResponse, PaginationMeta } from '../types/api';
import { handleDevMockRequest } from './devMock';

const LIVE_API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: Record<string, any>;

  constructor(message: string, status: number, code?: string, details?: Record<string, any>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface ApiFetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export interface ApiFetchResult<T> {
  data: T;
  message: string;
  meta?: PaginationMeta;
}

export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<ApiFetchResult<T>> {
  const { params, headers, ...customConfig } = options;

  // 1. In standalone development (no external backend URL configured), resolve with dev mock engine directly
  if (!LIVE_API_URL) {
    const parsedBody = customConfig.body
      ? typeof customConfig.body === 'string'
        ? JSON.parse(customConfig.body)
        : customConfig.body
      : undefined;
    const mock = await handleDevMockRequest<T>(
      endpoint,
      customConfig.method || 'GET',
      parsedBody,
      params
    );
    if (mock) {
      return mock;
    }
  }

  // 2. Connect to live backend API
  let url = endpoint.startsWith('http')
    ? endpoint
    : `${LIVE_API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const config: RequestInit = {
    method: 'GET',
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...customConfig,
  };

  try {
    const response = await fetch(url, config);

    let payload: ApiResponse<T>;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      payload = await response.json();
    } else {
      payload = {
        message: response.ok ? 'Success' : `HTTP error ${response.status}`,
        data: null as unknown as T,
      };
    }

    if (!response.ok) {
      const errorMessage = payload?.message || `Request failed with status ${response.status}`;
      throw new ApiError(
        errorMessage,
        response.status,
        payload?.error?.code,
        payload?.error?.details
      );
    }

    return {
      data: payload.data,
      message: payload.message || 'ok',
      meta: payload.meta,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network / offline fallback if live server is unreachable
    try {
      const parsedBody = config.body
        ? typeof config.body === 'string'
          ? JSON.parse(config.body)
          : config.body
        : undefined;
      const mock = await handleDevMockRequest<T>(
        endpoint,
        config.method || 'GET',
        parsedBody,
        params
      );
      if (mock) {
        return mock;
      }
    } catch {
      // ignore
    }

    const message = error instanceof Error ? error.message : 'Network error';
    throw new ApiError(message, 0);
  }
}

export const api = {
  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>, options?: ApiFetchOptions) {
    return apiFetch<T>(endpoint, { method: 'GET', params, ...options });
  },
  post<T>(endpoint: string, body?: any, options?: ApiFetchOptions) {
    return apiFetch<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  },
  put<T>(endpoint: string, body?: any, options?: ApiFetchOptions) {
    return apiFetch<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  },
  patch<T>(endpoint: string, body?: any, options?: ApiFetchOptions) {
    return apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  },
  delete<T>(endpoint: string, options?: ApiFetchOptions) {
    return apiFetch<T>(endpoint, { method: 'DELETE', ...options });
  },
};
