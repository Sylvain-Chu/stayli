import useSWR from 'swr'

export interface DashboardStats {
  occupancyRate: number
  occupancyTrend: number
  monthlyRevenue: number
  revenueTrend: number
  activeBookings: number
  bookingsTrend: number
  pendingInvoices: number
}

export interface Activity {
  id: string
  client: {
    name: string
    initials: string
  }
  property: string
  dates: string
}

export function useDashboardStats() {
  const { data, error, isLoading } = useSWR<DashboardStats>('/api/dashboard/stats', {
    refreshInterval: 60000, // Refresh every minute
  })

  return {
    stats: data,
    isLoading,
    isError: error,
  }
}

export function useActivities(type: 'current' | 'arrivals' | 'departures' = 'current') {
  const { data, error, isLoading } = useSWR<{ activities: Activity[] }>(
    `/api/dashboard/activities?type=${type}`,
    {
      refreshInterval: 60000,
    },
  )

  return {
    activities: data?.activities || [],
    isLoading,
    isError: error,
  }
}

export interface CalendarBooking {
  id: string
  clientName: string
  propertyName: string
  startDate: string
  endDate: string
  status: string
}

export function useCalendarData(year: number, month: number) {
  const { data, error, isLoading } = useSWR<{ occupiedDays: number[] }>(
    `/api/dashboard/calendar?year=${year}&month=${month}`,
    {
      refreshInterval: 60000,
    },
  )

  return {
    occupiedDays: data?.occupiedDays || [],
    isLoading,
    isError: error,
  }
}

export function useCalendarBookings(year: number, month: number, day: number | null) {
  const { data, error, isLoading } = useSWR<{ bookings: CalendarBooking[] }>(
    day ? `/api/dashboard/calendar/bookings?year=${year}&month=${month}&day=${day}` : null,
  )

  return {
    bookings: data?.bookings || [],
    isLoading,
    isError: error,
  }
}
