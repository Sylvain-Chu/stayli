import { AppLayout } from '@/components/layouts/app-shell'
import { KPICards } from '@/components/dashboard/metrics'
import { ActivityCard } from '@/components/dashboard/activity-list'
import { MiniCalendar } from '@/components/dashboard/calendar-mini'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { PropertyBreakdownTable } from '@/components/dashboard/property-breakdown-table'
import { ExpenseDonut } from '@/components/dashboard/expense-donut'

export default function DashboardPage() {
  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        <KPICards />

        <RevenueChart />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PropertyBreakdownTable />
          </div>
          <div className="lg:col-span-1">
            <ExpenseDonut />
          </div>
        </div>

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
