import useSWR from 'swr'
import { Invoice, InvoiceFormData } from '../types'

export function useInvoices(searchQuery = '', page = 1, perPage = 10) {
  const params = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
  })
  if (searchQuery) params.set('search', searchQuery)

  const { data, error, mutate, isLoading } = useSWR(`/api/invoices?${params.toString()}`, {
    revalidateOnReconnect: false,
  })

  return {
    invoices: data?.invoices as Invoice[] | undefined,
    total: data?.total as number | undefined,
    totalPages: data?.totalPages as number | undefined,
    isLoading,
    isError: error ? 'Erreur lors du chargement des factures' : null,
    mutate,
  }
}

export function useInvoice(id: string) {
  const { data, error, mutate } = useSWR(id ? `/api/invoices/${id}` : null)

  return {
    invoice: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}

export async function createInvoice(invoiceData: {
  bookingId: string
  issueDate?: string
  dueDate: string
  amount: number
  status?: string
}) {
  const response = await fetch('/api/invoices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(invoiceData),
  })

  if (!response.ok) {
    throw new Error('Failed to create invoice')
  }

  return response.json()
}

export async function updateInvoice(
  id: string,
  invoiceData: Partial<{
    status: string
    issueDate: string
    dueDate: string
    amount: number
  }>,
) {
  const response = await fetch(`/api/invoices/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(invoiceData),
  })

  if (!response.ok) {
    throw new Error('Failed to update invoice')
  }

  return response.json()
}

export async function deleteInvoice(id: string) {
  const response = await fetch(`/api/invoices/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete invoice')
  }

  return response.json()
}
