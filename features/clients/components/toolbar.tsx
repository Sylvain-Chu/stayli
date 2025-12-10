'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, Trash2 } from 'lucide-react'
import { createClient, deleteClient } from '@/features/clients/hooks/useClients'
import { ExportClientsButton } from './export-button'
import { useToast } from '@/hooks/use-toast'
import { mutate } from 'swr'
import { clientSchema } from '@/lib/validations/client'
import type { Client } from '@/features/clients/types'
import { useClientsContext } from '@/features/clients/context/ClientsContext'

interface ClientsToolbarProps {
  onSearchChange?: (search: string) => void
  clients?: Client[]
}

export function ClientsToolbar({ onSearchChange, clients }: ClientsToolbarProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })
  const { toast } = useToast()
  const { selectedIds, clearSelection } = useClientsContext()

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onSearchChange?.(value)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    try {
      await Promise.all(selectedIds.map((id) => deleteClient(id)))
      await mutate((key) => typeof key === 'string' && key.startsWith('/api/clients'))
      clearSelection()
      toast({
        title: `${selectedIds.length} client${selectedIds.length > 1 ? 's' : ''} supprimé${selectedIds.length > 1 ? 's' : ''}`,
        description: 'La suppression a été effectuée avec succès.',
      })
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer les clients. Veuillez réessayer.',
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Valider les données
      const validatedData = clientSchema.parse(formData)

      // Créer le client
      await createClient(validatedData)

      // Revalider les données avec SWR
      await mutate((key) => typeof key === 'string' && key.startsWith('/api/clients'))

      // Réinitialiser le formulaire
      setOpen(false)
      setFormData({ firstName: '', lastName: '', email: '', phone: '' })

      toast({
        title: 'Client créé',
        description: 'Le client a été créé avec succès.',
      })
    } catch (error) {
      console.error('Erreur lors de la création du client:', error)
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de créer le client',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="border-border bg-card flex items-center justify-between rounded-lg border p-4">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          {selectedIds.length > 0 && (
            <span className="text-sm font-medium">
              {selectedIds.length} client{selectedIds.length > 1 ? 's' : ''} sélectionné
              {selectedIds.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <>
              <Button variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </>
          )}
          <ExportClientsButton clients={clients || []} />
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Client
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Nouveau client</DialogTitle>
              <DialogDescription>
                Créez un nouveau client en remplissant les informations ci-dessous.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Création...' : 'Créer le client'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
