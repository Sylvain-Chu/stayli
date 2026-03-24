'use client'

import { useState, useEffect } from 'react'
import { useExpenseCategories } from '@/hooks/use-dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { PieChart, Pie, ResponsiveContainer } from 'recharts'
import { CATEGORY_COLORS } from '@/features/expenses/constants/colors'

export function ExpenseDonut() {
  const [isMounted, setIsMounted] = useState(false)
  const { data, total, isLoading, isError } = useExpenseCategories()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true)
  }, [])

  // During SSR and hydration: always render skeleton to prevent mismatch
  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dépenses par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  // After hydration: follow actual state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dépenses par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (isError || !data || data.length === 0 || total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dépenses par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center">
            <p className="text-muted-foreground text-sm">Aucune dépense cette année</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dépenses par catégorie</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative w-full" style={{ height: '240px' }}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data.map((entry) => ({
                  ...entry,
                  fill: CATEGORY_COLORS[entry.category],
                }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="amount"
                isAnimationActive={false}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(total)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {data.map((entry) => (
            <div
              key={entry.category}
              className="rounded-lg border border-border bg-muted/30 p-2.5 space-y-1"
              style={{ borderLeftColor: CATEGORY_COLORS[entry.category], borderLeftWidth: '4px' }}
            >
              <p className="text-xs font-medium text-muted-foreground">{entry.label}</p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(entry.amount)}
              </p>
              <p className="text-xs font-semibold rounded px-2 py-1 w-fit" style={{ backgroundColor: `${CATEGORY_COLORS[entry.category]}15`, color: CATEGORY_COLORS[entry.category] }}>
                {entry.percentage.toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
