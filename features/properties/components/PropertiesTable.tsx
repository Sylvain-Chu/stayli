'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, Pencil, Trash2, MapPin, Home } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ColumnHeader } from '@/components/ui/data-table'
import { cn } from '@/lib/utils'
import { useProperties } from '@/features/properties/hooks/useProperties'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import { FormEvent, useEffect, useState, useTransition } from 'react'
import { usePropertiesContext } from '@/features/properties/context/PropertiesContext'
import { Property } from '../types'
import { propertySchema } from '@/lib/validations/property'
import { ZodError } from 'zod'

type SortDirection = 'asc' | 'desc' | null

interface PropertiesTableProps {
  searchQuery?: string
}

export function PropertiesTable({ searchQuery = '' }: PropertiesTableProps) {
  const { selectedIds, toggleSelection, selectAll, clearSelection } = usePropertiesContext()
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [page, setPage] = useState(1)
  const perPage = 10
  const [viewProperty, setViewProperty] = useState<Property | null>(null)
  const [editProperty, setEditProperty] = useState<Property | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [editFormData, setEditFormData] = useState({
    name: '',
    address: '',
    description: '',
    contractDescription: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const { properties, isLoading, isError, total, mutate } = useProperties(
    searchQuery,
    page,
    perPage,
  )

  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc')
      if (sortDirection === 'desc') setSortColumn(null)
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = () => {
    if (selectedIds.length === properties?.length) {
      clearSelection()
    } else {
      selectAll(properties?.map((p) => p.id) || [])
    }
  }

  const handleViewProperty = (property: Property) => {
    setViewProperty(property)
  }

  const handleEditProperty = (property: Property) => {
    setEditProperty(property)
    setEditFormData({
      name: property.name,
      address: property.address || '',
      description: property.description || '',
      contractDescription: property.contractDescription || '',
    })
    setErrors({})
  }

  const handleSubmitEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editProperty) return
    setErrors({})

    try {
      const validatedData = propertySchema.parse(editFormData)

      startTransition(async () => {
        try {
          const response = await fetch(`/api/properties/${editProperty.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validatedData),
          })

          if (!response.ok) {
            throw new Error('Erreur lors de la modification')
          }

          await mutate()
          setEditProperty(null)
          toast({
            title: 'Propriété modifiée',
            description: 'Les informations ont été mises à jour avec succès.',
          })
        } catch (error) {
          toast({
            title: 'Erreur',
            description: 'Impossible de modifier la propriété.',
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

  const handleDeleteClick = (id: string) => {
    setPropertyToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return

    startTransition(async () => {
      try {
        const response = await fetch(`/api/properties/${propertyToDelete}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression')
        }

        await mutate()
        setDeleteConfirmOpen(false)
        setPropertyToDelete(null)
        toast({
          title: 'Propriété supprimée',
          description: 'La propriété a été supprimée avec succès.',
        })
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer la propriété.',
          variant: 'destructive',
        })
      }
    })
  }

  if (isLoading) {
    return (
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <div className="text-muted-foreground flex items-center justify-center py-12 text-sm">
          Chargement...
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <div className="text-destructive flex items-center justify-center py-12 text-sm">
          Erreur lors du chargement des propriétés
        </div>
      </div>
    )
  }

  const sortedProperties = [...(properties || [])].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0
    let aVal: string | number = ''
    let bVal: string | number = ''

    if (sortColumn === 'name') {
      aVal = a.name
      bVal = b.name
    } else if (sortColumn === 'bookings') {
      aVal = a._count?.bookings || 0
      bVal = b._count?.bookings || 0
    } else if (sortColumn === 'revenue') {
      aVal = a.revenue || 0
      bVal = b.revenue || 0
    }

    if (typeof aVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal)
    }
    return sortDirection === 'asc'
      ? (aVal as unknown as number) - (bVal as unknown as number)
      : (bVal as unknown as number) - (aVal as unknown as number)
  })

  return (
    <>
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-border bg-muted/40 border-b">
                <th className="h-11 w-12 px-4">
                  <Checkbox
                    checked={
                      selectedIds.length === properties?.length && (properties?.length || 0) > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <ColumnHeader
                  label="Nom"
                  sortable
                  sortDirection={sortColumn === 'name' ? sortDirection : null}
                  onSort={() => handleSort('name')}
                  className="min-w-[200px]"
                />
                <ColumnHeader label="Adresse" className="min-w-[250px]" />
                <ColumnHeader
                  label="Réservations"
                  sortable
                  sortDirection={sortColumn === 'bookings' ? sortDirection : null}
                  onSort={() => handleSort('bookings')}
                  className="min-w-[120px]"
                />
                <ColumnHeader
                  label="Revenus"
                  sortable
                  sortDirection={sortColumn === 'revenue' ? sortDirection : null}
                  onSort={() => handleSort('revenue')}
                  className="min-w-[140px]"
                />
                <th className="h-11 w-16 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {sortedProperties.map((property, idx) => (
                <tr
                  key={property.id}
                  className={cn(
                    'group border-border hover:bg-muted/50 border-b transition-colors',
                    selectedIds.includes(property.id) && 'bg-primary/5',
                    idx === sortedProperties.length - 1 && 'border-b-0',
                  )}
                >
                  <td className="h-16 px-4">
                    <Checkbox
                      checked={selectedIds.includes(property.id)}
                      onCheckedChange={() => toggleSelection(property.id)}
                    />
                  </td>
                  <td className="h-16 px-4">
                    <div className="flex items-center gap-3">
                      <Home className="text-muted-foreground h-5 w-5" />
                      <div>
                        <p className="text-foreground text-sm font-medium">{property.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="h-16 px-4">
                    <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                      <MapPin className="h-3.5 w-3.5" />
                      {property.address || 'Non renseignée'}
                    </p>
                  </td>
                  <td className="h-16 px-4">
                    <span className="bg-primary/10 text-primary inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-semibold">
                      {property._count?.bookings || 0}
                    </span>
                  </td>
                  <td className="h-16 px-4">
                    <span className="text-foreground text-sm font-semibold">
                      {property.revenue ? `${property.revenue.toLocaleString('fr-FR')} €` : '0 €'}
                    </span>
                  </td>
                  <td className="flex h-14 flex-row items-center justify-center px-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => handleViewProperty(property)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => handleEditProperty(property)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => handleDeleteClick(property.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedProperties.length === 0 && (
          <div className="text-muted-foreground flex items-center justify-center py-12 text-sm">
            Aucune propriété trouvée
          </div>
        )}
      </div>

      <Dialog open={!!viewProperty} onOpenChange={() => setViewProperty(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de la propriété</DialogTitle>
          </DialogHeader>
          {viewProperty && (
            <div className="space-y-4">
              <div>
                <Label>Nom</Label>
                <p className="text-sm">{viewProperty.name}</p>
              </div>
              <div>
                <Label>Adresse</Label>
                <p className="text-sm">{viewProperty.address || 'Non renseignée'}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm">{viewProperty.description || 'Aucune description'}</p>
              </div>
              <div>
                <Label>Désignation contractuelle</Label>
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                  {viewProperty.contractDescription || 'Aucune description contractuelle'}
                </p>
              </div>
              <div>
                <Label>Réservations</Label>
                <p className="text-sm">{viewProperty._count?.bookings || 0}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editProperty} onOpenChange={() => setEditProperty(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmitEdit}>
            <DialogHeader>
              <DialogTitle>Modifier la propriété</DialogTitle>
              <DialogDescription>Modifiez les informations de la propriété.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
                {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Adresse</Label>
                <Input
                  id="edit-address"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Marketing)</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-contractDescription">
                  Description contractuelle (Désignation des lieux)
                </Label>
                <Textarea
                  id="edit-contractDescription"
                  value={editFormData.contractDescription}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, contractDescription: e.target.value })
                  }
                  rows={6}
                  className="font-mono text-sm"
                  placeholder="Texte juridique pour le contrat..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditProperty(null)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Modification...' : 'Modifier'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la propriété"
        description="Êtes-vous sûr de vouloir supprimer cette propriété ? Cette action est irréversible."
      />
    </>
  )
}
