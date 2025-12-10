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
}

interface BookingFormContextType {
  formData: BookingFormData
  updateFormData: (data: Partial<BookingFormData>) => void
}

const BookingFormContext = createContext<BookingFormContextType | undefined>(undefined)

export function BookingFormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<BookingFormData>({
    propertyId: '',
    clientId: '',
    startDate: '',
    endDate: '',
    adults: 2,
    children: 0,
    hasLinens: false,
    hasCleaning: false,
    hasInsurance: false,
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
