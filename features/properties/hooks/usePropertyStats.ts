import { useStats } from '@/hooks/use-stats'
import { PropertyStats } from '../types'

export function usePropertyStats() {
  return useStats<PropertyStats>('/api/properties/stats', { revalidateOnReconnect: false })
}
