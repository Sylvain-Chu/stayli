'use client'

import { useCallback } from 'react'
import { useMutations } from '@/hooks/use-mutations'
import * as invoicesService from '@/services/invoices.service'

export function useInvoiceMutations() {
  const { mutateAsync, ...state } = useMutations('/api/invoices')

  const createInvoice = useCallback(
    (data: invoicesService.CreateInvoiceData) =>
      mutateAsync(() => invoicesService.createInvoice(data)),
    [mutateAsync],
  )

  const updateInvoice = useCallback(
    (id: string, data: invoicesService.UpdateInvoiceData) =>
      mutateAsync(() => invoicesService.updateInvoice(id, data)),
    [mutateAsync],
  )

  const deleteInvoice = useCallback(
    (id: string) => mutateAsync(() => invoicesService.deleteInvoice(id)),
    [mutateAsync],
  )

  const deleteInvoices = useCallback(
    (ids: string[]) => mutateAsync(() => invoicesService.deleteInvoices(ids)),
    [mutateAsync],
  )

  return { createInvoice, updateInvoice, deleteInvoice, deleteInvoices, ...state }
}
