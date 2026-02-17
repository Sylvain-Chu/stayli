/**
 * In-memory rate limiter for API routes
 *
 * Uses a sliding window approach per IP address.
 * Suitable for single-instance deployments (homelab).
 */

import { headers } from 'next/headers'
import { ApiError, ApiErrorCode } from './api-error'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      const now = Date.now()
      for (const [key, entry] of store) {
        if (entry.resetAt < now) {
          store.delete(key)
        }
      }
    },
    5 * 60 * 1000,
  )
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number
  /** Time window in seconds */
  windowSeconds: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

/**
 * Check rate limit for a given identifier (typically IP address)
 */
export function checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const key = identifier
  const entry = store.get(key)

  // No existing entry or window expired — allow and start new window
  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowSeconds * 1000
    store.set(key, { count: 1, resetAt })
    return { success: true, remaining: config.maxRequests - 1, resetAt }
  }

  // Within window — check count
  if (entry.count >= config.maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  // Increment and allow
  entry.count++
  return { success: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt }
}

/**
 * Pre-configured rate limit configs for different route types
 */
export const RATE_LIMITS = {
  /** Mutation endpoints (POST/PATCH/DELETE): 20 requests per 60 seconds */
  mutation: { maxRequests: 20, windowSeconds: 60 } satisfies RateLimitConfig,
  /** Auth endpoints: 10 requests per 60 seconds */
  auth: { maxRequests: 10, windowSeconds: 60 } satisfies RateLimitConfig,
  /** File upload: 5 requests per 60 seconds */
  upload: { maxRequests: 5, windowSeconds: 60 } satisfies RateLimitConfig,
} as const

/**
 * Apply rate limiting to the current request.
 * Reads IP from x-forwarded-for or x-real-ip headers.
 * Throws ApiError(429) if the limit is exceeded.
 *
 * @param routeKey - Unique route identifier for namespacing (e.g. "POST:/api/bookings")
 * @param config - Rate limit configuration (defaults to RATE_LIMITS.mutation)
 */
export async function applyRateLimit(
  routeKey: string,
  config: RateLimitConfig = RATE_LIMITS.mutation,
): Promise<void> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'

  const identifier = `${routeKey}:${ip}`
  const result = checkRateLimit(identifier, config)

  if (!result.success) {
    throw new ApiError(
      ApiErrorCode.BAD_REQUEST,
      'Trop de requêtes. Veuillez réessayer dans quelques instants.',
      429,
    )
  }
}
