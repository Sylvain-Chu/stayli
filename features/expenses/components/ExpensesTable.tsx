'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Trash2, Receipt, Plus, Pencil } from 'lucide-react'
import { useExpenses } from '../hooks/useExpenses'
import { useExpenseMutations } from '../hooks/useExpenseMutations'
import { useProperties } from '@/features/properties/hooks/useProperties'
import { AddExpenseDialog } from './AddExpenseDialog'
import { EXPENSE_CATEGORY_CONFIG } from '@/types/entities'
import { formatDate } from '@/lib/utils'
import type { ExpenseCategory } from '../types'
import type { Expense } from '../types'

interface ExpensesTableProps {
  propertyId?: string
  category?: string
}

export function ExpensesTable({ propertyId, category }: ExpensesTableProps) {
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)
  const { expenses, isLoading } = useExpenses('', page, perPage, propertyId, category)
  const { deleteExpense } = useExpenseMutations()
  const { properties = [] } = useProperties('', 1, 100)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      await deleteExpense(id)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-gray-200 p-4">
            <Receipt className="h-8 w-8 text-gray-500" />
          </div>
          <div>
            <p className="text-base font-medium text-gray-900">Aucune dépense trouvée</p>
            <p className="mt-1 text-sm text-gray-600">Commencez par ajouter votre première dépense</p>
          </div>
          <Button variant="outline" size="sm" className="mt-2">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une dépense
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Propriété</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Catégorie</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fournisseur</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Montant</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {expenses.map((expense) => {
              const categoryConfig = EXPENSE_CATEGORY_CONFIG[expense.category as ExpenseCategory]
              return (
                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm">{formatDate(expense.date)}</td>
                  <td className="px-4 py-3 text-sm">{expense.property?.name || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${categoryConfig.bgColor} ${categoryConfig.color}`}>
                      {categoryConfig.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{expense.supplier || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{expense.description || '-'}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium">
                    {expense.amount.toLocaleString('fr-FR')} €
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(expense)}
                      className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(expense.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
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

      <AddExpenseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        properties={properties}
        expense={editingExpense}
      />
    </>
  )
}
