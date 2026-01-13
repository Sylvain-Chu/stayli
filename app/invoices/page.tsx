'use client'

import { useState, lazy, Suspense } from 'react'
import { AppLayout } from '@/components/layouts/app-shell'
import { InvoicesToolbar } from '@/features/invoices'
import { InvoicesStats } from '@/features/invoices/components/InvoicesStats'
import { useDebounce } from '@/hooks/use-debounce'
import { InvoicesProvider } from '@/features/invoices/context/InvoicesContext'
import { Skeleton } from '@/components/ui/skeleton'

const InvoicesTable = lazy(() =>
  import('@/features/invoices').then((mod) => ({ default: mod.InvoicesTable })),
)

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  return (
    <InvoicesProvider>
      <AppLayout title="Factures">
        <div className="space-y-4">
          <InvoicesStats />
          <InvoicesToolbar onSearchChange={setSearchQuery} />
          <Suspense
            fallback={
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            }
          >
            <InvoicesTable searchQuery={debouncedSearchQuery} />
          </Suspense>
        </div>
      </AppLayout>
    </InvoicesProvider>
  )
}
