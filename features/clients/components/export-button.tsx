import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Client } from '@/features/clients/types'

interface ExportButtonProps {
  clients: Client[]
  filename?: string
}

export function ExportClientsButton({ clients, filename = 'clients.csv' }: ExportButtonProps) {
  const exportToCSV = () => {
    if (!clients || clients.length === 0) return

    // CSV Headers
    const headers = ['Prénom', 'Nom', 'Email', 'Téléphone', 'Date de création']

    // CSV Rows
    const rows = clients.map((client) => [
      client.firstName,
      client.lastName,
      client.email,
      client.phone || '',
      new Date(client.createdAt).toLocaleDateString('fr-FR'),
    ])

    // Create CSV content
    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(';')),
    ].join('\n')

    // Add BOM for UTF-8 encoding (Excel compatibility)
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

    // Create download link
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <Button variant="outline" onClick={exportToCSV} disabled={!clients || clients.length === 0}>
      <Download className="mr-2 h-4 w-4" />
      Exporter CSV
    </Button>
  )
}
