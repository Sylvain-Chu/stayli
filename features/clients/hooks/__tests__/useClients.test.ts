import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { useClients } from '../useClients'
import { swrFetcher } from '@/lib/swr-fetcher'
import React from 'react'

// Mock fetch
global.fetch = vi.fn()

// Wrapper: fresh cache + global fetcher (SWR v2 has no built-in default fetcher)
const wrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), fetcher: swrFetcher } },
    children,
  )
}

describe('useClients', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch clients successfully', async () => {
    const mockData = {
      clients: [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '123456789',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
      ],
      total: 1,
      totalPages: 1,
    }

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const { result } = renderHook(() => useClients(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.clients).toEqual(mockData.clients)
    expect(result.current.total).toBe(1)
  })

  it('should handle search query', async () => {
    const mockData = {
      clients: [],
      total: 0,
      totalPages: 0,
    }

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const { result } = renderHook(() => useClients('John'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/clients?page=1&perPage=10&q=John')
  })

  it('should include sortBy and sortDir in query when provided', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clients: [], total: 0, totalPages: 0 }),
    })

    const { result } = renderHook(() => useClients(undefined, 1, 10, 'lastName', 'asc'), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/clients?page=1&perPage=10&sortBy=lastName&sortDir=asc',
    )
  })

  it('should handle error', async () => {
    ;(global.fetch as any).mockRejectedValueOnce(new Error('Failed to fetch'))

    const { result } = renderHook(() => useClients(), { wrapper })

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false)
      },
      { timeout: 3000 },
    )

    expect(result.current.clients).toBeUndefined()
    expect(result.current.total).toBeUndefined()
  })
})
