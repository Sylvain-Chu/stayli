import { useStats } from '@/hooks/use-stats'
import type { ClientStats } from '@/features/clients/types'

export function useClientStats() {
  return useStats<ClientStats>('/api/clients/stats')
}
