'use client'

import { useCallback } from 'react'
import { useMutations } from '@/hooks/use-mutations'
import * as settingsService from '@/services/settings.service'

export function useSettingsMutations() {
  const { mutateAsync, ...state } = useMutations('/api/settings')

  const updateSettings = useCallback(
    (data: settingsService.UpdateSettingsData) =>
      mutateAsync(() => settingsService.updateSettings(data)),
    [mutateAsync],
  )

  return { updateSettings, ...state }
}
