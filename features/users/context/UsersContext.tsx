'use client'

import { createSelectionContext } from '@/hooks/use-selection'

const { Provider, useSelection } = createSelectionContext('Users')

export const UsersProvider = Provider
export const useUsersContext = useSelection
