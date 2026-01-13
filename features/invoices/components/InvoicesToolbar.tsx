'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Trash2 } from 'lucide-react'
import { useInvoices } from '../hooks/useInvoices'
import { useInvoicesContext } from '../context/InvoicesContext'
import { useToast } from '@/hooks/use-toast'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface InvoicesToolbarProps {
  onSearchChange?: (value: string) => void
}

export function InvoicesToolbar({ onSearchChange }: InvoicesToolbarProps) {
  const [search, setSearch] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const { mutate } = useInvoices(search)
  const { selectedIds, clearSelection } = useInvoicesContext()
  const { toast } = useToast()

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onSearchChange?.(value)
  }

  const handleDeleteSelected = async () => {
    startTransition(async () => {
      try {
        await Promise.all(
          selectedIds.map((id: string) => fetch(`/api/invoices/${id}`, { method: 'DELETE' })),
        )

        await mutate()
        clearSelection()
        setIsDeleteDialogOpen(false)
        toast({
          title: 'Succès',
          description: `${selectedIds.length} facture(s) supprimée(s)`,
        })
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la suppression',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <>
      <div className="border-border bg-card flex items-center justify-between gap-4 rounded-lg border p-4">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Rechercher une facture..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <span className="text-muted-foreground text-sm">
                {selectedIds.length} sélectionnée(s)
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteSelected}
        title="Supprimer les factures"
        description={`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} facture(s) ? Cette action est irréversible.`}
      />
    </>
  )
}
