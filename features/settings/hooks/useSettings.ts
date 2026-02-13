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

