'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AppLayout } from '@/components/layouts/app-shell'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft } from 'lucide-react'
import { PDFViewer } from '@react-pdf/renderer'

import { useInvoice } from '@/features/invoices/hooks/useInvoices'
import { useSettings } from '@/features/settings/hooks/useSettings'
import { InvoicePDF } from '@/features/invoices/components/InvoicePDF'

export default function InvoiceDetailPage() {
  const params = useParams()
  // Sécurisation de l'ID (tableau ou string)
  const id =
    typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : ''

  // Récupération des données
  const { invoice, isLoading: invoiceLoading, isError: invoiceError } = useInvoice(id)
  const { settings, isLoading: settingsLoading } = useSettings()

  // État de chargement
  if (invoiceLoading || settingsLoading) {
    return (
      <AppLayout title="Chargement de la facture...">
        <div className="flex h-[calc(100vh-120px)] flex-col space-y-4">
          <div className="mb-4 flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="w-full flex-1 rounded-xl" />
        </div>
      </AppLayout>
    )
  }

  // État d'erreur
  if (invoiceError || !invoice || !settings) {
    return (
      <AppLayout title="Facture introuvable">
        <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 text-center">
          <p className="text-destructive font-medium">
            Impossible de charger la facture ou les paramètres de l'entreprise.
          </p>
          <Link href="/invoices" className="text-primary text-sm hover:underline">
            Retourner à la liste
          </Link>
        </div>
      </AppLayout>
    )
  }

  // Conversion des null en undefined pour éviter les conflits de types TS avec React-PDF
  const safeSettings = {
    companyName: settings.companyName,
    companyAddress: settings.companyAddress || undefined,
    companyZipCode: settings.companyZipCode || undefined,
    companyCity: settings.companyCity || undefined,
    companyPhoneNumber: settings.companyPhoneNumber || undefined,
    companyEmail: settings.companyEmail || undefined,
    companyLogoUrl: settings.companyLogoUrl || undefined,
    companySiret: settings.companySiret || undefined,
    currencySymbol: settings.currencySymbol,
    invoicePaymentInstructions: settings.invoicePaymentInstructions || undefined,
    cancellationInsuranceProviderName: settings.cancellationInsuranceProviderName,
    touristTaxRatePerPersonPerDay: settings.touristTaxRatePerPersonPerDay,
  }

  return (
    <AppLayout title={`Facture ${invoice.invoiceNumber}`}>
      <div className="flex h-[calc(100vh-100px)] flex-col space-y-4">
        {/* Barre d'outils / Navigation */}
        <div className="flex shrink-0 items-center justify-between px-1">
          <Link
            href="/invoices"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour aux factures
          </Link>
        </div>

        {/* Visualiseur PDF */}
        <div className="bg-muted/30 border-border w-full flex-1 overflow-hidden rounded-xl border shadow-sm">
          <PDFViewer
            width="100%"
            height="100%"
            className="h-full w-full border-none"
            showToolbar={true}
          >
            <InvoicePDF
              invoice={{
                invoiceNumber: invoice.invoiceNumber,
                issueDate: invoice.issueDate,
                dueDate: invoice.dueDate,
                amount: invoice.amount,
                status: invoice.status,
              }}
              booking={{
                id: invoice.booking.id,
                startDate: invoice.booking.startDate,
                endDate: invoice.booking.endDate,
                totalPrice: invoice.booking.totalPrice,
                basePrice: invoice.booking.basePrice,
                cleaningFee: invoice.booking.cleaningFee,
                taxes: invoice.booking.taxes,
                adults: invoice.booking.adults,
                children: invoice.booking.children,
                discount: invoice.booking.discount,
                discountType: invoice.booking.discountType,
                hasLinens: invoice.booking.hasLinens,
                linensPrice: invoice.booking.linensPrice,
                hasCleaning: invoice.booking.hasCleaning,
                cleaningPrice: invoice.booking.cleaningPrice,
                hasCancellationInsurance: invoice.booking.hasCancellationInsurance,
                insuranceFee: invoice.booking.insuranceFee,
                specialRequests: invoice.booking.specialRequests,
              }}
              property={{
                name: invoice.booking.property.name,
                address: invoice.booking.property.address,
              }}
              client={{
                firstName: invoice.booking.client.firstName,
                lastName: invoice.booking.client.lastName,
                email: invoice.booking.client.email,
                phone: invoice.booking.client.phone,
                address: invoice.booking.client.address || undefined,
                zipCode: invoice.booking.client.zipCode || undefined,
                city: invoice.booking.client.city || undefined,
              }}
              settings={safeSettings}
            />
          </PDFViewer>
        </div>
      </div>
    </AppLayout>
  )
}
