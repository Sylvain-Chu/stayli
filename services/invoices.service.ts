/**
 * Invoices Service
 * Service layer for invoice operations
 */

import { apiGet, apiPost, apiPatch, apiDelete, buildUrl } from '@/lib/api-client'
import type { InvoiceStats } from '@/features/invoices/types'

// ============ Types ============

export interface InvoicesListParams {
  page?: number
  perPage?: number
  search?: string
}

export interface CreateInvoiceData {
  bookingId: string
  issueDate?: string
  dueDate: string
  amount: number
  status?: string
}

export type UpdateInvoiceData = Partial<{
  status: string
  issueDate: string
  dueDate: string
  amount: number
}>

// ============ Service Functions ============

export async function createInvoice<T = unknown>(data: CreateInvoiceData): Promise<T> {
  return apiPost<T, CreateInvoiceData>('/api/invoices', data)
}

export async function updateInvoice<T = unknown>(
  id: string,
  data: UpdateInvoiceData,
): Promise<T> {
  return apiPatch<T, UpdateInvoiceData>(`/api/invoices/${id}`, data)
}

export async function deleteInvoice(id: string): Promise<void> {
  return apiDelete(`/api/invoices/${id}`)
}

export async function deleteInvoices(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteInvoice(id)))
}
