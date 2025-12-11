'use client'

import Link from 'next/link'
import { AppLayout } from '@/components/layouts/app-shell'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Printer } from 'lucide-react'
import { DownloadInvoiceServerButton } from '@/features/invoices/components'
import { useInvoice } from '@/features/invoices/hooks/useInvoices'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'

export default function InvoiceDetailPage() {
  const params = useParams()
  const id =
    typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : ''
  const { invoice, isLoading, isError } = useInvoice(id)

  // Calculs pour affichage
  const items = useMemo(() => {
    if (!invoice?.booking) return []
    const nights = Math.ceil(
      (new Date(invoice.booking.endDate).getTime() -
        new Date(invoice.booking.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    )
    const arr = [
      {
        description: `Séjour ${invoice.booking.property?.name || ''} (${nights} nuit${nights > 1 ? 's' : ''})`,
        quantity: 1,
        unitPrice: invoice.booking.basePrice,
        total: invoice.booking.basePrice,
      },
    ]
    if (invoice.booking.hasLinens && invoice.booking.linensPrice > 0) {
      arr.push({
        description: 'Linge de maison',
        quantity: 1,
        unitPrice: invoice.booking.linensPrice,
        total: invoice.booking.linensPrice,
      })
    }
    if (invoice.booking.hasCleaning && invoice.booking.cleaningPrice > 0) {
      arr.push({
        description: 'Ménage fin de séjour',
        quantity: 1,
        unitPrice: invoice.booking.cleaningPrice,
        total: invoice.booking.cleaningPrice,
      })
    }
    if (invoice.booking.taxes > 0) {
      arr.push({
        description: 'Taxe de séjour',
        quantity: 1,
        unitPrice: invoice.booking.taxes,
        total: invoice.booking.taxes,
      })
    }
    if (invoice.booking.discount > 0) {
      arr.push({
        description: 'Remise',
        quantity: 1,
        unitPrice: -invoice.booking.discount,
        total: -invoice.booking.discount,
      })
    }
    return arr
  }, [invoice])

  const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.total, 0), [items])
  const tva = 0
  const total = invoice?.amount || 0

  if (isLoading) {
    return <div className="text-muted-foreground p-8 text-center">Chargement...</div>
  }
  if (isError || !invoice) {
    return (
      <div className="text-destructive p-8 text-center">
        Erreur lors du chargement de la facture.
      </div>
    )
  }

  return (
    <AppLayout title={`Facture ${invoice.invoiceNumber}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/invoices"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-transparent">
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
            <DownloadInvoiceServerButton
              invoiceId={invoice.id}
              invoiceNumber={invoice.invoiceNumber}
              variant="default"
              size="default"
            />
          </div>
        </div>

        {/* Invoice Paper */}
        <div className="mx-auto max-w-3xl">
          <div className="border-border bg-card rounded-lg border p-12 shadow-sm">
            {/* Invoice Header */}
            <div className="mb-12 flex items-start justify-between">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
                    <span className="text-primary-foreground text-lg font-bold">
                      {invoice.booking?.property?.name?.[0] || 'F'}
                    </span>
                  </div>
                  <span className="text-foreground text-xl font-semibold">
                    {invoice.booking?.property?.name || 'Propriété'}
                  </span>
                </div>
                <div className="text-muted-foreground space-y-0.5 text-sm">
                  <p>{invoice.booking?.property?.address}</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-foreground mb-2 text-3xl font-bold">FACTURE</h1>
                <p className="text-primary text-lg font-semibold">{invoice.invoiceNumber}</p>
                <div className="text-muted-foreground mt-4 text-sm">
                  <p>Date: {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</p>
                  <p>Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="mb-10 grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                  Émetteur
                </h3>
                <div className="text-foreground text-sm">
                  <p className="font-medium">{invoice.booking?.property?.name}</p>
                  <p>{invoice.booking?.property?.address}</p>
                </div>
              </div>
              <div>
                <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                  Facturé à
                </h3>
                <div className="text-foreground text-sm">
                  <p className="font-medium">
                    {invoice.booking?.client?.firstName} {invoice.booking?.client?.lastName}
                  </p>
                  <p>{invoice.booking?.client?.address}</p>
                  <p>{invoice.booking?.client?.city}</p>
                  <p>{invoice.booking?.client?.email}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-border mb-8 overflow-hidden rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-foreground px-4 py-3 text-left text-sm font-medium">
                      Description
                    </th>
                    <th className="text-foreground px-4 py-3 text-center text-sm font-medium">
                      Qté
                    </th>
                    <th className="text-foreground px-4 py-3 text-right text-sm font-medium">
                      Prix unit.
                    </th>
                    <th className="text-foreground px-4 py-3 text-right text-sm font-medium">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-border border-t">
                      <td className="text-foreground px-4 py-3 text-sm">{item.description}</td>
                      <td className="text-muted-foreground px-4 py-3 text-center text-sm">
                        {item.quantity}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-right text-sm">
                        {item.unitPrice} €
                      </td>
                      <td className="text-foreground px-4 py-3 text-right text-sm font-medium">
                        {item.total} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total HT</span>
                  <span className="text-foreground">{subtotal} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA (0%)</span>
                  <span className="text-foreground">{tva} €</span>
                </div>
                <div className="border-border mt-2 border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-foreground font-semibold">Total TTC</span>
                    <span className="text-foreground text-xl font-bold">{total} €</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-border mt-12 border-t pt-8">
              <p className="text-muted-foreground text-center text-xs">
                Merci pour votre confiance. En cas de retard de paiement, des pénalités pourront
                être appliquées conformément à la législation en vigueur.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
