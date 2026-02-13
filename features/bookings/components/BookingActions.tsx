'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import type { BookingStatus } from '@/types/entities'

const STATUS_OPTIONS: { value: BookingStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'En attente', color: 'bg-orange-100 text-orange-700' },
  { value: 'confirmed', label: 'Confirmée', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Annulée', color: 'bg-red-100 text-red-700' },
  { value: 'blocked', label: 'Bloquée', color: 'bg-gray-100 text-gray-700' },
]

interface BookingActionsProps {
  bookingId: string
  currentStatus: BookingStatus
}

export function BookingStatusSelect({ bookingId, currentStatus }: BookingActionsProps) {
  const [status, setStatus] = useState<BookingStatus>(currentStatus)
  const [isPending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<BookingStatus | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleStatusChange = (newStatus: string) => {
    const typedStatus = newStatus as BookingStatus
    if (typedStatus === status) return

    // Require confirmation for cancellation
    if (typedStatus === 'cancelled') {
      setPendingStatus(typedStatus)
      setConfirmOpen(true)
      return
    }

    applyStatus(typedStatus)
  }

  const applyStatus = (newStatus: BookingStatus) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour')
        }

        setStatus(newStatus)
        router.refresh()

        const label = STATUS_OPTIONS.find((o) => o.value === newStatus)?.label ?? newStatus
        toast({
          title: 'Statut mis à jour',
          description: `La réservation est maintenant "${label}".`,
        })
      } catch {
        toast({
          title: 'Erreur',
          description: 'Impossible de modifier le statut.',
          variant: 'destructive',
        })
      }
    })
  }

  const handleCancelConfirm = () => {
    if (pendingStatus) {
      applyStatus(pendingStatus)
      setPendingStatus(null)
    }
  }

  const currentOption = STATUS_OPTIONS.find((o) => o.value === status)

  return (
    <>
      <Select value={status} onValueChange={handleStatusChange} disabled={isPending}>
        <SelectTrigger
          className={`w-[160px] font-medium ${currentOption?.color ?? ''}`}
          aria-label="Changer le statut de la réservation"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <span className={`inline-flex items-center gap-2`}>
                <span
                  className={`h-2 w-2 rounded-full ${opt.value === 'pending' ? 'bg-orange-500' : opt.value === 'confirmed' ? 'bg-green-500' : opt.value === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'}`}
                />
                {opt.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Annuler la réservation"
        description="Êtes-vous sûr de vouloir annuler cette réservation ? Cette action changera le statut en « Annulée »."
        onConfirm={handleCancelConfirm}
        confirmText="Annuler la réservation"
        variant="destructive"
      />
    </>
  )
}

interface CancelBookingButtonProps {
  bookingId: string
  currentStatus: BookingStatus
}

export function CancelBookingButton({ bookingId, currentStatus }: CancelBookingButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  if (currentStatus === 'cancelled') return null

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled' }),
        })

        if (!response.ok) throw new Error('Erreur')

        router.refresh()
        toast({
          title: 'Réservation annulée',
          description: 'La réservation a été annulée avec succès.',
        })
      } catch {
        toast({
          title: 'Erreur',
          description: "Impossible d'annuler la réservation.",
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <>
      <Button
        variant="ghost"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => setConfirmOpen(true)}
        disabled={isPending}
      >
        Annuler
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Annuler la réservation"
        description="Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est définitive."
        onConfirm={handleConfirm}
        confirmText="Confirmer l'annulation"
        variant="destructive"
      />
    </>
  )
}
