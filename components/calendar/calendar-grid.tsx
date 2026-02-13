import { useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CalendarBooking, Property } from '@/hooks/use-calendar'
import type { DragState } from './types'
import { statusColors } from './constants'

interface CalendarGridProps {
  properties: Property[]
  days: number[]
  daysInMonth: number
  todayDay: number | null
  dragState: DragState | null
  bookings: CalendarBooking[]
  isWeekend: (day: number) => boolean
  isDayOccupied: (propertyId: string, day: number) => boolean
  showSelectionPreview: (propertyId: string, day: number) => boolean
  onMouseDown: (propertyId: string, day: number) => void
  onMouseEnter: (propertyId: string, day: number) => void
  onMouseUp: () => void
  onBookingClick: (booking: CalendarBooking) => void
}

export function CalendarGrid({
  properties,
  days,
  daysInMonth,
  todayDay,
  dragState,
  bookings,
  isWeekend,
  isDayOccupied,
  showSelectionPreview,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onBookingClick,
}: CalendarGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const getBookingsForProperty = (propertyId: string) => {
    return bookings.filter((b) => b.propertyId === propertyId)
  }

  return (
    <Card className="border-border flex flex-1 flex-col overflow-hidden border shadow-sm">
      <div
        ref={containerRef}
        className="flex-1 overflow-auto select-none"
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div className="flex h-full min-w-[1200px] flex-col">
          {/* Day headers */}
          <div className="border-border bg-muted/30 sticky top-0 z-10 flex border-b">
            <div className="border-border bg-muted/30 w-52 shrink-0 border-r p-3">
              <span className="text-muted-foreground text-sm font-medium">Propriétés</span>
            </div>
            <div className="flex flex-1">
              {days.map((day) => (
                <div
                  key={day}
                  className={cn(
                    'border-border bg-muted/30 min-w-9 flex-1 border-r p-2 text-center last:border-r-0',
                    isWeekend(day) && 'bg-muted/50',
                    todayDay === day && 'bg-primary/10',
                  )}
                >
                  <span
                    className={cn(
                      'text-xs font-medium',
                      todayDay === day
                        ? 'text-primary'
                        : isWeekend(day)
                          ? 'text-muted-foreground'
                          : 'text-foreground',
                    )}
                  >
                    {day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Property rows */}
          <div className="flex-1">
            {properties.map((property) => {
              const propertyBookings = getBookingsForProperty(property.id)

              return (
                <div
                  key={property.id}
                  className="border-border hover:bg-muted/20 flex border-b transition-colors last:border-b-0"
                >
                  <div className="border-border bg-card sticky left-0 z-10 w-52 shrink-0 border-r p-3">
                    <div>
                      <p className="text-foreground text-sm font-medium">{property.name}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {property.address || 'Sans adresse'}
                      </p>
                    </div>
                  </div>

                  <div className="relative flex flex-1">
                    {days.map((day) => {
                      const isOccupied = isDayOccupied(property.id, day)
                      const isSelecting = showSelectionPreview(property.id, day)

                      return (
                        <div
                          key={day}
                          className={cn(
                            'border-border h-14 min-w-9 flex-1 cursor-pointer border-r transition-colors last:border-r-0',
                            isWeekend(day) && 'bg-muted/30',
                            !isOccupied && !isSelecting && 'hover:bg-accent/50',
                            isSelecting && 'bg-primary/20',
                          )}
                          onMouseDown={() => onMouseDown(property.id, day)}
                          onMouseEnter={() => onMouseEnter(property.id, day)}
                        />
                      )
                    })}

                    {propertyBookings.map((booking) => {
                      const leftPercent = ((booking.startDay - 1) / daysInMonth) * 100
                      const widthPercent =
                        ((booking.endDay - booking.startDay + 1) / daysInMonth) * 100

                      return (
                        <div
                          key={booking.id}
                          className={cn(
                            'absolute top-2 flex h-10 cursor-pointer items-center rounded-lg px-2 text-xs font-medium text-white shadow-sm transition-all hover:opacity-90',
                            statusColors[booking.status],
                          )}
                          style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                          }}
                          onClick={() => onBookingClick(booking)}
                        >
                          <span className="truncate">{booking.clientName}</span>
                        </div>
                      )
                    })}

                    {dragState && dragState.propertyId === property.id && (
                      <div
                        className="border-primary bg-primary/10 absolute top-2 flex h-10 items-center justify-center rounded-lg border-2 border-dashed"
                        style={{
                          left: `${((Math.min(dragState.startDay, dragState.endDay) - 1) / daysInMonth) * 100}%`,
                          width: `${((Math.abs(dragState.endDay - dragState.startDay) + 1) / daysInMonth) * 100}%`,
                        }}
                      >
                        <Plus className="text-primary h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}
