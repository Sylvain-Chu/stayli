'use client'

import { useState, lazy, Suspense } from 'react'
import { AppLayout } from '@/components/layouts/app-shell'
import { PropertiesToolbar } from '@/features/properties'
import { PropertiesStats } from '@/features/properties/components/PropertiesStats'
import { useDebounce } from '@/hooks/use-debounce'
import { PropertiesProvider } from '@/features/properties/context/PropertiesContext'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load the table component
const PropertiesTable = lazy(() =>
  import('@/features/properties').then((mod) => ({ default: mod.PropertiesTable })),
)

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  return (
    <PropertiesProvider>
      <AppLayout title="Propriétés">
        <div className="space-y-4">
          <PropertiesStats />
          <PropertiesToolbar />
          <Suspense
            fallback={
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            }
          >
            <PropertiesTable searchQuery={debouncedSearchQuery} />
          </Suspense>
        </div>
      </AppLayout>
    </PropertiesProvider>
  )
}
