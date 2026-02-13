import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { CalendarBooking } from '@/hooks/use-calendar'

interface BookingDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: CalendarBooking | null
  onViewBooking: (id: string) => void
}

export function BookingDetailsDialog({
  open,
  onOpenChange,
  booking,
  onViewBooking,
}: BookingDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Détails de la réservation</DialogTitle>
        </DialogHeader>

        {booking && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-medium uppercase">
                  Client
                </Label>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium">
                    {booking.client?.firstName.charAt(0)}
                    {booking.client?.lastName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">
                      {booking.client?.firstName} {booking.client?.lastName}
                    </p>
                    <p className="text-muted-foreground text-xs">{booking.client?.email}</p>
                    {booking.client?.phone && (
                      <p className="text-muted-foreground text-xs">{booking.client.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-medium uppercase">
                  Propriété
                </Label>
                <div>
                  <p className="font-medium">{booking.property?.name}</p>
                  {booking.property?.address && (
                    <p className="text-muted-foreground text-xs">{booking.property.address}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs font-medium uppercase">
                  Arrivée
                </Label>
                <p className="font-medium">
                  {new Date(booking.startDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs font-medium uppercase">
                  Départ
                </Label>
                <p className="font-medium">
                  {new Date(booking.endDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs font-medium uppercase">
                  Statut
                </Label>
                <div>
                  {booking.status === 'confirmed' && (
                    <span className="bg-primary/10 text-primary inline-block rounded-full px-2.5 py-1 text-xs font-medium">
                      Confirmé
                    </span>
                  )}
                  {booking.status === 'pending' && (
                    <span className="inline-block rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
                      En attente
                    </span>
                  )}
                  {booking.status === 'blocked' && (
                    <span className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800">
                      Bloqué
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-medium uppercase">
                Invités
              </Label>
              <p className="text-sm">
                {booking.adults} adulte{booking.adults > 1 ? 's' : ''}
                {booking.children > 0 &&
                  `, ${booking.children} enfant${booking.children > 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-muted-foreground text-xs font-medium uppercase">
                Tarification
              </Label>
              <div className="bg-muted/30 space-y-2 rounded-xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prix de base</span>
                  <span className="font-medium">{booking.basePrice.toFixed(2)} €</span>
                </div>
                {booking.cleaningFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frais de ménage</span>
                    <span className="font-medium">{booking.cleaningFee.toFixed(2)} €</span>
                  </div>
                )}
                {booking.taxes > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxes</span>
                    <span className="font-medium">{booking.taxes.toFixed(2)} €</span>
                  </div>
                )}
                {booking.hasLinens && booking.linensPrice > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Linge de maison</span>
                    <span className="font-medium">{booking.linensPrice.toFixed(2)} €</span>
                  </div>
                )}
                {booking.hasCleaning && booking.cleaningPrice > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ménage en cours de séjour</span>
                    <span className="font-medium">{booking.cleaningPrice.toFixed(2)} €</span>
                  </div>
                )}
                {booking.hasCancellationInsurance && booking.insuranceFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Assurance annulation</span>
                    <span className="font-medium">{booking.insuranceFee.toFixed(2)} €</span>
                  </div>
                )}
                {booking.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>
                      Réduction{' '}
                      {booking.discountType ? `(${booking.discountType})` : ''}
                    </span>
                    <span className="font-medium">-{booking.discount.toFixed(2)} €</span>
                  </div>
                )}
                <div className="border-border border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-bold">
                      {booking.totalPrice.toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {booking.specialRequests && (
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-medium uppercase">
                  Demandes spéciales
                </Label>
                <p className="bg-muted/30 rounded-xl p-3 text-sm">
                  {booking.specialRequests}
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl bg-transparent"
          >
            Fermer
          </Button>
          <Button
            onClick={() => {
              if (booking) {
                onViewBooking(booking.id)
              }
            }}
            className="rounded-xl"
          >
            Voir la réservation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
