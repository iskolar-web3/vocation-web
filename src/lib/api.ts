import { ApiResponse, PaginationMeta } from '../types/api';
import { z } from 'zod';

const LIVE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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

export interface ApiFetchOptions<T = any> extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  schema?: z.ZodType<any>;
}

export interface ApiFetchResult<T> {
  data: T;
  message: string;
  meta?: PaginationMeta;
}

// Dev-only dynamic mock loader (ADR-0018 / Issue #15)
// Tree-shaken completely in production builds (import.meta.env.DEV is statically false)
async function tryDevMock<T>(
  endpoint: string,
  method: string,
  body?: any,
  params?: Record<string, string | number | boolean | undefined | null>
): Promise<ApiFetchResult<T> | null> {
  const cleanEndpoint = endpoint.split('?')[0].replace(/^\/v1/, '').replace(/^\//, '');

  // Directly connect to real backend: avoid mock data in internships & companies
  if (
    cleanEndpoint === 'internships' ||
    cleanEndpoint.startsWith('internships/') ||
    cleanEndpoint === 'companies' ||
    cleanEndpoint.startsWith('companies/')
  ) {
    return null;
  }

  if (import.meta.env.DEV) {
    try {
      const { handleDevMockRequest } = await import('./devMock');
      return await handleDevMockRequest<T>(endpoint, method, body, params);
    } catch {
      return null;
    }
  }
  return null;
}

export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<ApiFetchResult<T>> {
  const { params, headers, ...customConfig } = options;

  // 1. Connect directly to backend API
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

  const defaultHeaders: Record<string, string> = {
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
    if (contentType?.includes('application/json')) {
      payload = await response.json();
    } else {
      payload = {
        message: response.ok ? 'Success' : `HTTP error ${response.status}`,
        data: null as unknown as T,
      };
    }

    if (!response.ok) {
      if (response.status === 503 || payload?.error?.code === 'unavailable') {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app:maintenance'));
        }
      }
      const errorMessage = payload?.message || `Request failed with status ${response.status}`;
      throw new ApiError(
        errorMessage,
        response.status,
        payload?.error?.code,
        payload?.error?.details
      );
    }

    let parsedData = payload.data;
    if (options.schema && parsedData !== null && parsedData !== undefined) {
      const parseResult = options.schema.safeParse(parsedData);
      if (!parseResult.success) {
        console.warn(`[apiFetch] Schema validation drift on ${endpoint}:`, parseResult.error.format());
      } else {
        parsedData = parseResult.data;
      }
    }

    return {
      data: parsedData,
      message: payload.message || 'ok',
      meta: payload.meta,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // In development mode, if the server is unreachable or offline, fallback to devMock
    if (import.meta.env.DEV) {
      try {
        const parsedBody = config.body
          ? typeof config.body === 'string'
            ? JSON.parse(config.body)
            : config.body
          : undefined;
        const mock = await tryDevMock<T>(
          endpoint,
          config.method || 'GET',
          parsedBody,
          params
        );
        if (mock) {
          console.warn(`[apiFetch] Backend unreachable at ${url}. Serving devMock for ${endpoint}.`);
          return mock;
        }
      } catch {
        // ignore
      }
    }

    const message = error instanceof Error ? error.message : 'Network error';
    throw new ApiError(message, 0);
  }
}

export const api = {
  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>, options?: ApiFetchOptions<T>) {
    return apiFetch<T>(endpoint, { method: 'GET', params, ...options });
  },
  post<T>(endpoint: string, body?: any, options?: ApiFetchOptions<T>) {
    return apiFetch<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  },
  put<T>(endpoint: string, body?: any, options?: ApiFetchOptions<T>) {
    return apiFetch<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  },
  patch<T>(endpoint: string, body?: any, options?: ApiFetchOptions<T>) {
    return apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  },
  delete<T>(endpoint: string, options?: ApiFetchOptions<T>) {
    return apiFetch<T>(endpoint, { method: 'DELETE', ...options });
  },
};
