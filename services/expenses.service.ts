/**
 * Expenses Service
 * Service layer for expense operations
 */

import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api-client'
import type { Expense, ExpenseStats } from '@/types/entities'

// ============ Types ============

export interface ExpensesListParams {
  page?: number
  perPage?: number
  search?: string
  propertyId?: string
  category?: string
}

export interface CreateExpenseData {
  propertyId: string
  amount: number
  category: 'energy' | 'materials' | 'maintenance' | 'insurance'
  description?: string
  date: string
  supplier?: string
}

export type UpdateExpenseData = Partial<CreateExpenseData>

// ============ Service Functions ============

export async function getExpenses<T = unknown>(params: ExpensesListParams): Promise<T> {
  const searchParams = new URLSearchParams()
  if (params.page !== undefined) searchParams.append('page', String(params.page))
  if (params.perPage !== undefined) searchParams.append('perPage', String(params.perPage))
  if (params.search !== undefined) searchParams.append('search', params.search)
  if (params.propertyId !== undefined) searchParams.append('propertyId', params.propertyId)
  if (params.category !== undefined) searchParams.append('category', params.category)

  const query = searchParams.toString()
  const url = query ? `/api/expenses?${query}` : '/api/expenses'
  return apiGet<T>(url)
}

export async function getExpense<T = unknown>(id: string): Promise<T> {
  return apiGet<T>(`/api/expenses/${id}`)
}

export async function createExpense<T = unknown>(data: CreateExpenseData): Promise<T> {
  return apiPost<T, CreateExpenseData>('/api/expenses', data)
}

export async function updateExpense<T = unknown>(id: string, data: UpdateExpenseData): Promise<T> {
  return apiPatch<T, UpdateExpenseData>(`/api/expenses/${id}`, data)
}

export async function deleteExpense(id: string): Promise<void> {
  return apiDelete(`/api/expenses/${id}`)
}

export async function deleteExpenses(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteExpense(id)))
}

export async function getExpenseStats<T = ExpenseStats>(propertyId?: string): Promise<T> {
  const url = propertyId ? `/api/expenses/stats?propertyId=${propertyId}` : '/api/expenses/stats'
  return apiGet<T>(url)
}
