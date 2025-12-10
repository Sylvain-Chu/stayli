import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useSettings() {
  const { data, error, mutate } = useSWR('/api/settings', fetcher)

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
