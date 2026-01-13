/**
 * API Client Base
 * Utility functions for client-side API calls
 *
 * This module exclusively handles HTTP calls
 */

/**
 * Request configuration
 */
export interface RequestConfig extends RequestInit {
  /** Timeout in milliseconds */
  timeout?: number
}

/**
 * Custom API error
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

/**
 * Builds a URL with query parameters
 */
export function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  if (!params) return endpoint

  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `${endpoint}?${queryString}` : endpoint
}

/**
 * Performs a GET request
 */
export async function apiGet<T>(endpoint: string, config?: RequestConfig): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers,
    },
    ...config,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiClientError(
      errorData.error?.message || 'Error during the request',
      response.status,
      errorData.error?.code,
      errorData.error?.details,
    )
  }

  return response.json()
}

/**
 * Performs a POST request
 */
export async function apiPost<T, D = unknown>(
  endpoint: string,
  data: D,
  config?: RequestConfig,
): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers,
    },
    body: JSON.stringify(data),
    ...config,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiClientError(
      errorData.error?.message || 'Error during creation',
      response.status,
      errorData.error?.code,
      errorData.error?.details,
    )
  }

  return response.json()
}

/**
 * Performs a PATCH request
 */
export async function apiPatch<T, D = unknown>(
  endpoint: string,
  data: D,
  config?: RequestConfig,
): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers,
    },
    body: JSON.stringify(data),
    ...config,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiClientError(
      errorData.error?.message || 'Error during update',
      response.status,
      errorData.error?.code,
      errorData.error?.details,
    )
  }

  return response.json()
}

/**
 * Performs a DELETE request
 */
export async function apiDelete<T = void>(endpoint: string, config?: RequestConfig): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers,
    },
    ...config,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiClientError(
      errorData.error?.message || 'Error during deletion',
      response.status,
      errorData.error?.code,
      errorData.error?.details,
    )
  }

  // DELETE may return an empty body
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}
