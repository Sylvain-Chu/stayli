'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FileText, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface GenerateInvoiceButtonProps {
  bookingId: string
  hasInvoice: boolean
}

export function GenerateInvoiceButton({ bookingId, hasInvoice }: GenerateInvoiceButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  if (hasInvoice) return null

  const handleGenerate = () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/invoices/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error?.message || 'Erreur lors de la génération')
        }

        router.refresh()
        toast({
          title: 'Facture générée',
          description: 'La facture a été créée avec succès.',
        })
      } catch (error) {
        toast({
          title: 'Erreur',
          description: error instanceof Error ? error.message : 'Impossible de générer la facture.',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <Button variant="outline" onClick={handleGenerate} disabled={isPending} className="gap-2">
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
      {isPending ? 'Génération...' : 'Générer la facture'}
    </Button>
  )
}
