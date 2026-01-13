'use client'

import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface DownloadInvoiceServerButtonProps {
  invoiceId: string
  invoiceNumber: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function DownloadInvoiceServerButton({
  invoiceId,
  invoiceNumber,
  variant = 'outline',
  size = 'default',
}: DownloadInvoiceServerButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDownload = async () => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/invoices/${invoiceId}/download`)

      if (!response.ok) {
        throw new Error('Failed to download invoice')
      }

      // Get the blob from the response
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Facture-${invoiceNumber}.pdf`
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Succès',
        description: 'La facture a été téléchargée avec succès.',
      })
    } catch (error) {
      console.error('Error downloading invoice:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger la facture.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isLoading}
      className="gap-2"
    >
      {size === 'icon' ? (
        <Download className="h-4 w-4" />
      ) : (
        <>
          <FileText className="h-4 w-4" />
          {isLoading ? 'Téléchargement...' : 'Télécharger PDF'}
        </>
      )}
    </Button>
  )
}
