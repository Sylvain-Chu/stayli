'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GenerateInvoiceButtonProps {
  bookingId: string
  hasInvoice: boolean
}

export function GenerateInvoiceButton({ bookingId, hasInvoice }: GenerateInvoiceButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleGenerateInvoice = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de la facture')
      }

      const invoice = await response.json()

      toast({
        title: 'Facture générée',
        description: `La facture ${invoice.invoiceNumber} a été créée avec succès`,
      })

      // Rediriger vers la facture
      router.push(`/invoices/${invoice.id}`)
    } catch (error) {
      console.error('Error generating invoice:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de générer la facture',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (hasInvoice) {
    return null
  }

  return (
    <Button onClick={handleGenerateInvoice} disabled={isGenerating}>
      <FileText className="mr-2 h-4 w-4" />
      {isGenerating ? 'Génération...' : 'Générer la facture'}
    </Button>
  )
}
