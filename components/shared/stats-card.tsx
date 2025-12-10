import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string | ReactNode
  icon: LucideIcon
  iconColor?: string
  iconBgColor?: string
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10',
}: StatsCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-foreground text-2xl font-bold">{value}</p>
              {subtitle && <p className="text-muted-foreground text-xs">{subtitle}</p>}
            </div>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconBgColor} ${iconColor}`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
