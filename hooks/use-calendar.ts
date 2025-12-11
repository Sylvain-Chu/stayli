import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export interface CalendarBooking {
  id: string
  propertyId: string
  clientId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  startDay: number
  endDay: number
  startDate: string
  endDate: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'blocked'
  totalPrice: number
  basePrice: number
  cleaningFee: number
  taxes: number
  adults: number
  children: number
  specialRequests: string | null
  discount: number
  discountType: string | null
  hasLinens: boolean
  linensPrice: number
  hasCleaning: boolean
  cleaningPrice: number
  hasCancellationInsurance: boolean
  insuranceFee: number
  client: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
  }
  property: {
    id: string
    name: string
    address: string | null
  }
}

export interface Property {
  id: string
  name: string
  address: string | null
  description: string | null
}

export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
}

// Hook pour récupérer les bookings d'un mois pour le calendrier
export function useCalendarBookings(year: number, month: number) {
  const { data, error, isLoading, mutate } = useSWR<{ bookings: CalendarBooking[] }>(
    `/api/bookings/calendar?year=${year}&month=${month}`,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  )

  return {
    bookings: data?.bookings || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Hook pour récupérer toutes les propriétés
export function useProperties() {
  const { data, error, isLoading } = useSWR<{ properties: Property[] }>(
    '/api/properties',
    fetcher,
    {
      revalidateOnFocus: false,
    },
  )

  return {
    properties: data?.properties || [],
    isLoading,
    isError: error,
  }
}

// Hook pour récupérer tous les clients
export function useClients() {
  const { data, error, isLoading, mutate } = useSWR<{ clients: Client[] }>(
    '/api/clients',
    fetcher,
    {
      revalidateOnFocus: false,
    },
  )

  return {
    clients: data?.clients || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Fonction pour créer une nouvelle réservation
export async function createCalendarBooking(bookingData: {
  propertyId: string
  clientId: string
  startDate: string
  endDate: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'blocked'
  totalPrice: number
  basePrice: number
  cleaningFee?: number
  taxes?: number
  adults?: number
  children?: number
  specialRequests?: string
  discount?: number
  discountType?: string
  hasLinens?: boolean
  linensPrice?: number
  hasCleaning?: boolean
  cleaningPrice?: number
  hasCancellationInsurance?: boolean
  insuranceFee?: number
}) {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create booking')
  }

  return response.json()
}

// Fonction pour créer un nouveau client
export async function createClient(clientData: {
  firstName: string
  lastName: string
  email: string
  phone?: string
}) {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create client')
  }

  return response.json()
}
