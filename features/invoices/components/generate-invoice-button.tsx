'use client'

import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { InvoicePDF } from './InvoicePDF'

interface DownloadInvoiceButtonProps {
  invoice: {
    invoiceNumber: string
    issueDate: string | Date
    dueDate: string | Date
    amount: number
    status: string
  }
  booking: {
    id: string
    startDate: string | Date
    endDate: string | Date
    totalPrice: number
    basePrice: number
    cleaningFee?: number
    taxes?: number
    adults: number
    children: number
    discount?: number
    discountType?: string
    hasLinens?: boolean
    linensPrice?: number
    hasCleaning?: boolean
    cleaningPrice?: number
    hasCancellationInsurance?: boolean
    insuranceFee?: number
    specialRequests?: string
  }
  property: {
    name: string
    address?: string
    description?: string
  }
  client: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    address?: string
    zipCode?: string
    city?: string
  }
  settings: {
    companyName?: string
    companyAddress?: string
    companyPhoneNumber?: string
    companyEmail?: string
    currencySymbol?: string
    invoicePaymentInstructions?: string
    cancellationInsuranceProviderName?: string
  }
}

export function DownloadInvoiceButton({
  invoice,
  booking,
  property,
  client,
  settings,
}: DownloadInvoiceButtonProps) {
  const fileName = `Facture-${invoice.invoiceNumber}-${client.lastName}.pdf`

  return (
    <PDFDownloadLink
      document={
        <InvoicePDF
          invoice={invoice}
          booking={booking}
          property={property}
          client={client}
          settings={settings}
        />
      }
      fileName={fileName}
    >
      {({ loading }) => (
        <Button variant="outline" disabled={loading} className="gap-2">
          <FileText className="h-4 w-4" />
          {loading ? 'Génération...' : 'Télécharger la facture'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
