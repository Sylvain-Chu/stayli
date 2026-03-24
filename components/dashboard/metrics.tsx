'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Euro, Calendar, FileWarning, DollarSign, TrendingDown } from 'lucide-react'
import { useDashboardStats } from '@/hooks/use-dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'

export function KPICards() {
  const { stats, isLoading, isError } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="border-border bg-card border">
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isError || !stats) {
    return (
      <div className="border-border bg-card rounded-xl border p-4">
        <p className="text-destructive text-sm">Erreur lors du chargement des statistiques</p>
      </div>
    )
  }

  const kpiData = [
    {
      label: "Taux d'occupation",
      value: `${stats.occupancyRate}%`,
      icon: TrendingUp,
      trend: `${stats.occupancyTrend >= 0 ? '+' : ''}${stats.occupancyTrend}%`,
      trendPositive: stats.occupancyTrend >= 0,
    },
    {
      label: 'Revenus mensuels',
      value: formatCurrency(stats.monthlyRevenue),
      icon: Euro,
      trend: `${stats.revenueTrend >= 0 ? '+' : ''}${stats.revenueTrend}%`,
      trendPositive: stats.revenueTrend >= 0,
    },
    {
      label: 'Réservations actives',
      value: stats.activeBookings.toString(),
      icon: Calendar,
      trend: `${stats.bookingsTrend >= 0 ? '+' : ''}${stats.bookingsTrend}`,
      trendPositive: stats.bookingsTrend >= 0,
    },
    {
      label: 'Dépenses du mois',
      value: formatCurrency(stats.monthlyExpenses),
      icon: DollarSign,
      trend: 'À surveiller',
      trendPositive: false,
    },
    {
      label: 'Factures en attente',
      value: stats.pendingInvoices.toString(),
      icon: FileWarning,
      trend: 'À traiter',
      trendPositive: false,
      isWarning: stats.pendingInvoices > 0,
    },
    {
      label: 'Bénéfice net',
      value: formatCurrency(stats.netRevenue),
      icon: TrendingDown,
      trend: stats.netRevenue >= 0 ? 'Positif' : 'Déficitaire',
      trendPositive: stats.netRevenue >= 0,
      isWarning: stats.netRevenue < 0,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {kpiData.map((kpi) => (
        <Card
          key={kpi.label}
          className="border-border bg-card border shadow-sm transition-shadow hover:shadow-md"
        >
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm font-medium">{kpi.label}</p>
              <div
                className={`rounded-lg p-2 ${kpi.isWarning ? 'bg-destructive/10' : 'bg-accent'}`}
              >
                <kpi.icon
                  className={`h-4 w-4 ${kpi.isWarning ? 'text-destructive' : 'text-primary'}`}
                />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <p
                className={`text-2xl font-bold tracking-tight ${kpi.isWarning ? 'text-destructive' : 'text-foreground'}`}
              >
                {kpi.value}
              </p>
              <span
                className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${
                  kpi.trendPositive
                    ? 'bg-primary/10 text-primary'
                    : kpi.isWarning
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {kpi.trend}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
