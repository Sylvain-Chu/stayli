'use client'

import { createSelectionContext } from '@/hooks/use-selection'

const { Provider, useSelection } = createSelectionContext('Clients')

export const ClientsProvider = Provider
export const useClientsContext = useSelection

