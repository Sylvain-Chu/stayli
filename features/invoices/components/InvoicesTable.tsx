'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, Trash2, Check } from 'lucide-react'
import { ColumnHeader } from '@/components/ui/data-table'
import { cn } from '@/lib/utils'
import { useInvoices } from '@/features/invoices/hooks/useInvoices'
import { useInvoiceMutations } from '@/features/invoices/hooks/useInvoiceMutations'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import { useState, useTransition } from 'react'
import { useInvoicesContext } from '@/features/invoices/context/InvoicesContext'
import { Invoice } from '../types'

type SortDirection = 'asc' | 'desc' | null

interface InvoicesTableProps {
  searchQuery?: string
}

function getStatusLabel(invoice: Invoice) {
  const now = new Date()
  const dueDate = new Date(invoice.dueDate)

  if (invoice.status === 'paid') return { label: 'Payée', color: 'bg-green-100 text-green-700' }
  if (invoice.status === 'cancelled')
    return { label: 'Annulée', color: 'bg-gray-100 text-gray-700' }
  if (
    invoice.status === 'overdue' ||
    (dueDate < now && (invoice.status === 'sent' || invoice.status === 'draft'))
  ) {
    return { label: 'En retard', color: 'bg-red-100 text-red-700' }
  }
  if (invoice.status === 'sent') return { label: 'Envoyée', color: 'bg-blue-100 text-blue-700' }
  return { label: 'Brouillon', color: 'bg-orange-100 text-orange-700' }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function isOverdue(invoice: Invoice) {
  const now = new Date()
  const dueDate = new Date(invoice.dueDate)
  return dueDate < now && invoice.status !== 'paid'
}

export function InvoicesTable({ searchQuery = '' }: InvoicesTableProps) {
  const { selectedIds, toggleSelection, selectAll, clearSelection } = useInvoicesContext()
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [page, setPage] = useState(1)
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery)
  const perPage = 10

  if (prevSearchQuery !== searchQuery) {
    setPrevSearchQuery(searchQuery)
    setPage(1)
  }
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const { toast } = useToast()
  const { updateInvoice, deleteInvoice } = useInvoiceMutations()

  const { invoices, isLoading, isError, total } = useInvoices(
    searchQuery,
    page,
    perPage,
    sortColumn,
    sortDirection,
  )

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
    if (selectedIds.length === invoices?.length) {
      clearSelection()
    } else {
      selectAll(invoices?.map((i) => i.id) || [])
    }
  }

  const handleDeleteClick = (id: string) => {
    setInvoiceToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleChangeStatus = async (id: string, status: string) => {
    try {
      await updateInvoice(id, { status })
      toast({
        title: 'Statut mis à jour',
        description: `La facture est maintenant marquée comme ${status === 'paid' ? 'payée' : status}.`,
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de changer le statut.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return

    startTransition(async () => {
      try {
        await deleteInvoice(invoiceToDelete)
        setDeleteConfirmOpen(false)
        setInvoiceToDelete(null)
        toast({
          title: 'Facture supprimée',
          description: 'La facture a été supprimée avec succès.',
        })
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer la facture.',
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
          Erreur lors du chargement des factures
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-border bg-muted/40 border-b">
                <th className="h-11 w-12 px-4">
                  <Checkbox
                    checked={selectedIds.length === invoices?.length && (invoices?.length || 0) > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="h-11 min-w-[100px] px-4 text-left">
                  <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    N° Facture
                  </span>
                </th>
                <ColumnHeader
                  label="Client"
                  sortable
                  sortDirection={sortColumn === 'client' ? sortDirection : null}
                  onSort={() => handleSort('client')}
                  className="min-w-40"
                />
                <th className="h-11 px-4 text-left">
                  <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    Réservation
                  </span>
                </th>
                <th className="h-11 px-4 text-left">
                  <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    Émission
                  </span>
                </th>
                <th className="h-11 px-4 text-left">
                  <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    Échéance
                  </span>
                </th>
                <ColumnHeader
                  label="Montant"
                  sortable
                  sortDirection={sortColumn === 'amount' ? sortDirection : null}
                  onSort={() => handleSort('amount')}
                  className="min-w-[100px]"
                />
                <th className="h-11 px-4 text-left">
                  <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    Statut
                  </span>
                </th>
                <th className="h-11 w-24 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {(invoices || []).map((invoice, idx) => {
                const status = getStatusLabel(invoice)
                const overdue = isOverdue(invoice)

                return (
                  <tr
                    key={invoice.id}
                    className={cn(
                      'group border-border hover:bg-muted/50 border-b transition-colors',
                      selectedIds.includes(invoice.id) && 'bg-primary/5',
                      idx === (invoices?.length || 0) - 1 && 'border-b-0',
                    )}
                  >
                    <td className="h-14 px-4">
                      <Checkbox
                        checked={selectedIds.includes(invoice.id)}
                        onCheckedChange={() => toggleSelection(invoice.id)}
                      />
                    </td>
                    <td className="h-14 px-4">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-primary text-sm font-medium hover:underline"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="h-14 px-4">
                      <span className="text-foreground text-sm">
                        {invoice.booking?.client
                          ? `${invoice.booking.client.firstName} ${invoice.booking.client.lastName}`
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="h-14 px-4">
                      <Link
                        href={`/bookings/${invoice.bookingId}`}
                        className="text-muted-foreground hover:text-primary text-sm hover:underline"
                      >
                        {invoice.booking?.property?.name || invoice.bookingId.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="h-14 px-4">
                      <span className="text-foreground text-sm">
                        {formatDate(invoice.issueDate)}
                      </span>
                    </td>
                    <td className="h-14 px-4">
                      <span
                        className={cn(
                          'text-sm',
                          overdue ? 'text-destructive font-medium' : 'text-foreground',
                        )}
                      >
                        {formatDate(invoice.dueDate)}
                      </span>
                    </td>
                    <td className="h-14 px-4">
                      <span className="text-foreground text-sm font-semibold">
                        {invoice.amount.toLocaleString('fr-FR')} €
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
                    <td className="h-14 px-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Marquer comme payée"
                          className={cn(
                            'h-8 w-8 focus-visible:ring-2',
                            (invoice.status === 'paid' || invoice.status === 'cancelled') &&
                              'invisible pointer-events-none',
                          )}
                          onClick={() => handleChangeStatus(invoice.id, 'paid')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Voir la facture"
                          className="h-8 w-8 focus-visible:ring-2"
                          asChild
                        >
                          <Link href={`/invoices/${invoice.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Supprimer la facture"
                          className="text-destructive h-8 w-8 focus-visible:ring-2"
                          onClick={() => handleDeleteClick(invoice.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {(invoices?.length || 0) === 0 && (
          <div className="text-muted-foreground flex items-center justify-center py-12 text-sm">
            Aucune facture trouvée
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la facture"
        description="Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible."
      />

      {total != null && total > perPage && (
        <div className="border-border flex items-center justify-between border-t px-4 py-3">
          <div className="text-muted-foreground text-sm">
            {total} facture{total > 1 ? 's' : ''} au total
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
    </>
  )
}
