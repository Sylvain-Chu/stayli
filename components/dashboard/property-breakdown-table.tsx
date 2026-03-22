'use client'

import { useEffect, useState } from 'react'
import { usePropertyBreakdown } from '@/hooks/use-dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'

export function PropertyBreakdownTable() {
  const [isMounted, setIsMounted] = useState(false)
  const { data, isLoading, isError } = usePropertyBreakdown()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyse par propriété</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyse par propriété</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError || !data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyse par propriété</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-center justify-center">
            <p className="text-destructive text-sm">Erreur lors du chargement des données</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyse par propriété</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                  Propriété
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">
                  Revenus
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">
                  Dépenses
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">
                  Bénéfice net
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">
                  ROI
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((property) => (
                <tr key={property.propertyId} className="border-b border-border h-12 align-middle last:border-0">
                  <td className="px-4 py-3 text-sm font-medium">{property.propertyName}</td>
                  <td className="px-4 py-3 text-right text-sm">{formatCurrency(property.revenue)}</td>
                  <td className="px-4 py-3 text-right text-sm">{formatCurrency(property.expenses)}</td>
                  <td
                    className={`px-4 py-3 text-right text-sm font-medium ${
                      property.netProfit >= 0
                        ? 'text-primary'
                        : 'text-destructive'
                    }`}
                  >
                    {formatCurrency(property.netProfit)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right text-sm font-medium ${
                      property.roi !== null && property.roi >= 0
                        ? 'text-primary'
                        : 'text-destructive'
                    }`}
                  >
                    {property.roi !== null ? `${property.roi.toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
