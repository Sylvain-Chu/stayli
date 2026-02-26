'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layouts/app-shell'
import { UsersProvider, UsersToolbar, UsersTable } from '@/features/users'
import { useDebounce } from '@/hooks/use-debounce'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 500)

  // Redirect non-admins
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session?.user?.role, router])

  if (status === 'loading') {
    return (
      <AppLayout title="Utilisateurs">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-full" />
          <div className="h-64 bg-muted rounded w-full" />
        </div>
      </AppLayout>
    )
  }

  return (
    <UsersProvider>
      <AppLayout title="Utilisateurs">
        <div className="space-y-4">
          <UsersToolbar onSearchChange={setSearchQuery} />
          <UsersTable searchQuery={debouncedSearch} />
        </div>
      </AppLayout>
    </UsersProvider>
  )
}
