import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Euro, Calendar, FileWarning } from 'lucide-react'

const kpiData = [
  {
    label: "Taux d'occupation",
    value: '85%',
    icon: TrendingUp,
    trend: '+5%',
    trendPositive: true,
  },
  {
    label: 'Revenus mensuels',
    value: '4 250 €',
    icon: Euro,
    trend: '+12%',
    trendPositive: true,
  },
  {
    label: 'Réservations actives',
    value: '12',
    icon: Calendar,
    trend: '+2',
    trendPositive: true,
  },
  {
    label: 'Factures en attente',
    value: '3',
    icon: FileWarning,
    trend: 'À traiter',
    trendPositive: false,
    isWarning: true,
  },
]

export function KPICards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((kpi) => (
        <Card
          key={kpi.label}
          className="border-border bg-card border shadow-sm transition-shadow hover:shadow-md"
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">{kpi.label}</p>
                <p
                  className={`text-2xl font-bold tracking-tight ${kpi.isWarning ? 'text-destructive' : 'text-foreground'}`}
                >
                  {kpi.value}
                </p>
              </div>
              <div
                className={`rounded-xl p-2.5 ${kpi.isWarning ? 'bg-destructive/10' : 'bg-accent'}`}
              >
                <kpi.icon
                  className={`h-5 w-5 ${kpi.isWarning ? 'text-destructive' : 'text-primary'}`}
                />
              </div>
            </div>
            <p
              className={`mt-3 text-xs font-medium ${kpi.trendPositive ? 'text-primary' : kpi.isWarning ? 'text-destructive' : 'text-muted-foreground'}`}
            >
              {kpi.trend}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
