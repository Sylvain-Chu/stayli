'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { ColumnHeader } from '@/components/ui/data-table'
import { cn } from '@/lib/utils'
import { useBookingsContext } from '../context/BookingsContext'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import { useState, useTransition } from 'react'
import { Booking, BookingStatus } from '../types'

type SortDirection = 'asc' | 'desc' | null

interface BookingsTableProps {
  bookings: Booking[]
  isLoading: boolean
  isError: boolean
  onDataChange: () => void
}

export function BookingsTable({ bookings, isLoading, isError, onDataChange }: BookingsTableProps) {
  const { selectedIds, toggleSelection, selectAll, clearSelection } = useBookingsContext()
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

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
    if (selectedIds.length === bookings?.length) {
      clearSelection()
    } else {
      selectAll(bookings?.map((b) => b.id) || [])
    }
  }

  const handleDeleteClick = (id: string) => {
    setBookingToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return

    startTransition(async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingToDelete}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression')
        }

        onDataChange()
        setDeleteConfirmOpen(false)
        setBookingToDelete(null)
        toast({
          title: 'Réservation supprimée',
          description: 'La réservation a été supprimée avec succès.',
        })
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer la réservation.',
          variant: 'destructive',
        })
      }
    })
  }

  const getStatusBadge = (status: BookingStatus) => {
    const statusConfig = {
      confirmed: { label: 'Confirmée', color: 'bg-green-100 text-green-700' },
      pending: { label: 'En attente', color: 'bg-orange-100 text-orange-700' },
      cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-700' },
      blocked: { label: 'Bloquée', color: 'bg-gray-100 text-gray-700' },
    }
    return statusConfig[status] || statusConfig.confirmed
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  const calculateNights = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'NA'
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
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
          Erreur lors du chargement des réservations
        </div>
      </div>
    )
  }

  const sortedBookings = [...(bookings || [])].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0
    let aVal: string | number = ''
    let bVal: string | number = ''

    if (sortColumn === 'client') {
      aVal = `${a.client?.firstName} ${a.client?.lastName}`
      bVal = `${b.client?.firstName} ${b.client?.lastName}`
    } else if (sortColumn === 'property') {
      aVal = a.property?.name || ''
      bVal = b.property?.name || ''
    } else if (sortColumn === 'price') {
      aVal = a.totalPrice
      bVal = b.totalPrice
    } else if (sortColumn === 'startDate') {
      aVal = new Date(a.startDate).getTime()
      bVal = new Date(b.startDate).getTime()
    }

    if (typeof aVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal)
    }
    return sortDirection === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
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
                    checked={selectedIds.length === bookings?.length && (bookings?.length || 0) > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <ColumnHeader
                  label="Client"
                  sortable
                  sortDirection={sortColumn === 'client' ? sortDirection : null}
                  onSort={() => handleSort('client')}
                  className="min-w-[180px]"
                />
                <ColumnHeader
                  label="Propriété"
                  sortable
                  sortDirection={sortColumn === 'property' ? sortDirection : null}
                  onSort={() => handleSort('property')}
                  className="min-w-[180px]"
                />
                <ColumnHeader
                  label="Arrivée"
                  sortable
                  sortDirection={sortColumn === 'startDate' ? sortDirection : null}
                  onSort={() => handleSort('startDate')}
                />
                <th className="h-11 px-4 text-left">
                  <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    Départ
                  </span>
                </th>
                <th className="h-11 px-4 text-left">
                  <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    Nuits
                  </span>
                </th>
                <ColumnHeader
                  label="Montant"
                  sortable
                  sortDirection={sortColumn === 'price' ? sortDirection : null}
                  onSort={() => handleSort('price')}
                  className="min-w-[100px]"
                />
                <th className="h-11 px-4 text-left">
                  <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    Statut
                  </span>
                </th>
                <th className="h-11 w-16 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {sortedBookings.map((booking, idx) => {
                const status = getStatusBadge(booking.status)
                const nights = calculateNights(booking.startDate, booking.endDate)
                const initials = getInitials(booking.client?.firstName, booking.client?.lastName)

                return (
                  <tr
                    key={booking.id}
                    className={cn(
                      'group border-border hover:bg-muted/50 border-b transition-colors',
                      selectedIds.includes(booking.id) && 'bg-primary/5',
                      idx === sortedBookings.length - 1 && 'border-b-0',
                    )}
                  >
                    <td className="h-14 px-4">
                      <Checkbox
                        checked={selectedIds.includes(booking.id)}
                        onCheckedChange={() => toggleSelection(booking.id)}
                      />
                    </td>
                    <td className="h-14 px-4">
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="hover:text-primary flex items-center gap-3"
                      >
                        <div>
                          <p className="text-foreground text-sm font-medium">
                            {booking.client
                              ? `${booking.client.firstName} ${booking.client.lastName}`
                              : 'N/A'}
                          </p>
                          <p className="text-muted-foreground text-xs">{booking.id.slice(0, 8)}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="h-14 px-4">
                      <span className="text-foreground text-sm">
                        {booking.property?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="h-14 px-4">
                      <span className="text-foreground text-sm">
                        {formatDate(booking.startDate)}
                      </span>
                    </td>
                    <td className="h-14 px-4">
                      <span className="text-foreground text-sm">{formatDate(booking.endDate)}</span>
                    </td>
                    <td className="h-14 px-4">
                      <span className="text-muted-foreground text-sm">{nights} nuits</span>
                    </td>
                    <td className="h-14 px-4">
                      <span className="text-foreground text-sm font-semibold">
                        {booking.totalPrice.toLocaleString('fr-FR')} €
                      </span>
                    </td>
                    <td className="h-14 px-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          status.color,
                        )}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="flex h-14 flex-row items-center justify-center px-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Link href={`/bookings/${booking.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => handleDeleteClick(booking.id)}
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
        {sortedBookings.length === 0 && (
          <div className="text-muted-foreground flex items-center justify-center py-12 text-sm">
            Aucune réservation trouvée
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la réservation"
        description="Êtes-vous sûr de vouloir supprimer cette réservation ? La facture associée sera également supprimée. Cette action est irréversible."
      />
    </>
  )
}
