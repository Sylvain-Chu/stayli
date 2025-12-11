'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useActivities } from '@/hooks/use-dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '../ui'

const tabs = [
  { label: 'Séjours en cours', value: 'current' as const },
  { label: 'Arrivées', value: 'arrivals' as const },
  { label: 'Départs', value: 'departures' as const },
]

export function ActivityCard() {
  const [activeTab, setActiveTab] = useState<'current' | 'arrivals' | 'departures'>('current')
  const { activities, isLoading, isError } = useActivities(activeTab)

  return (
    <Card className="border-border bg-card border">
      <CardHeader className="pb-3">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              variant={activeTab === tab.value ? 'default' : 'ghost'}
              size="sm"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-destructive py-8 text-center text-sm">
            Erreur lors du chargement des activités
          </div>
        ) : activities.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center text-sm">
            Aucune activité trouvée
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((item) => (
              <div
                key={item.id}
                className="border-border flex items-center gap-4 rounded-lg border p-4"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={`/.jpg?height=40&width=40&query=${item.client.name} avatar`}
                    alt={item.client.name}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {item.client.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm font-medium">{item.client.name}</p>
                  <p className="text-foreground text-sm font-semibold">{item.property}</p>
                </div>
                <p className="text-muted-foreground text-sm whitespace-nowrap">{item.dates}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
