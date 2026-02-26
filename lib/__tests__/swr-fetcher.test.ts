import { describe, it, expect, vi, beforeEach } from 'vitest'
import { swrFetcher } from '../swr-fetcher'

global.fetch = vi.fn()

describe('swrFetcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns raw JSON when no envelope', async () => {
    const data = { clients: [], total: 0 }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => data,
    })

    const result = await swrFetcher('/api/clients')
    expect(result).toEqual(data)
  })

  it('unwraps { success, data } envelope', async () => {
    const inner = { id: '1', name: 'Test' }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: inner }),
    })

    const result = await swrFetcher('/api/something')
    expect(result).toEqual(inner)
  })

  it('throws with body.error.message on HTTP error', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: { message: 'Not found', code: 'NOT_FOUND' } }),
    })

    await expect(swrFetcher('/api/missing')).rejects.toThrow('Not found')
  })

  it('throws with body.error (string) on HTTP error', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Forbidden' }),
    })

    await expect(swrFetcher('/api/secure')).rejects.toThrow('Forbidden')
  })

  it('throws with body.message on HTTP error', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Internal server error' }),
    })

    await expect(swrFetcher('/api/broken')).rejects.toThrow('Internal server error')
  })

  it('falls back to generic message when body is not parseable', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => { throw new Error('invalid json') },
    })

    await expect(swrFetcher('/api/bad')).rejects.toThrow('An error occurred while loading data')
  })

  it('attaches status and code to the error', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ error: { message: 'Unprocessable', code: 'VALIDATION_ERROR' } }),
    })

    const err = await swrFetcher('/api/validate').catch((e) => e)
    expect((err as any).status).toBe(422)
    expect((err as any).code).toBe('VALIDATION_ERROR')
  })
})
