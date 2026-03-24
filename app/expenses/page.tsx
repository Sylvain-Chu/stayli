'use client'

import { useState, lazy, Suspense } from 'react'
import { AppLayout } from '@/components/layouts/app-shell'
import { ExpensesToolbar, ExpensesStats } from '@/features/expenses'
import { AddExpenseDialog } from '@/features/expenses/components/AddExpenseDialog'
import { useDebounce } from '@/hooks/use-debounce'
import { Skeleton } from '@/components/ui/skeleton'
import { useProperties } from '@/features/properties/hooks/useProperties'

const ExpensesTable = lazy(() =>
  import('@/features/expenses').then((mod) => ({ default: mod.ExpensesTable })),
)

export default function ExpensesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const { properties = [] } = useProperties('', 1, 100)

  return (
    <AppLayout title="Dépenses">
      <div className="space-y-4">
        <ExpensesStats />
        <ExpensesToolbar
          properties={properties}
          onSearchChange={setSearchQuery}
          onPropertyChange={setSelectedPropertyId}
          onCategoryChange={setSelectedCategory}
          onAddClick={() => setIsDialogOpen(true)}
        />
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          }
        >
          <ExpensesTable propertyId={selectedPropertyId || undefined} category={selectedCategory || undefined} />
        </Suspense>
      </div>

      <AddExpenseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        properties={properties}
      />
    </AppLayout>
  )
}
