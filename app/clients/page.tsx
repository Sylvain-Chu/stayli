'use client'

import { useState, lazy, Suspense } from 'react'
import { AppLayout } from '@/components/layouts/app-shell'
import { ClientsToolbar } from '@/features/clients'
import { ClientsStats } from '@/features/clients/components/ClientsStats'
import { useDebounce } from '@/hooks/use-debounce'
import { useClients } from '@/features/clients/hooks/useClients'
import { ClientsProvider } from '@/features/clients/context/ClientsContext'
import { Skeleton } from '@/components/ui/skeleton'

const ClientsTable = lazy(() =>
  import('@/features/clients').then((mod) => ({ default: mod.ClientsTable })),
)

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  return (
    <ClientsProvider>
      <AppLayout title="Clients">
        <div className="space-y-4">
          <ClientsStats />
          <ClientsToolbar onSearchChange={setSearchQuery} />
          <Suspense
            fallback={
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            }
          >
            <ClientsTable searchQuery={debouncedSearchQuery} />
          </Suspense>
        </div>
      </AppLayout>
    </ClientsProvider>
  )
}
