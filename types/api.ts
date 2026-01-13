/**
 * API Response Types
 * Generic types for standardized API responses
 */

// ============ Generic API Types ============

/**
 * Generic paginated response
 * @template T - Type of the items in the list
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

/**
 * Successful API response
 */
export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// ============ Query Params Types ============

/**
 * Generic pagination parameters
 */
export interface PaginationParams {
  page?: number
  perPage?: number
}

/**
 * Generic sorting parameters
 */
export interface SortParams {
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

/**
 * Generic search parameters
 */
export interface SearchParams {
  q?: string
}

/**
 * Combination of common query parameters
 */
export type CommonQueryParams = PaginationParams & SortParams & SearchParams

// ============ Mutation Types ============

/**
 * Options for optimistic mutations with SWR
 */
export interface OptimisticMutationOptions<T> {
  optimisticData?: T | ((current: T | undefined) => T | undefined)
  rollbackOnError?: boolean
  revalidate?: boolean
}
