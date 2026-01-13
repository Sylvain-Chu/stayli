import useSWR from 'swr'
import { InvoiceStats } from '../types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useInvoiceStats() {
  const { data, error, isLoading, mutate } = useSWR<InvoiceStats>('/api/invoices/stats', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  return {
    stats: data,
    isLoading,
    isError: error,
    mutate,
  }
}
