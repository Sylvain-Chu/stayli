/**
 * Shared SWR fetcher
 *
 * - Throws on HTTP errors (parsed from response body)
 * - Auto-unwraps the { success, data } envelope returned by successResponse()
 * - Passes through raw JSON for non-enveloped responses (backward compat)
 */
export async function swrFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message =
      body?.error?.message ?? body?.error ?? body?.message ?? 'An error occurred while loading data'
    const err = new Error(message)
    ;(err as unknown as Record<string, unknown>).status = res.status
    ;(err as unknown as Record<string, unknown>).code = body?.error?.code
    throw err
  }

  const json = await res.json()

  // Auto-unwrap standardised envelope
  if (json && typeof json === 'object' && json.success === true && 'data' in json) {
    return json.data as T
  }

  return json as T
}
