'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Building2, Home, Calendar, TrendingUp } from 'lucide-react'
import { usePropertyStats } from '../hooks/usePropertyStats'
import { StatsCard } from '@/components/shared/stats-card'

export function PropertiesStats() {
  const { stats, isLoading } = usePropertyStats()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px]" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatsCard title="Total Propriétés" value={stats.total} icon={Building2} />
      <StatsCard
        title="Avec Réservations"
        value={stats.withBookings}
        icon={Home}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
      />
      <StatsCard
        title="Disponibles ce Mois"
        value={stats.availableThisMonth}
        icon={Calendar}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-100"
      />
      <StatsCard
        title="Taux d'Occupation"
        value={`${stats.occupancyRate}%`}
        icon={TrendingUp}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-100"
      />
    </div>
  )
}
