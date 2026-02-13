'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { MoreHorizontal, Eye, Download, Trash2, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ColumnHeader } from '@/components/ui/data-table'
import { cn } from '@/lib/utils'
import { useInvoices } from '@/features/invoices/hooks/useInvoices'
import { useInvoiceMutations } from '@/features/invoices/hooks/useInvoiceMutations'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import { useEffect, useState, useTransition } from 'react'
import { useInvoicesContext } from '@/features/invoices/context/InvoicesContext'
import { Invoice } from '../types'

type SortDirection = 'asc' | 'desc' | null

interface InvoicesTableProps {
  searchQuery?: string
}

export function InvoicesTable({ searchQuery = '' }: InvoicesTableProps) {
  const { selectedIds, toggleSelection, selectAll, clearSelection } = useInvoicesContext()
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [page, setPage] = useState(1)
  const perPage = 10
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const { updateInvoice, deleteInvoice } = useInvoiceMutations()

  const { invoices, isLoading, isError, total, mutate } = useInvoices(searchQuery, page, perPage)

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

  const getStatusLabel = (invoice: Invoice) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  const isOverdue = (invoice: Invoice) => {
    const now = new Date()
    const dueDate = new Date(invoice.dueDate)
    return dueDate < now && invoice.status !== 'paid'
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

  const sortedInvoices = [...(invoices || [])].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0
    let aVal: string | number = ''
    let bVal: string | number = ''

    if (sortColumn === 'client') {
      aVal = `${a.booking?.client?.firstName} ${a.booking?.client?.lastName}`
      bVal = `${b.booking?.client?.firstName} ${b.booking?.client?.lastName}`
    } else if (sortColumn === 'amount') {
      aVal = a.amount
      bVal = b.amount
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
              {sortedInvoices.map((invoice, idx) => {
                const status = getStatusLabel(invoice)
                const overdue = isOverdue(invoice)

                return (
                  <tr
                    key={invoice.id}
                    className={cn(
                      'group border-border hover:bg-muted/50 border-b transition-colors',
                      selectedIds.includes(invoice.id) && 'bg-primary/5',
                      idx === sortedInvoices.length - 1 && 'border-b-0',
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
                        {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                            title="Marquer comme payée"
                            onClick={() => handleChangeStatus(invoice.id, 'paid')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                          asChild
                        >
                          <Link href={`/invoices/${invoice.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
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
        {sortedInvoices.length === 0 && (
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
    </>
  )
}
