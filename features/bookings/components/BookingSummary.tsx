'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useBookingForm } from '../context/BookingFormContext'

interface PriceBreakdown {
  basePrice: number
  linensPrice: number
  cleaningPrice: number
  discount: number
  insuranceFee: number
  touristTax: number
  totalPrice: number
}

export function BookingSummary() {
  const { formData } = useBookingForm()
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const calculateNights = () => {
    if (!formData.startDate || !formData.endDate) return 0
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const handleSubmit = async () => {
    if (!formData.propertyId || !formData.clientId || !priceBreakdown) {
      toast({
        title: 'Informations manquantes',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: formData.propertyId,
          clientId: formData.clientId,
          startDate: formData.startDate,
          endDate: formData.endDate,
          adults: formData.adults,
          children: formData.children,
          hasLinens: formData.hasLinens,
          linensPrice: priceBreakdown.linensPrice,
          hasCleaning: formData.hasCleaning,
          cleaningPrice: priceBreakdown.cleaningPrice,
          hasCancellationInsurance: formData.hasInsurance,
          insuranceFee: priceBreakdown.insuranceFee,
          basePrice: priceBreakdown.basePrice,
          discount: priceBreakdown.discount,
          taxes: priceBreakdown.touristTax,
          totalPrice: priceBreakdown.totalPrice,
          status: 'confirmed',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage =
          errorData?.error?.message || 'Erreur lors de la création de la réservation'
        throw new Error(errorMessage)
      }

      const payload = await response.json()
      const booking = payload?.data ?? payload

      toast({
        title: 'Réservation créée',
        description: 'La réservation a été créée avec succès',
      })

      if (booking?.id) {
        router.push(`/bookings/${booking.id}`)
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de créer la réservation',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!formData.startDate || !formData.endDate) {
      setPriceBreakdown(null)
      return
    }

    setLoading(true)
    fetch('/api/bookings/calculate-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: formData.startDate,
        endDate: formData.endDate,
        adults: formData.adults,
        children: formData.children,
        hasLinens: formData.hasLinens,
        hasCleaning: formData.hasCleaning,
        hasCancellationInsurance: formData.hasInsurance,
      }),
    })
      .then((res) => res.json())
      .then((payload) => {
        const data = payload?.data ?? payload
        // Normalize fields to avoid undefined values coming from API wrapper
        const normalized: PriceBreakdown = {
          basePrice: Number(data?.basePrice ?? 0),
          linensPrice: Number(data?.linensPrice ?? 0),
          cleaningPrice: Number(data?.cleaningPrice ?? 0),
          discount: Number(data?.discount ?? 0),
          insuranceFee: Number(data?.insuranceFee ?? 0),
          touristTax: Number(data?.touristTax ?? 0),
          totalPrice: Number(data?.totalPrice ?? 0),
        }

        setPriceBreakdown(normalized)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error calculating price:', err)
        setLoading(false)
      })
  }, [
    formData.startDate,
    formData.endDate,
    formData.adults,
    formData.children,
    formData.hasLinens,
    formData.hasCleaning,
    formData.hasInsurance,
  ])

  if (!priceBreakdown) {
    return (
      <div className="sticky top-24">
        <Card className="border-border bg-card border">
          <CardHeader>
            <CardTitle className="text-base">Résumé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center text-sm">
              Veuillez remplir les informations pour voir le résumé
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="sticky top-24">
      <Card className="border-border bg-card border">
        <CardHeader>
          <CardTitle className="text-base">Résumé</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-muted-foreground text-center text-sm">Calcul en cours...</p>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <h3 className="text-muted-foreground mb-2 text-xs font-medium uppercase">
                    Séjour
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">
                        Prix de base ({calculateNights()} nuit{calculateNights() > 1 ? 's' : ''})
                      </span>
                      <span className="text-foreground font-medium">
                        {priceBreakdown.basePrice.toFixed(2)} €
                      </span>
                    </div>
                    {priceBreakdown.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Remise</span>
                        <span className="font-medium text-green-600">
                          -{priceBreakdown.discount.toFixed(2)} €
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {(priceBreakdown.linensPrice > 0 || priceBreakdown.cleaningPrice > 0) && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-muted-foreground mb-2 text-xs font-medium uppercase">
                        Options
                      </h3>
                      <div className="space-y-2">
                        {priceBreakdown.linensPrice > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground">Linge de maison</span>
                            <span className="text-foreground font-medium">
                              {priceBreakdown.linensPrice.toFixed(2)} €
                            </span>
                          </div>
                        )}
                        {priceBreakdown.cleaningPrice > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground">Ménage de fin de séjour</span>
                            <span className="text-foreground font-medium">
                              {priceBreakdown.cleaningPrice.toFixed(2)} €
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {priceBreakdown.insuranceFee > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-muted-foreground mb-2 text-xs font-medium uppercase">
                        Assurance
                      </h3>
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">Assurance annulation</span>
                        <span className="text-foreground font-medium">
                          {priceBreakdown.insuranceFee.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {priceBreakdown.touristTax > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-muted-foreground mb-2 text-xs font-medium uppercase">
                        Taxes
                      </h3>
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">Taxe de séjour</span>
                        <span className="text-foreground font-medium">
                          {priceBreakdown.touristTax.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between">
                <span className="text-foreground font-semibold">Total</span>
                <span className="text-foreground text-lg font-bold">
                  {priceBreakdown.totalPrice.toFixed(2)} €
                </span>
              </div>

              <Button
                className="bg-primary hover:bg-primary/90 w-full"
                onClick={handleSubmit}
                disabled={submitting || !formData.propertyId || !formData.clientId}
              >
                {submitting ? 'Création en cours...' : 'Confirmer la réservation'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
