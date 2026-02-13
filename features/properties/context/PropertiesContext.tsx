'use client'

import { createSelectionContext } from '@/hooks/use-selection'

const { Provider, useSelection } = createSelectionContext('Properties')

export const PropertiesProvider = Provider
export const usePropertiesContext = useSelection

