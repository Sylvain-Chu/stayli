import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { logger } from './logger'

/**
 * Standard API error codes
 */
export enum ApiErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  public readonly code: ApiErrorCode
  public readonly statusCode: number
  public readonly details?: unknown

  constructor(code: ApiErrorCode, message: string, statusCode: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(ApiErrorCode.BAD_REQUEST, message, 400, details)
  }

  static unauthorized(message = 'Non autorisé'): ApiError {
    return new ApiError(ApiErrorCode.UNAUTHORIZED, message, 401)
  }

  static forbidden(message = 'Accès refusé'): ApiError {
    return new ApiError(ApiErrorCode.FORBIDDEN, message, 403)
  }

  static notFound(resource = 'Ressource'): ApiError {
    return new ApiError(ApiErrorCode.NOT_FOUND, `${resource} non trouvé(e)`, 404)
  }

  static conflict(message: string): ApiError {
    return new ApiError(ApiErrorCode.CONFLICT, message, 409)
  }

  static validation(errors: unknown): ApiError {
    return new ApiError(ApiErrorCode.VALIDATION_ERROR, 'Erreur de validation', 400, errors)
  }

  static internal(message = 'Erreur interne du serveur'): ApiError {
    return new ApiError(ApiErrorCode.INTERNAL_ERROR, message, 500)
  }
}

/**
 * API response interface
 */
interface ApiErrorResponse {
  success: false
  error: {
    code: ApiErrorCode
    message: string
    details?: unknown
  }
}

interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Create a success response
 */
export function successResponse<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status })
}

/**
 * Handle errors and return appropriate response
 */
export function handleApiError(error: unknown, context?: string): NextResponse<ApiErrorResponse> {
  // Log the error
  logger.error(context || 'API Error', error)

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }))
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ApiErrorCode.VALIDATION_ERROR,
          message: 'Erreur de validation',
          details: formattedErrors,
        },
      },
      { status: 400 },
    )
  }

  // Handle custom API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode },
    )
  }

  // Handle generic errors
  const message = error instanceof Error ? error.message : 'Erreur interne du serveur'
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ApiErrorCode.INTERNAL_ERROR,
        message: process.env.NODE_ENV === 'production' ? 'Erreur interne du serveur' : message,
      },
    },
    { status: 500 },
  )
}

/**
 * Wrapper for API route handlers with error handling
 */
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<T>>,
  context?: string,
): Promise<NextResponse<T | ApiErrorResponse>> {
  return handler().catch((error) => handleApiError(error, context))
}
