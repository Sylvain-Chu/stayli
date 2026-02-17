'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { ContractPDF, type ContractProps } from './ContractPDF'

export function DownloadContractButton({ booking, property, client, settings }: ContractProps) {
  const fileName = `Contrat-${client.lastName}-${new Date(booking.startDate).toISOString().split('T')[0]}.pdf`

  return (
    <PDFDownloadLink
      document={
        <ContractPDF booking={booking} property={property} client={client} settings={settings} />
      }
      fileName={fileName}
    >
      {({ loading }) => (
        <Button variant="outline" disabled={loading} className="gap-2">
          <FileText className="h-4 w-4" />
          {loading ? 'Génération...' : 'Télécharger contrat'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
