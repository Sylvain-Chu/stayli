import { auth } from '@/app/api/auth/[...nextauth]/route'
import { ApiError } from './api-error'
import type { Session } from 'next-auth'

/**
 * Get the current authenticated session
 * Returns null if not authenticated
 */
export async function getSession(): Promise<Session | null> {
  try {
    const session = await auth()
    return session
  } catch {
    return null
  }
}

/**
 * Require authentication for API routes
 * Throws ApiError if not authenticated
 */
export async function requireAuth() {
  const session = await getSession()

  if (!session?.user) {
    throw ApiError.unauthorized()
  }

  return session
}

/**
 * Require admin role for API routes
 * Throws ApiError if not authenticated or not admin
 */
export async function requireAdmin() {
  const session = await requireAuth()

  if (session.user.role !== 'ADMIN') {
    throw ApiError.forbidden('Admin access required')
  }

  return session
}

/**
 * Check if current user has a specific role
 */
export async function hasRole(role: 'ADMIN' | 'USER') {
  const session = await getSession()
  return session?.user?.role === role
}
