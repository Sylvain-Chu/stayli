import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MONTHS } from './constants'

interface CalendarHeaderProps {
  displayMonth: number
  displayYear: number
  onPrevMonth: () => void
  onNextMonth: () => void
}

export function CalendarHeader({
  displayMonth,
  displayYear,
  onPrevMonth,
  onNextMonth,
}: CalendarHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          aria-label="Mois précédent"
          onClick={onPrevMonth}
          className="rounded-xl bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="min-w-[180px] text-center text-lg font-semibold">
          {MONTHS[displayMonth]} {displayYear}
        </h2>
        <Button
          variant="outline"
          size="icon"
          aria-label="Mois suivant"
          onClick={onNextMonth}
          className="rounded-xl bg-transparent"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#2d5a47]" />
          <span className="text-muted-foreground">Confirmé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#d4a853]" />
          <span className="text-muted-foreground">En attente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#9ca3af]" />
          <span className="text-muted-foreground">Bloqué</span>
        </div>
      </div>
    </div>
  )
}
