import { useState, useEffect } from 'react'

/**
 * Returns the optimal number of table rows to display without page-level scroll.
 * @param overhead  Total height in px of all fixed elements outside the row area
 * @param rowHeight Height in px of each table row (h-11 = 44px)
 */
export function usePerPage(overhead = 508, rowHeight = 44): number {
  const [perPage, setPerPage] = useState(() => {
    if (typeof window === 'undefined') return 10
    return Math.max(5, Math.floor((window.innerHeight - overhead) / rowHeight))
  })

  useEffect(() => {
    const calculate = () => {
      const result = Math.max(5, Math.floor((window.innerHeight - overhead) / rowHeight))
      console.log('[usePerPage]', { innerHeight: window.innerHeight, overhead, rowHeight, result })
      return result
    }
    let raf = requestAnimationFrame(() => setPerPage(calculate()))
    const handler = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setPerPage(calculate()))
    }
    window.addEventListener('resize', handler)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', handler)
    }
  }, [overhead, rowHeight])

  return perPage
}
