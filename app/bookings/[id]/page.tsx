import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppLayout } from '@/components/layouts/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronLeft, Calendar, Mail, Phone, MapPin, Clock, Users } from 'lucide-react'
import { prisma } from '@/lib/prisma'
// import { GenerateInvoiceButton } from '@/features/bookings/components/GenerateInvoiceButton'
import { DownloadContractButton } from '@/features/bookings/components/DownloadContractButton'

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      client: true,
      property: true,
      invoice: true,
    },
  })

  if (!booking) {
    notFound()
  }

  const settings = await prisma.settings.findFirst()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  const calculateNights = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      confirmed: { label: 'Confirmée', color: 'bg-green-100 text-green-700' },
      pending: { label: 'En attente', color: 'bg-orange-100 text-orange-700' },
      cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-700' },
      blocked: { label: 'Bloquée', color: 'bg-gray-100 text-gray-700' },
    }
    const config = statusConfig[status] || statusConfig.confirmed
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    )
  }

  const nights = calculateNights(booking.startDate.toISOString(), booking.endDate.toISOString())
  const initials = booking.client
    ? `${booking.client.firstName.charAt(0)}${booking.client.lastName.charAt(0)}`.toUpperCase()
    : 'NA'

  const priceLines = [
    {
      label: `${nights} nuitée${nights > 1 ? 's' : ''} x ${(booking.basePrice / nights).toFixed(0)} €`,
      amount: booking.basePrice,
    },
  ]

  if (booking.hasLinens && booking.linensPrice > 0) {
    priceLines.push({ label: 'Linge de maison', amount: booking.linensPrice })
  }

  if (booking.hasCleaning && booking.cleaningPrice > 0) {
    priceLines.push({ label: 'Ménage fin de séjour', amount: booking.cleaningPrice })
  }

  if (booking.cleaningFee > 0) {
    priceLines.push({ label: 'Frais de ménage', amount: booking.cleaningFee })
  }

  if (booking.hasCancellationInsurance && booking.insuranceFee > 0) {
    priceLines.push({ label: 'Assurance annulation', amount: booking.insuranceFee })
  }

  if (booking.taxes > 0) {
    priceLines.push({ label: 'Taxe de séjour', amount: booking.taxes })
  }

  if (booking.discount > 0) {
    priceLines.push({
      label: `Remise${booking.discountType === 'percent' ? ` (${booking.discount}%)` : ''}`,
      amount: -booking.discount,
    })
  }

  return (
    <AppLayout title={`Réservation`}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/bookings"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Retour
            </Link>
            <h2 className="text-foreground text-xl font-semibold">Réservation #{id.slice(0, 8)}</h2>
            {getStatusBadge(booking.status)}
          </div>
          <div className="flex items-center gap-2">
            {/* <GenerateInvoiceButton bookingId={id} hasInvoice={!!booking.invoice} /> */}

            {settings && booking.client && booking.property && (
              <DownloadContractButton
                booking={booking}
                property={booking.property}
                client={booking.client}
                settings={settings}
              />
            )}

            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Annuler
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="border-border bg-card border">
            <CardHeader>
              <CardTitle className="text-base">Séjour</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-foreground text-lg font-semibold">
                  {booking.property?.name || 'Propriété non trouvée'}
                </p>
                {booking.property?.address && (
                  <p className="text-muted-foreground flex items-start gap-1 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    {booking.property.address}
                  </p>
                )}
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground">Arrivée:</span>
                  <span className="text-foreground">
                    {formatDate(booking.startDate.toISOString())}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground">Départ:</span>
                  <span className="text-foreground">
                    {formatDate(booking.endDate.toISOString())}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground">Durée:</span>
                  <span className="text-foreground">
                    {nights} nuit{nights > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground">Voyageurs:</span>
                  <span className="text-foreground">
                    {booking.adults} adulte{booking.adults > 1 ? 's' : ''}
                    {booking.children > 0 &&
                      `, ${booking.children} enfant${booking.children > 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>
              {booking.specialRequests && (
                <div className="border-border border-t pt-3">
                  <p className="text-muted-foreground mb-1 text-xs font-medium">
                    Demandes spéciales
                  </p>
                  <p className="text-foreground text-sm">{booking.specialRequests}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card border">
            <CardHeader>
              <CardTitle className="text-base">Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {booking.client ? (
                <>
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="mb-3 h-16 w-16">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-foreground font-medium">
                      {booking.client.firstName} {booking.client.lastName}
                    </p>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span className="text-foreground break-all">{booking.client.email}</span>
                    </div>
                    {booking.client.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="text-muted-foreground h-4 w-4 shrink-0" />
                        <span className="text-foreground">{booking.client.phone}</span>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" className="mt-2 w-full bg-transparent" asChild>
                    <a href={`mailto:${booking.client.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Envoyer Email
                    </a>
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">Client non trouvé</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card border">
            <CardHeader>
              <CardTitle className="text-base">Finances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {priceLines.map((line, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{line.label}</span>
                    <span className={line.amount < 0 ? 'text-green-600' : 'text-foreground'}>
                      {line.amount.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-border border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-foreground font-semibold">Total</span>
                  <span className="text-foreground text-lg font-bold">
                    {booking.totalPrice.toLocaleString('fr-FR')} €
                  </span>
                </div>
              </div>
              {booking.invoice && (
                <div className="border-border border-t pt-3">
                  <p className="text-muted-foreground mb-2 text-sm font-medium">Facture liée</p>
                  <Link
                    href={`/invoices/${booking.invoice.id}`}
                    className="hover:bg-muted flex items-center justify-between rounded-lg p-2 text-sm transition-colors"
                  >
                    <span className="text-primary font-medium">
                      {booking.invoice.invoiceNumber}
                    </span>
                    <span className="text-muted-foreground">
                      {formatDate(booking.invoice.issueDate.toISOString())}
                    </span>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
