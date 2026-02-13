'use client'

import { Bell, Calendar, Clock, FileWarning, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import useSWR from 'swr'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Alert {
  id: string
  type: 'checkin' | 'checkout' | 'overdue_invoice' | 'pending_booking'
  title: string
  description: string
  date: string
  severity: 'info' | 'warning' | 'danger'
  link: string
}

interface NotificationsResponse {
  alerts: Alert[]
  count: number
}

const ICON_MAP = {
  checkin: Calendar,
  checkout: Clock,
  overdue_invoice: FileWarning,
  pending_booking: AlertCircle,
}

const SEVERITY_STYLES = {
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  warning: 'bg-orange-50 text-orange-700 border-orange-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
}

const DOT_STYLES = {
  info: 'bg-blue-500',
  warning: 'bg-orange-500',
  danger: 'bg-red-500',
}

export function NotificationsPopover() {
  const { data } = useSWR<NotificationsResponse>('/api/notifications', {
    refreshInterval: 60000,
  })

  const alerts = data?.alerts ?? []
  const count = data?.count ?? 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="text-muted-foreground h-5 w-5" />
          {count > 0 && (
            <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-border border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {count > 0 && (
            <p className="text-muted-foreground text-xs">
              {count} alerte{count > 1 ? 's' : ''} active{count > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-8 text-sm">
              <Bell className="h-8 w-8 opacity-30" />
              Aucune alerte
            </div>
          ) : (
            <div className="divide-border divide-y">
              {alerts.map((alert) => {
                const Icon = ICON_MAP[alert.type]
                return (
                  <Link
                    key={alert.id}
                    href={alert.link}
                    className="hover:bg-muted/50 flex items-start gap-3 px-4 py-3 transition-colors"
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        SEVERITY_STYLES[alert.severity],
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-foreground truncate text-sm font-medium">
                          {alert.title}
                        </p>
                        <span
                          className={cn(
                            'h-1.5 w-1.5 shrink-0 rounded-full',
                            DOT_STYLES[alert.severity],
                          )}
                        />
                      </div>
                      <p className="text-muted-foreground truncate text-xs">{alert.description}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
