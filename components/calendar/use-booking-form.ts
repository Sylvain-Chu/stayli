import { useState, useRef } from 'react'
import type { Client } from '@/hooks/use-calendar'
import type { NewBookingState } from './types'
import { DEFAULT_NEW_BOOKING } from './constants'

interface UseBookingFormOptions {
  clients: Client[]
}

export function useBookingForm({ clients }: UseBookingFormOptions) {
  const [newBooking, setNewBooking] = useState<NewBookingState>({ ...DEFAULT_NEW_BOOKING })
  const [clientSearch, setClientSearch] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const priceTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const calculatePrices = async (startDate: Date, endDate: Date, options = {}) => {
    setIsCalculating(true)
    try {
      const currentOptions = {
        adults: newBooking.adults,
        children: newBooking.children,
        hasLinens: newBooking.hasLinens,
        hasCleaning: newBooking.hasCleaning,
        hasCancellationInsurance: newBooking.hasCancellationInsurance,
        ...options,
      }

      const response = await fetch('/api/bookings/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          ...currentOptions,
        }),
      })

      if (response.ok) {
        const prices = await response.json()
        setNewBooking((prev) => ({
          ...prev,
          ...currentOptions,
          basePrice: prices.basePrice,
          cleaningFee: prices.cleaningPrice,
          taxes: prices.touristTax,
          linensPrice: prices.linensPrice,
          cleaningPrice: prices.cleaningPrice,
          insuranceFee: prices.insuranceFee,
          discount: prices.discount,
        }))
      }
    } catch (error) {
      console.error('Price calculation error', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleOptionChange = (
    key: string,
    value: unknown,
    dates?: { startDate: Date; endDate: Date } | null,
  ) => {
    setNewBooking((prev) => {
      const updated = { ...prev, [key]: value }
      if (dates) {
        if (priceTimerRef.current) clearTimeout(priceTimerRef.current)
        priceTimerRef.current = setTimeout(() => {
          calculatePrices(dates.startDate, dates.endDate, { [key]: value })
        }, 300)
      }
      return updated
    })
  }

  const filteredClients = clients.filter(
    (client) =>
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearch.toLowerCase()),
  )

  const showCreateClientOption =
    clientSearch.trim() !== '' &&
    !filteredClients.some(
      (c) => `${c.firstName} ${c.lastName}`.toLowerCase() === clientSearch.toLowerCase(),
    )

  const handleSelectClient = (client: Client) => {
    setNewBooking((prev) => ({
      ...prev,
      clientId: client.id,
      clientName: `${client.firstName} ${client.lastName}`,
      clientEmail: client.email,
      clientPhone: client.phone || '',
      isNewClient: false,
    }))
    setClientSearch(`${client.firstName} ${client.lastName}`)
    setShowClientDropdown(false)
  }

  const handleCreateNewClient = () => {
    setNewBooking((prev) => ({
      ...prev,
      clientId: null,
      clientName: clientSearch,
      clientEmail: '',
      clientPhone: '',
      isNewClient: true,
    }))
    setShowClientDropdown(false)
  }

  const resetForm = () => {
    setNewBooking({ ...DEFAULT_NEW_BOOKING })
    setClientSearch('')
    setShowClientDropdown(false)
    setIsSubmitting(false)
  }

  return {
    newBooking,
    setNewBooking,
    clientSearch,
    setClientSearch,
    showClientDropdown,
    setShowClientDropdown,
    isSubmitting,
    setIsSubmitting,
    isCalculating,
    calculatePrices,
    handleOptionChange,
    filteredClients,
    showCreateClientOption,
    handleSelectClient,
    handleCreateNewClient,
    resetForm,
  }
}
