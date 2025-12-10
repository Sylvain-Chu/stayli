'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

// Simulated occupied days (would come from API)
const occupiedDays = [5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17, 20, 21, 22, 23]

export function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 9)) // December 2025
  const today = 9 // Current day

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  // Get the day of week (0 = Sunday, 1 = Monday, etc.) and adjust for Monday start
  let startDay = firstDayOfMonth.getDay()
  startDay = startDay === 0 ? 6 : startDay - 1

  const daysInMonth = lastDayOfMonth.getDate()

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const days = []

  // Empty cells for days before the first day of month
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-9 w-9" />)
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === today && month === 11 && year === 2025
    const isOccupied = occupiedDays.includes(day)

    days.push(
      <div
        key={day}
        className={cn(
          'relative flex h-9 w-9 flex-col items-center justify-center rounded-lg text-sm',
          isToday && 'ring-primary ring-2 ring-offset-2',
          !isToday && 'hover:bg-muted cursor-pointer',
        )}
      >
        <span className={cn(isToday && 'text-primary font-semibold')}>{day}</span>
        {isOccupied && <span className="bg-primary absolute bottom-1 h-1 w-1 rounded-full" />}
      </div>,
    )
  }

  return (
    <Card className="border-border bg-card border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Calendrier</CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[120px] text-center text-sm font-medium">
              {MONTHS[month]} {year}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-muted-foreground flex h-9 w-9 items-center justify-center text-xs font-medium"
            >
              {day}
            </div>
          ))}
          {days}
        </div>
      </CardContent>
    </Card>
  )
}
