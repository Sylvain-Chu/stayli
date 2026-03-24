'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign } from 'lucide-react'
import { useExpenseStats } from '../hooks/useExpenseStats'
import { EXPENSE_CATEGORY_CONFIG } from '@/types/entities'
import { CATEGORY_ICONS } from '../constants'
import type { ExpenseCategory } from '../types'

const categoryColors: Record<ExpenseCategory, { bg: string; icon: string; iconBg: string }> = {
  energy: { bg: 'bg-gray-50', icon: 'text-amber-600', iconBg: 'bg-amber-100' },
  materials: { bg: 'bg-gray-50', icon: 'text-blue-600', iconBg: 'bg-blue-100' },
  maintenance: { bg: 'bg-gray-50', icon: 'text-red-600', iconBg: 'bg-red-100' },
  insurance: { bg: 'bg-gray-50', icon: 'text-purple-600', iconBg: 'bg-purple-100' },
}

export function ExpensesStats() {
  const { stats, isLoading } = useExpenseStats()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[100px] col-span-full" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-4">
      {/* Hero Card - Total Dépenses */}
      <div className="rounded-lg border border-green-200 bg-linear-to-br from-green-50 to-green-100/50 p-5 shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Dépenses Totales</p>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-4xl font-bold text-gray-900">{stats.totalAmount.toLocaleString('fr-FR')}</p>
              <span className="text-lg text-gray-600">€</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Entrées</p>
            <p className="mt-3 text-3xl font-bold text-green-600">{stats.total}</p>
          </div>
          <div className="rounded-full bg-green-600/10 p-3 shrink-0">
            <DollarSign className="h-7 w-7 text-green-600" />
          </div>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {(Object.entries(stats.byCategory) as [ExpenseCategory, number][]).map(([category, amount]) => {
          const Icon = CATEGORY_ICONS[category]
          const colors = categoryColors[category]
          const config = EXPENSE_CATEGORY_CONFIG[category]
          const percentage = stats.totalAmount > 0 ? ((amount / stats.totalAmount) * 100).toFixed(0) : 0

          return (
            <div
              key={category}
              className={`rounded-lg border border-gray-200 ${colors.bg} p-5 h-32 flex flex-col justify-between transition-all hover:shadow-md`}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{config.label}</p>
              </div>
              <div className="flex items-end justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-bold text-gray-900">{amount.toLocaleString('fr-FR')}</p>
                    <span className="text-sm text-gray-600">€</span>
                  </div>
                  {stats.totalAmount > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      <span className={`font-semibold ${colors.icon}`}>{percentage}%</span> du total
                    </p>
                  )}
                </div>
                <div className={`rounded-full ${colors.iconBg} p-3 shrink-0`}>
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
