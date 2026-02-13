import useSWR from 'swr'
import { InvoiceStats } from '../types'

export function useInvoiceStats() {
  const { data, error, isLoading, mutate } = useSWR<InvoiceStats>('/api/invoices/stats', {
    revalidateOnReconnect: false,
  })

  return {
    stats: data,
    isLoading,
    isError: error,
    mutate,
  }
}
