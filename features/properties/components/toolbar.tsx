'use client'

import { useState, useTransition } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, Trash2 } from 'lucide-react'
import { useProperties } from '../hooks/useProperties'
import { usePropertiesContext } from '../context/PropertiesContext'
import { useToast } from '@/hooks/use-toast'
import { propertySchema } from '@/lib/validations/property'
import { ZodError } from 'zod'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export function PropertiesToolbar() {
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    contractDescription: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  const { mutate } = useProperties(search)
  const { selectedIds, clearSelection } = usePropertiesContext()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      const validatedData = propertySchema.parse(formData)

      startTransition(async () => {
        try {
          const response = await fetch('/api/properties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validatedData),
          })

          if (!response.ok) {
            throw new Error('Erreur lors de la création')
          }

          await mutate()
          setIsDialogOpen(false)
          // Reset du formulaire complet
          setFormData({ name: '', address: '', description: '', contractDescription: '' })
          toast({
            title: 'Succès',
            description: 'Propriété créée avec succès',
          })
        } catch (error) {
          toast({
            title: 'Erreur',
            description: 'Une erreur est survenue lors de la création',
            variant: 'destructive',
          })
        }
      })
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(fieldErrors)
      }
    }
  }

  const handleDeleteSelected = async () => {
    startTransition(async () => {
      try {
        await Promise.all(
          selectedIds.map((id: string) => fetch(`/api/properties/${id}`, { method: 'DELETE' })),
        )

        await mutate()
        clearSelection()
        setIsDeleteDialogOpen(false)
        toast({
          title: 'Succès',
          description: `${selectedIds.length} propriété(s) supprimée(s)`,
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
            placeholder="Rechercher une propriété..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </>
          )}
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Propriété
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {' '}
          {/* Élargi un peu pour le confort */}
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Nouvelle Propriété</DialogTitle>
              <DialogDescription>
                Créez une nouvelle propriété dans votre système.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Villa Soleil"
                />
                {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Rue de la Plage"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Marketing)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description courte pour l'interface..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractDescription">
                  Description contractuelle (Désignation des lieux)
                </Label>
                <Textarea
                  id="contractDescription"
                  value={formData.contractDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, contractDescription: e.target.value })
                  }
                  placeholder="Copiez ici le paragraphe 'DÉSIGNATION DES LIEUX' complet du contrat (surface, étage, équipements, etc.)"
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-muted-foreground text-xs">
                  Ce texte apparaîtra tel quel dans la section "Désignation des lieux" du contrat
                  PDF généré.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Création...' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteSelected}
        title="Supprimer les propriétés"
        description={`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} propriété(s) ? Cette action est irréversible.`}
      />
    </>
  )
}
