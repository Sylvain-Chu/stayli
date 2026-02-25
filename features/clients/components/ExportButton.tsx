'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface Client {
  firstName: string
  lastName: string
  email: string
  phone: string | null
  createdAt: string | Date
}

interface ExportButtonProps {
  filename?: string
}

export function ExportClientsButton({ filename = 'clients.csv' }: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const exportToCSV = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/clients/export')
      if (!response.ok) throw new Error('Failed to fetch clients')

      const data = await response.json()
      const clients: Client[] = data.data || data

      if (!clients || clients.length === 0) {
        toast({
          title: 'Aucun client',
          description: 'Il n\'y a aucun client à exporter',
        })
        return
      }

      const headers = ['Prénom', 'Nom', 'Email', 'Téléphone', 'Date de création']

      const rows = clients.map((client) => [
        client.firstName,
        client.lastName,
        client.email,
        client.phone || '',
        new Date(client.createdAt).toLocaleDateString('fr-FR'),
      ])

      const csvContent = [
        headers.join(';'),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(';')),
      ].join('\n')

      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

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

      toast({
        title: 'Succès',
        description: `${clients.length} clients exportés`,
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible d\'exporter les clients',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={exportToCSV} disabled={isLoading}>
      <Download className="mr-2 h-4 w-4" />
      {isLoading ? 'Exporting...' : 'Exporter CSV'}
    </Button>
  )
}
