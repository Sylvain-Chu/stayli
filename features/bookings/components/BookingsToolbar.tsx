'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Plus, Trash2 } from 'lucide-react'
import { useBookingsContext } from '../context/BookingsContext'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import { BookingStatus } from '../types'

interface BookingsToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
  status: BookingStatus | 'all'
  onStatusChange: (value: BookingStatus | 'all') => void
  onDataChange?: () => void
}

export function BookingsToolbar({
  searchQuery,
  onSearchChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  status,
  onStatusChange,
  onDataChange,
}: BookingsToolbarProps) {
  const { selectedIds, clearSelection } = useBookingsContext()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const { toast } = useToast()

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/bookings/${id}`, {
            method: 'DELETE',
          }),
        ),
      )

      clearSelection()
      setDeleteConfirmOpen(false)
      onDataChange?.()
      toast({
        title: 'Réservations supprimées',
        description: `${selectedIds.length} réservation(s) supprimée(s) avec succès.`,
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer les réservations.',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <div className="border-border bg-card flex flex-wrap items-center gap-3 rounded-lg border p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Rechercher client, propriété..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="w-[150px]"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="w-[150px]"
          />
        </div>

        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[155px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="confirmed">Confirmée</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="cancelled">Annulée</SelectItem>
            <SelectItem value="blocked">Bloquée</SelectItem>
          </SelectContent>
        </Select>

        {selectedIds.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteConfirmOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer ({selectedIds.length})
          </Button>
        )}

        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/bookings/create">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Link>
        </Button>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleBulkDelete}
        title="Supprimer les réservations"
        description={`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} réservation(s) ? Cette action est irréversible.`}
      />
    </>
  )
}
