import { useCallback } from 'react'
import { useMutations } from '@/hooks/use-mutations'
import * as usersService from '@/services/users.service'
import type { CreateUserData, UpdateUserData } from '@/lib/validations/user'

export function useUserMutations() {
  const { mutateAsync, ...state } = useMutations('/api/users')

  const createUser = useCallback(
    (data: CreateUserData) => mutateAsync(() => usersService.createUser(data)),
    [mutateAsync],
  )

  const updateUser = useCallback(
    (id: string, data: UpdateUserData) => mutateAsync(() => usersService.updateUser(id, data)),
    [mutateAsync],
  )

  const deleteUser = useCallback(
    (id: string) => mutateAsync(() => usersService.deleteUser(id)),
    [mutateAsync],
  )

  return { createUser, updateUser, deleteUser, ...state }
}
