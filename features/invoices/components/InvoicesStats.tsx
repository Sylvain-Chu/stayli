'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { FileText, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'
import { useInvoiceStats } from '../hooks/useInvoiceStats'
import { StatsCard } from '@/components/shared/stats-card'

export function InvoicesStats() {
  const { stats, isLoading } = useInvoiceStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px]" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  const paymentRate = stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Factures"
        value={stats.total}
        subtitle={`${stats.totalAmount.toLocaleString('fr-FR')} € total`}
        icon={FileText}
      />
      <StatsCard
        title="Factures Payées"
        value={stats.paid}
        subtitle={`${stats.paidAmount.toLocaleString('fr-FR')} € encaissés`}
        icon={CheckCircle}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
      />
      <StatsCard
        title="En Retard"
        value={stats.overdue}
        subtitle={`${stats.overdueAmount.toLocaleString('fr-FR')} € en attente`}
        icon={AlertCircle}
        iconColor="text-red-600"
        iconBgColor="bg-red-100"
      />
      <StatsCard
        title="Taux de Paiement"
        value={`${paymentRate}%`}
        subtitle={`${stats.paid} sur ${stats.total} payées`}
        icon={TrendingUp}
      />
    </div>
  )
}
