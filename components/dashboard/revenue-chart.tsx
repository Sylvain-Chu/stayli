'use client'

import { useState, useEffect } from 'react'
import { useRevenueVsExpenses } from '@/hooks/use-dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) return null

  const labels: Record<string, string> = {
    revenue: 'Revenus',
    expenses: 'Dépenses',
    netProfit: 'Bénéfice net',
  }

  return (
    <div className="bg-card border-border rounded-lg border p-3 shadow-lg">
      <p className="text-foreground mb-2 text-sm font-medium">{payload[0].payload.month}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{labels[entry.dataKey] || entry.name}:</span>
          <span className="text-foreground font-semibold">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function RevenueChart() {
  const [isMounted, setIsMounted] = useState(false)
  const { data, isLoading, isError } = useRevenueVsExpenses()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true)
  }, [])

  if (!isMounted || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Flux Financiers</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[360px] w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (isError || !data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Flux Financiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[360px] items-center justify-center">
            <p className="text-destructive text-sm">Erreur lors du chargement du graphique</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Flux Financiers</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => {
                const labels: Record<string, string> = {
                  revenue: 'Revenus',
                  expenses: 'Dépenses',
                  netProfit: 'Bénéfice net',
                }
                return labels[value] || value
              }}
            />
            <Line type="monotone" dataKey="revenue" stroke="#4ade80" />
            <Line type="monotone" dataKey="expenses" stroke="#fb7185" />
            <Line type="monotone" dataKey="netProfit" stroke="#d8b4fe" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
