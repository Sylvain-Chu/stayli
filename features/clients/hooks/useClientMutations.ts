'use client'

import { useCallback } from 'react'
import { useMutations } from '@/hooks/use-mutations'
import * as clientsService from '@/services/clients.service'

export function useClientMutations() {
  const { mutateAsync, ...state } = useMutations('/api/clients')

  const createClient = useCallback(
    (data: clientsService.CreateClientData) =>
      mutateAsync(() => clientsService.createClient(data)),
    [mutateAsync],
  )

  const updateClient = useCallback(
    (id: string, data: clientsService.UpdateClientData) =>
      mutateAsync(() => clientsService.updateClient(id, data)),
    [mutateAsync],
  )

  const deleteClient = useCallback(
    (id: string) => mutateAsync(() => clientsService.deleteClient(id)),
    [mutateAsync],
  )

  const deleteClients = useCallback(
    (ids: string[]) => mutateAsync(() => clientsService.deleteClients(ids)),
    [mutateAsync],
  )

  return { createClient, updateClient, deleteClient, deleteClients, ...state }
}
