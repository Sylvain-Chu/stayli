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

