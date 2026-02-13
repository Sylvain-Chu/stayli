'use client'

import { useCallback } from 'react'
import { useMutations } from '@/hooks/use-mutations'
import * as propertiesService from '@/services/properties.service'
import type { Property } from '@/types/entities'

export function usePropertyMutations() {
  const { mutateAsync, ...state } = useMutations('/api/properties')

  const createProperty = useCallback(
    (data: propertiesService.CreatePropertyData) =>
      mutateAsync(() => propertiesService.createProperty(data)),
    [mutateAsync],
  )

  const updateProperty = useCallback(
    (id: string, data: propertiesService.UpdatePropertyData) =>
      mutateAsync(() => propertiesService.updateProperty(id, data)),
    [mutateAsync],
  )

  const deleteProperty = useCallback(
    (id: string) => mutateAsync(() => propertiesService.deleteProperty(id)),
    [mutateAsync],
  )

  const deleteProperties = useCallback(
    (ids: string[]) =>
      mutateAsync(() => Promise.all(ids.map((id) => propertiesService.deleteProperty(id)))),
    [mutateAsync],
  )

  return { createProperty, updateProperty, deleteProperty, deleteProperties, ...state }
}
