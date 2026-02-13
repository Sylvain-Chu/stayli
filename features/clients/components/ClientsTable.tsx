'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, Pencil, Trash2, Mail, Phone } from 'lucide-react'
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
import { ColumnHeader, ActiveFilters } from '@/components/ui/data-table'
import { cn } from '@/lib/utils'
import { useClients } from '@/features/clients/hooks/useClients'
import { useClientMutations } from '@/features/clients/hooks/useClientMutations'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ClientsTableSkeleton } from './TableSkeleton'
import { useToast } from '@/hooks/use-toast'
import { FormEvent, useState } from 'react'
import { useClientsContext } from '@/features/clients/context/ClientsContext'

type SortDirection = 'asc' | 'desc' | null

type ClientRow = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  address?: string | null
  zipCode?: string | null
  city?: string | null
  createdAt: string
}

interface ClientsTableProps {
  searchQuery?: string
}

export function ClientsTable({ searchQuery = '' }: ClientsTableProps) {
  const { selectedIds, toggleSelection, selectAll, clearSelection } = useClientsContext()
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [filters, setFilters] = useState({
    name: '',
    email: '',
  })
  const [page, setPage] = useState(1)
  const perPage = 10
  const [prevSearch, setPrevSearch] = useState(searchQuery)
  if (prevSearch !== searchQuery) {
    setPrevSearch(searchQuery)
    setPage(1)
  }
  const [viewClient, setViewClient] = useState<ClientRow | null>(null)
  const [editClient, setEditClient] = useState<ClientRow | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    zipCode: '',
    city: '',
  })
  const { toast } = useToast()
  const { updateClient, deleteClient } = useClientMutations()

  const searchTerm = searchQuery || filters.name || filters.email

  const { clients, isLoading, isError, total, mutate } = useClients(searchTerm, page, perPage)

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
    if (selectedIds.length === clients?.length) {
      clearSelection()
    } else {
      selectAll(clients?.map((c: { id: string }) => c.id) || [])
    }
  }

  const handleViewProfile = (client: ClientRow) => {
    setViewClient(client)
  }

  const handleEditClient = (client: ClientRow) => {
    setEditClient(client)
    setEditFormData({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone || '',
      address: client.address || '',
      zipCode: client.zipCode || '',
      city: client.city || '',
    })
  }

  const handleSubmitEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editClient) return
    setIsSubmitting(true)
    try {
      mutate(
        async (data: any) => {
          await updateClient(editClient.id, editFormData)
          return data
        },
        {
          optimisticData: (current: any) => {
            if (!current) return current
            return {
              ...current,
              clients: current.clients?.map((c: ClientRow) =>
                c.id === editClient.id ? { ...c, ...editFormData } : c,
              ),
            }
          },
          rollbackOnError: true,
          revalidate: true,
        },
      )
      setEditClient(null)
      toast({
        title: 'Client modifié',
        description: 'Les informations du client ont été mises à jour avec succès.',
      })
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le client. Veuillez réessayer.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setClientToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    const idsToDelete = clientToDelete ? [clientToDelete] : selectedIds
    if (idsToDelete.length === 0) return

    try {
      mutate(
        async (data: any) => {
          await Promise.all(idsToDelete.map((id) => deleteClient(id)))
          return data
        },
        {
          optimisticData: (current: any) => {
            if (!current) return current
            return {
              ...current,
              clients: current.clients?.filter((c: ClientRow) => !idsToDelete.includes(c.id)),
              total: (current.total || 0) - idsToDelete.length,
            }
          },
          rollbackOnError: true,
          revalidate: true,
        },
      )
      toast({
        title: `${idsToDelete.length} client${idsToDelete.length > 1 ? 's' : ''} supprimé${idsToDelete.length > 1 ? 's' : ''}`,
        description: 'La suppression a été effectuée avec succès.',
      })
      clearSelection()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer les clients. Veuillez réessayer.',
        variant: 'destructive',
      })
    } finally {
      setClientToDelete(null)
    }
  }

  const activeFilters = Object.entries(filters)
    .filter(([, value]) => value)
    .map(([key, value]) => ({
      key,
      label: key === 'name' ? 'Client' : 'Email',
      value,
    }))

  if (isLoading) {
    return <ClientsTableSkeleton />
  }

  if (isError) {
    return (
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <div className="flex items-center justify-center py-12">
          <div className="text-destructive text-sm">Erreur lors du chargement des clients</div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <ActiveFilters
        filters={activeFilters}
        onRemove={(key) => setFilters((prev) => ({ ...prev, [key]: '' }))}
        onClearAll={() => setFilters({ name: '', email: '' })}
      />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-border bg-muted/40 border-b">
              <th className="h-11 w-12 px-4">
                <Checkbox
                  checked={selectedIds.length === clients?.length && (clients?.length || 0) > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <ColumnHeader
                label="Client"
                sortable
                filterable
                sortDirection={sortColumn === 'name' ? sortDirection : null}
                onSort={() => handleSort('name')}
                filterValue={filters.name}
                onFilterChange={(value) => setFilters((prev) => ({ ...prev, name: value }))}
                className="min-w-[200px]"
              />
              <ColumnHeader
                label="Email"
                filterable
                filterValue={filters.email}
                onFilterChange={(value) => setFilters((prev) => ({ ...prev, email: value }))}
                className="min-w-[220px]"
              />
              <th className="h-11 px-4 text-left">
                <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Téléphone
                </span>
              </th>
              <th className="h-11 px-4 text-left">
                <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Créé le
                </span>
              </th>
              <th className="h-11 w-16 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {clients?.map((client: ClientRow, idx: number) => {
              const initials = `${client.firstName[0]}${client.lastName[0]}`.toUpperCase()
              return (
                <tr
                  key={client.id}
                  className={cn(
                    'group border-border hover:bg-muted/50 border-b transition-colors',
                    selectedIds.includes(client.id) && 'bg-primary/5',
                    idx === (clients?.length || 0) - 1 && 'border-b-0',
                  )}
                >
                  <td className="h-14 px-4">
                    <Checkbox
                      checked={selectedIds.includes(client.id)}
                      onCheckedChange={() => toggleSelection(client.id)}
                    />
                  </td>
                  <td className="h-14 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-foreground text-sm font-medium">
                        {client.firstName} {client.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="h-14 px-4">
                    <a
                      href={`mailto:${client.email}`}
                      className="text-muted-foreground hover:text-primary flex items-center gap-2 text-sm"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {client.email}
                    </a>
                  </td>
                  <td className="h-14 px-4">
                    {client.phone ? (
                      <a
                        href={`tel:${client.phone}`}
                        className="text-muted-foreground hover:text-primary flex items-center gap-2 text-sm"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {client.phone}
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </td>
                  <td className="h-14 px-4">
                    <span className="text-muted-foreground text-sm">
                      {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </td>
                  <td className="flex h-14 flex-row items-center justify-center px-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => handleViewProfile(client)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => handleEditClient(client)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => handleDeleteClick(client.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {(!clients || clients.length === 0) && (
        <div className="text-muted-foreground flex items-center justify-center py-12 text-sm">
          Aucun client trouvé
        </div>
      )}
      {total && total > perPage && (
        <div className="border-border flex items-center justify-between border-t px-4 py-3">
          <div className="text-muted-foreground text-sm">
            {total} client{total > 1 ? 's' : ''} au total
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / perPage)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!viewClient} onOpenChange={() => setViewClient(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Profil du client</DialogTitle>
          </DialogHeader>
          {viewClient && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={`/.jpg?height=64&width=64&query=${viewClient.firstName} ${viewClient.lastName}`}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                    {`${viewClient.firstName[0]}${viewClient.lastName[0]}`.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {viewClient.firstName} {viewClient.lastName}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Client depuis le {new Date(viewClient.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  <a href={`mailto:${viewClient.email}`} className="text-sm hover:underline">
                    {viewClient.email}
                  </a>
                </div>
                {viewClient.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="text-muted-foreground h-4 w-4" />
                    <a href={`tel:${viewClient.phone}`} className="text-sm hover:underline">
                      {viewClient.phone}
                    </a>
                  </div>
                )}
                {(viewClient.address || viewClient.zipCode || viewClient.city) && (
                  <div className="mt-1 border-t pt-3">
                    <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                      Adresse
                    </p>
                    <p className="text-sm">{viewClient.address}</p>
                    <p className="text-sm">
                      {viewClient.zipCode} {viewClient.city}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewClient(null)}>
              Fermer
            </Button>
            {viewClient && (
              <Button
                onClick={() => {
                  setViewClient(null)
                  handleEditClient(viewClient)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editClient} onOpenChange={() => setEditClient(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmitEdit}>
            <DialogHeader>
              <DialogTitle>Modifier le client</DialogTitle>
              <DialogDescription>Modifiez les informations du client.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-firstName">Prénom *</Label>
                <Input
                  id="edit-firstName"
                  value={editFormData.firstName}
                  onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lastName">Nom *</Label>
                <Input
                  id="edit-lastName"
                  value={editFormData.lastName}
                  onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Téléphone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-address">Adresse</Label>
                <Input
                  id="edit-address"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  placeholder="123 rue de la Paix"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-zipCode">Code Postal</Label>
                  <Input
                    id="edit-zipCode"
                    value={editFormData.zipCode}
                    onChange={(e) => setEditFormData({ ...editFormData, zipCode: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-city">Ville</Label>
                  <Input
                    id="edit-city"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditClient(null)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Modification...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation de suppression */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Supprimer le client"
        description="Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible."
        onConfirm={handleConfirmDelete}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="destructive"
      />
    </div>
  )
}
