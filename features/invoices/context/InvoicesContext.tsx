'use client'

import { createSelectionContext } from '@/hooks/use-selection'

const { Provider, useSelection } = createSelectionContext('Invoices')

export const InvoicesProvider = Provider
export const useInvoicesContext = useSelection

