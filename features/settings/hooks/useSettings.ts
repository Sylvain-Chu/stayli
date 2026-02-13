import useSWR from 'swr'

export function useSettings() {
  const { data, error, mutate } = useSWR('/api/settings')

  return {
    settings: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}

export async function updateSettings(settingsData: any) {
  const response = await fetch('/api/settings', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settingsData),
  })

  if (!response.ok) {
    throw new Error('Failed to update settings')
  }

  return response.json()
}
