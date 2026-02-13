import { useStats } from '@/hooks/use-stats'
import { InvoiceStats } from '../types'

export function useInvoiceStats() {
  return useStats<InvoiceStats>('/api/invoices/stats', { revalidateOnReconnect: false })
}
