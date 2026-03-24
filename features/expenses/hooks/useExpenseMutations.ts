'use client'

import { useCallback } from 'react'
import { useMutations } from '@/hooks/use-mutations'
import * as expensesService from '@/services/expenses.service'

export function useExpenseMutations() {
  const { mutateAsync, ...state } = useMutations('/api/expenses')

  const createExpense = useCallback(
    (data: expensesService.CreateExpenseData) =>
      mutateAsync(() => expensesService.createExpense(data)),
    [mutateAsync],
  )

  const updateExpense = useCallback(
    (id: string, data: expensesService.UpdateExpenseData) =>
      mutateAsync(() => expensesService.updateExpense(id, data)),
    [mutateAsync],
  )

  const deleteExpense = useCallback(
    (id: string) => mutateAsync(() => expensesService.deleteExpense(id)),
    [mutateAsync],
  )

  const deleteExpenses = useCallback(
    (ids: string[]) => mutateAsync(() => expensesService.deleteExpenses(ids)),
    [mutateAsync],
  )

  return { createExpense, updateExpense, deleteExpense, deleteExpenses, ...state }
}
