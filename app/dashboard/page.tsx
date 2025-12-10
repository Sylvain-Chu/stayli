import { AppLayout } from '@/components/layouts/app-shell'
import { KPICards } from '@/components/dashboard/metrics'
import { ActivityCard } from '@/components/dashboard/activity-list'
import { MiniCalendar } from '@/components/dashboard/calendar-mini'

export default function DashboardPage() {
  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* KPI Cards */}
        <KPICards />

        {/* Main Grid - 2/3 Left, 1/3 Right */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ActivityCard />
          </div>
          <div className="lg:col-span-1">
            <MiniCalendar />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
