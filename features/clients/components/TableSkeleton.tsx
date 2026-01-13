'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function ClientsTableSkeleton() {
  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-border bg-muted/40 border-b">
              <th className="h-11 w-12 px-4">
                <Skeleton className="h-4 w-4" />
              </th>
              <th className="h-11 min-w-[200px] px-4 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="h-11 min-w-[220px] px-4 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="h-11 px-4 text-left">
                <Skeleton className="h-4 w-24" />
              </th>
              <th className="h-11 px-4 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="h-11 w-16 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 7 }).map((_, idx) => (
              <tr key={idx} className="border-border border-b">
                <td className="h-14 px-4">
                  <Skeleton className="h-4 w-4" />
                </td>
                <td className="h-14 px-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-32" />
                  </div>
                </td>
                <td className="h-14 px-4">
                  <Skeleton className="h-4 w-40" />
                </td>
                <td className="h-14 px-4">
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className="h-14 px-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="h-14 px-4">
                  <Skeleton className="h-8 w-8" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
