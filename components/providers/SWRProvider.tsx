'use client'

import { SWRConfig } from 'swr'
import { ReactNode } from 'react'
import { swrFetcher } from '@/lib/swr-fetcher'

export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        revalidateOnFocus: false,
      }}
    >
      {children}
    </SWRConfig>
  )
}
