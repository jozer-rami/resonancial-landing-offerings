/**
 * API Client Module
 *
 * Centralized HTTP client for communicating with the backend API.
 * Supports configurable API URL via VITE_API_URL environment variable.
 *
 * Features:
 *   - Timeout handling (10s default)
 *   - Automatic retry with exponential backoff (3 retries)
 *   - Environment-aware configuration
 *
 * Usage:
 *   - Local dev (full-stack): VITE_API_URL=http://localhost:5000
 *   - Local dev (frontend only): VITE_API_URL=https://api-staging.railway.app
 *   - Replit: VITE_API_URL=https://api-staging.railway.app
 *   - Production: VITE_API_URL=https://api.resonancial.com
 */

const API_URL = import.meta.env.VITE_API_URL || '';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base delay

// Warn in development if API_URL is not configured
if (!API_URL && import.meta.env.DEV) {
  console.warn('[API] VITE_API_URL not configured. API calls may fail.');
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
    public isTimeout?: boolean,
    public isNetworkError?: boolean
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Generic API client function for making HTTP requests
 * with timeout handling and automatic retry
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    params,
    body,
    headers: customHeaders,
    timeout = DEFAULT_TIMEOUT,
    retries = MAX_RETRIES,
    ...fetchOptions
  } = options;

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

  let lastError: Error | null = null;

  // Retry loop
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Make request with timeout
      const response = await fetchWithTimeout(
        url,
        {
          ...fetchOptions,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        },
        timeout
      );

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
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx) - only server errors (5xx) and network errors
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Handle timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new ApiError(
          'Request timeout - please try again',
          0,
          undefined,
          true
        );
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        lastError = new ApiError(
          'Network error - please check your connection',
          0,
          undefined,
          false,
          true
        );
      }

      // If we have retries left, wait and try again
      if (attempt < retries) {
        const delay = RETRY_DELAY_BASE * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }
    }
  }

  // All retries exhausted
  throw lastError || new ApiError('Unknown error', 0);
}

// ============================================================================
// Typed API Methods
// ============================================================================

export interface NewsletterSubscriber {
  id: string;
  email: string;
  phone?: string;
  phoneCountryCode?: string;
  contactPreference: 'email' | 'whatsapp';
  subscribedAt: string;
}

export interface DiscountCode {
  code: string;
  value: string;
  expiresAt: string;
  deliveryChannel: 'email' | 'whatsapp';
  deliveryStatus: 'pending' | 'sent' | 'failed';
  redeemed?: boolean;
}

export interface NewsletterSubscribeRequest {
  email: string;
  contactPreference?: 'email' | 'whatsapp';
  phone?: string;
  phoneCountryCode?: string;
  consentWhatsapp?: boolean;
  consentEmail?: boolean;
}

export interface NewsletterSubscribeResponse {
  message: string;
  subscriber?: NewsletterSubscriber;
  discountCode?: DiscountCode;
}

export interface DiscountCodeValidateResponse {
  valid: boolean;
  code?: string;
  type?: string;
  value?: number;
  expiresAt?: string;
  error?: string;
}

export interface DiscountCodeRedeemResponse {
  success: boolean;
  message?: string;
  error?: string;
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
     * Subscribe to the newsletter with optional contact preference
     */
    subscribe: (data: NewsletterSubscribeRequest): Promise<NewsletterSubscribeResponse> =>
      apiClient<NewsletterSubscribeResponse>('/api/newsletter/subscribe', {
        method: 'POST',
        body: data,
      }),
  },

  /**
   * Discount code endpoints
   */
  discountCodes: {
    /**
     * Validate a discount code
     */
    validate: (code: string): Promise<DiscountCodeValidateResponse> =>
      apiClient<DiscountCodeValidateResponse>('/api/discount-codes/validate', {
        method: 'POST',
        body: { code },
      }),

    /**
     * Redeem a discount code
     */
    redeem: (code: string, orderId: string): Promise<DiscountCodeRedeemResponse> =>
      apiClient<DiscountCodeRedeemResponse>('/api/discount-codes/redeem', {
        method: 'POST',
        body: { code, orderId },
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
