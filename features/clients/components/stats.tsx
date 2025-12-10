'use client'

import { Users, UserPlus, TrendingUp, Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useClientStats } from '../hooks/useClientStats'
import { StatsCard } from '@/components/shared/stats-card'

interface ClientsStatsProps {
  total?: number
  isLoading?: boolean
}

export function ClientsStats({ total, isLoading }: ClientsStatsProps) {
  const { stats: clientStats, isLoading: statsLoading } = useClientStats()

  const loading = isLoading || statsLoading

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((idx) => (
          <Skeleton key={idx} className="h-[120px]" />
        ))}
      </div>
    )
  }

  if (!clientStats) return null

  const growthValue = `${clientStats.growthPercentage > 0 ? '+' : ''}${clientStats.growthPercentage}%`

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total clients"
        value={clientStats.total}
        icon={Users}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-100"
      />
      <StatsCard
        title="Nouveaux ce mois"
        value={clientStats.newThisMonth}
        icon={UserPlus}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
      />
      <StatsCard
        title="Croissance"
        value={growthValue}
        icon={TrendingUp}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-100"
      />
      <StatsCard
        title="Actifs ce mois"
        value={clientStats.activeThisMonth}
        icon={Calendar}
        iconColor="text-orange-600"
        iconBgColor="bg-orange-100"
      />
    </div>
  )
}
