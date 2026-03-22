'use client'

import { useEffect, useState } from 'react'
import { useExpenseCategories } from '@/hooks/use-dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const CATEGORY_COLORS: Record<string, string> = {
  energy: '#3b82f6',
  materials: '#f97316',
  maintenance: '#ef4444',
  insurance: '#a855f7',
}

export function ExpenseDonut() {
  const [isMounted, setIsMounted] = useState(false)
  const { data, total, isLoading, isError } = useExpenseCategories()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || isLoading) {
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
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              dataKey="amount"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(value as number)}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 gap-3">
          {data.map((entry) => (
            <div
              key={entry.category}
              className="rounded border border-border p-3"
              style={{ borderLeftColor: CATEGORY_COLORS[entry.category], borderLeftWidth: '3px' }}
            >
              <p className="text-sm text-muted-foreground">{entry.label}</p>
              <p className="mt-1 font-bold" style={{ color: CATEGORY_COLORS[entry.category] }}>
                {formatCurrency(entry.amount)}
              </p>
              <p className="text-xs text-muted-foreground">{entry.percentage.toFixed(1)}%</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
