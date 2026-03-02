'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface BookingFormData {
  propertyId: string
  clientId: string
  startDate: string
  endDate: string
  adults: number
  children: number
  hasLinens: boolean
  hasCleaning: boolean
  hasInsurance: boolean
  customBasePrice: string
  status: string
  specialRequests: string
}

interface BookingFormContextType {
  formData: BookingFormData
  updateFormData: (data: Partial<BookingFormData>) => void
}

const BookingFormContext = createContext<BookingFormContextType | undefined>(undefined)

interface BookingFormProviderProps {
  children: ReactNode
  initialValues?: {
    propertyId?: string
    startDate?: string
    endDate?: string
  }
}

export function BookingFormProvider({ children, initialValues }: BookingFormProviderProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    propertyId: initialValues?.propertyId ?? '',
    clientId: '',
    startDate: initialValues?.startDate ?? '',
    endDate: initialValues?.endDate ?? '',
    adults: 2,
    children: 0,
    hasLinens: false,
    hasCleaning: false,
    hasInsurance: false,
    customBasePrice: '',
    status: 'confirmed',
    specialRequests: '',
  })

  const updateFormData = (data: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  return (
    <BookingFormContext.Provider value={{ formData, updateFormData }}>
      {children}
    </BookingFormContext.Provider>
  )
}

export function useBookingForm() {
  const context = useContext(BookingFormContext)
  if (!context) {
    throw new Error('useBookingForm must be used within BookingFormProvider')
  }
  return context
}
