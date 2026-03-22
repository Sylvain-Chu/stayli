'use client'

import { useEffect, useState } from 'react'
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

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-foreground mb-2">{payload[0].payload.month}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="text-xs flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function RevenueChart() {
  const [isMounted, setIsMounted] = useState(false)
  const { data, isLoading, isError } = useRevenueVsExpenses()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Prevent hydration mismatch by only rendering on client
  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenus vs Dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[360px] w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenus vs Dépenses</CardTitle>
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
          <CardTitle>Revenus vs Dépenses</CardTitle>
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
        <CardTitle>Revenus vs Dépenses vs Bénéfice</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart
            data={data}
            margin={{ top: 15, right: 30, left: 0, bottom: 0 }}
          >
            {/* Discreet grid */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.15}
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tickFormatter={(value) => {
                if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
                return value.toString()
              }}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={45}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, opacity: 0.5 }}
            />

            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => {
                if (value === 'revenue') return 'Revenus'
                if (value === 'expenses') return 'Dépenses'
                if (value === 'netProfit') return 'Bénéfice net'
                return value
              }}
              iconType="line"
            />

            {/* Revenue line - soft green */}
            <Line
              type="natural"
              dataKey="revenue"
              stroke="#4ade80"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: '#4ade80' }}
              isAnimationActive
              animationDuration={800}
              opacity={0.85}
            />

            {/* Expenses line - soft red */}
            <Line
              type="natural"
              dataKey="expenses"
              stroke="#fb7185"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: '#fb7185' }}
              isAnimationActive
              animationDuration={800}
              opacity={0.85}
            />

            {/* Net profit line - purple (dashed) */}
            <Line
              type="natural"
              dataKey="netProfit"
              stroke="#d8b4fe"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#d8b4fe' }}
              isAnimationActive
              animationDuration={800}
              strokeDasharray="5 5"
              opacity={0.8}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
