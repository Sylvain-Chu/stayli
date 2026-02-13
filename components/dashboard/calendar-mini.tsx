'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react' // Ajout icone loader
import { cn } from '@/lib/utils'
import { useCalendarData, useCalendarBookings } from '@/hooks/use-dashboard'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Utilitaire pour formater les dates (évite les tableaux en dur)
const formatMonth = (date: Date) =>
  new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date)
const WEEKDAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(2024, 0, i + 1) // Un Lundi connu (Jan 1 2024 est un Lundi)
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(d).replace('.', '')
})

export function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  // On stocke le jour sélectionné (clic) plutôt que survolé pour mobile friendly + performance
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Hooks
  const { occupiedDays = [] } = useCalendarData(year, month + 1)
  // On ne fetch que si un jour est sélectionné/survolé
  const { bookings, isLoading: bookingsLoading } = useCalendarBookings(year, month + 1, selectedDay)

  // Calculs de dates
  const { daysInMonth, startOffset } = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    let startDay = firstDay.getDay()
    // Ajustement pour commencer Lundi (0 = Dimanche -> devient 6)
    const offset = startDay === 0 ? 6 : startDay - 1
    return { daysInMonth: lastDay.getDate(), startOffset: offset }
  }, [year, month])

  const today = new Date()
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year
  const todayDate = today.getDate()

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  // Interaction : On ouvre au clic ou au hover selon la préférence (ici mixte)
  const handleInteraction = (day: number, open: boolean) => {
    if (open) setSelectedDay(day)
    else setSelectedDay(null)
  }

  return (
    <Card className="border-border bg-card border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium capitalize">
            {formatMonth(currentDate)}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              aria-label="Mois précédent"
              className="h-7 w-7"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Mois suivant"
              className="h-7 w-7"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2 grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-muted-foreground text-[0.8rem] font-medium capitalize">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Cases vides du début de mois */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="h-9 w-9" />
          ))}

          {/* Jours du mois */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const isToday = isCurrentMonth && day === todayDate
            const isOccupied = occupiedDays.includes(day)

            // Cellule de base
            const DayCell = (
              <div
                className={cn(
                  'relative flex h-9 w-9 flex-col items-center justify-center rounded-md text-sm transition-all',
                  isOccupied
                    ? 'hover:bg-primary/10 cursor-pointer font-medium'
                    : 'text-foreground/80',
                  isToday && 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md',
                  !isToday && !isOccupied && 'hover:bg-accent cursor-default',
                )}
              >
                {day}
                {isOccupied && !isToday && (
                  <span className="bg-primary absolute bottom-1.5 h-1 w-1 rounded-full" />
                )}
              </div>
            )

            if (isOccupied) {
              return (
                <Popover key={day} onOpenChange={(open) => handleInteraction(day, open)}>
                  <PopoverTrigger asChild>{DayCell}</PopoverTrigger>
                  <PopoverContent className="w-64 p-3 text-xs" align="center">
                    {bookingsLoading ? (
                      <div className="text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" /> Chargement...
                      </div>
                    ) : bookings.length > 0 ? (
                      <div className="space-y-2">
                        <div className="mb-1 border-b pb-1 font-semibold">
                          {bookings.length} réservation(s) le {day}
                        </div>
                        {bookings.map((b: any) => (
                          <div key={b.id} className="grid gap-0.5">
                            <span className="text-foreground font-medium">{b.clientName}</span>
                            <span className="text-muted-foreground">{b.propertyName}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Aucune info disponible</span>
                    )}
                  </PopoverContent>
                </Popover>
              )
            }

            return <div key={day}>{DayCell}</div>
          })}
        </div>
      </CardContent>
    </Card>
  )
}
