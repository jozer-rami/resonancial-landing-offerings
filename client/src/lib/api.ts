/**
 * API Client Module
 *
 * Centralized HTTP client for communicating with the backend API.
 * Supports configurable API URL via VITE_API_URL environment variable.
 *
 * Usage:
 *   - Local dev (full-stack): VITE_API_URL=http://localhost:5000
 *   - Local dev (frontend only): VITE_API_URL=https://api-staging.railway.app
 *   - Replit: VITE_API_URL=https://api-staging.railway.app
 *   - Production: VITE_API_URL=https://api.resonancial.com
 */

const API_URL = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string>;
  body?: unknown;
}

/**
 * Generic API client function for making HTTP requests
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, body, headers: customHeaders, ...fetchOptions } = options;

  // Build URL with optional query params
  let url = `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams}`;
  }

  // Prepare headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // Make request
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Parse response
  let data: unknown;
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  // Handle errors
  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? String((data as Record<string, unknown>).message)
        : `API Error: ${response.status}`;

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

// ============================================================================
// Typed API Methods
// ============================================================================

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export interface NewsletterSubscribeResponse {
  message: string;
  subscriber?: NewsletterSubscriber;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  environment: string;
  version: string;
}

/**
 * API namespace with typed methods for each endpoint
 */
export const api = {
  /**
   * Newsletter endpoints
   */
  newsletter: {
    /**
     * Subscribe an email to the newsletter
     */
    subscribe: (email: string): Promise<NewsletterSubscribeResponse> =>
      apiClient<NewsletterSubscribeResponse>('/api/newsletter/subscribe', {
        method: 'POST',
        body: { email },
      }),
  },

  /**
   * Health check endpoint
   */
  health: (): Promise<HealthResponse> => apiClient<HealthResponse>('/api/health'),
} as const;

/**
 * Get the configured API URL (useful for debugging)
 */
export function getApiUrl(): string {
  return API_URL || '(same origin)';
}
