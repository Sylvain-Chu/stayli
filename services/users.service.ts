/**
 * Users Service
 * Service layer for user operations
 */

import { apiGet, apiPost, apiPatch, apiDelete, buildUrl } from '@/lib/api-client'
import type { User } from '@/types/entities'
import type { CreateUserData, UpdateUserData, InviteUserData } from '@/lib/validations/user'

// ============ Types ============

export interface UsersListParams {
  page?: number
  perPage?: number
  q?: string
}

export interface UsersListResponse {
  users: User[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

// ============ Service Functions ============

/**
 * Fetches the list of users with filters and pagination
 */
export async function getUsers(params: UsersListParams = {}): Promise<UsersListResponse> {
  const url = buildUrl('/api/users', {
    page: params.page,
    perPage: params.perPage,
    q: params.q,
  })

  return apiGet<UsersListResponse>(url)
}

/**
 * Fetches a user by its ID
 */
export async function getUser(id: string): Promise<User> {
  return apiGet<User>(`/api/users/${id}`)
}

/**
 * Creates a new user
 */
export async function createUser(data: CreateUserData): Promise<User> {
  return apiPost<User, CreateUserData>('/api/users', data)
}

/**
 * Updates a user
 */
export async function updateUser(id: string, data: UpdateUserData): Promise<User> {
  return apiPatch<User, UpdateUserData>(`/api/users/${id}`, data)
}

/**
 * Deletes a user
 */
export async function deleteUser(id: string): Promise<void> {
  return apiDelete(`/api/users/${id}`)
}

/**
 * Invites a user (generates an invitation token)
 */
export async function inviteUser(data: InviteUserData): Promise<{ token: string; inviteUrl: string }> {
  return apiPost<{ token: string; inviteUrl: string }, InviteUserData>('/api/users/invite', data)
}
