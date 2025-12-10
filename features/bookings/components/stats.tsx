'use client'

import { Calendar, CheckCircle2, Clock } from 'lucide-react'
import { useBookingStats } from '../hooks/useBookingStats'
import { Skeleton } from '@/components/ui/skeleton'
import { StatsCard } from '@/components/shared/stats-card'

export function BookingsStats() {
  const { stats, isLoading } = useBookingStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[120px]" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  const confirmationRate = stats.total > 0 ? (stats.confirmed / stats.total) * 100 : 0

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard title="Total réservations" value={stats.total} icon={Calendar} />
      <StatsCard
        title="Confirmées"
        value={stats.confirmed}
        subtitle={`${confirmationRate.toFixed(0)}%`}
        icon={CheckCircle2}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
      />
      <StatsCard
        title="En attente"
        value={stats.pending}
        icon={Clock}
        iconColor="text-orange-600"
        iconBgColor="bg-orange-100"
      />
      <StatsCard
        title="Revenus estimés"
        value={`${stats.totalRevenue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€`}
        subtitle={`Moyenne: ${stats.averagePrice.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€`}
        icon={Calendar}
      />
    </div>
  )
}
