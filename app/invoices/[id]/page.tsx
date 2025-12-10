import Link from 'next/link'
import { AppLayout } from '@/components/layouts/app-shell'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Download, Printer } from 'lucide-react'

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Mock data
  const invoice = {
    id,
    date: '2 décembre 2025',
    dueDate: '15 décembre 2025',
    company: {
      name: 'Sayli SARL',
      address: '45 Avenue des Champs-Élysées',
      city: '75008 Paris',
      phone: '+33 1 23 45 67 89',
      email: 'contact@sayli.fr',
      siret: '123 456 789 00001',
    },
    client: {
      name: 'Marie Dupont',
      address: '123 Rue de la Paix',
      city: '75001 Paris',
      email: 'marie.dupont@email.com',
    },
    items: [
      {
        description: 'Séjour Villa Méditerranée (7 nuits)',
        quantity: 1,
        unitPrice: 1260,
        total: 1260,
      },
      { description: 'Linge de maison', quantity: 1, unitPrice: 25, total: 25 },
      { description: 'Ménage fin de séjour', quantity: 1, unitPrice: 60, total: 60 },
      { description: 'Taxe de séjour (7 nuits x 2€)', quantity: 1, unitPrice: 14, total: 14 },
    ],
    subtotal: 1359,
    tva: 0,
    total: 1359,
  }

  return (
    <AppLayout title={`Facture ${id}`}>
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
            <Button className="bg-primary hover:bg-primary/90">
              <Download className="mr-2 h-4 w-4" />
              Télécharger PDF
            </Button>
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
                    <span className="text-primary-foreground text-lg font-bold">LG</span>
                  </div>
                  <span className="text-foreground text-xl font-semibold">
                    {invoice.company.name}
                  </span>
                </div>
                <div className="text-muted-foreground space-y-0.5 text-sm">
                  <p>{invoice.company.address}</p>
                  <p>{invoice.company.city}</p>
                  <p>{invoice.company.phone}</p>
                  <p>{invoice.company.email}</p>
                  <p className="pt-1">SIRET: {invoice.company.siret}</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-foreground mb-2 text-3xl font-bold">FACTURE</h1>
                <p className="text-primary text-lg font-semibold">{invoice.id}</p>
                <div className="text-muted-foreground mt-4 text-sm">
                  <p>Date: {invoice.date}</p>
                  <p>Échéance: {invoice.dueDate}</p>
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
                  <p className="font-medium">{invoice.company.name}</p>
                  <p>{invoice.company.address}</p>
                  <p>{invoice.company.city}</p>
                </div>
              </div>
              <div>
                <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                  Facturé à
                </h3>
                <div className="text-foreground text-sm">
                  <p className="font-medium">{invoice.client.name}</p>
                  <p>{invoice.client.address}</p>
                  <p>{invoice.client.city}</p>
                  <p>{invoice.client.email}</p>
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
                  {invoice.items.map((item, index) => (
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
                  <span className="text-foreground">{invoice.subtotal} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA (0%)</span>
                  <span className="text-foreground">{invoice.tva} €</span>
                </div>
                <div className="border-border mt-2 border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-foreground font-semibold">Total TTC</span>
                    <span className="text-foreground text-xl font-bold">{invoice.total} €</span>
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
