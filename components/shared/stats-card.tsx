import { Card, CardContent } from '@/components/ui/card'
import { type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Props for StatsCard
 */
export interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string | ReactNode
  icon: LucideIcon
  iconColor?: string
  iconBgColor?: string
  trend?: {
    value: string | number
    isPositive: boolean
  }
  className?: string
  isWarning?: boolean
}

/**
 * StatsCard Component
 * Displays a statistical card with title, value, icon, and optional trend indicator
 */
export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10',
  trend,
  className,
  isWarning = false,
}: StatsCardProps) {
  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground truncate text-sm font-medium">{title}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <p
                className={cn(
                  'text-xl font-bold',
                  isWarning ? 'text-destructive' : 'text-foreground',
                )}
              >
                {value}
              </p>
              {subtitle && <p className="text-muted-foreground text-xs">{subtitle}</p>}
            </div>
            {trend && (
              <p
                className={cn(
                  'mt-1 text-xs font-medium',
                  trend.isPositive ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {trend.value}
              </p>
            )}
          </div>
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              isWarning ? 'bg-destructive/10' : iconBgColor,
            )}
          >
            <Icon className={cn('h-5 w-5', isWarning ? 'text-destructive' : iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
