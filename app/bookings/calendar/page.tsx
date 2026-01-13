import { AppLayout } from '@/components/layouts/app-shell'
import { FullCalendar } from '@/components/calendar/calendar'

export default function CalendarPage() {
  return (
    <AppLayout title="Calendrier">
      <div className="h-[calc(100vh-8rem)]">
        <FullCalendar />
      </div>
    </AppLayout>
  )
}
