'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const tabs = ['Séjours en cours', 'Arrivées', 'Départs']

const activityData = {
  'Séjours en cours': [
    {
      id: 1,
      client: 'Marie Dupont',
      avatar: 'MD',
      property: 'Villa Méditerranée',
      dates: '5 déc - 12 déc 2025',
    },
    {
      id: 2,
      client: 'Pierre Martin',
      avatar: 'PM',
      property: 'Appartement Centre-Ville',
      dates: '8 déc - 15 déc 2025',
    },
    {
      id: 3,
      client: 'Sophie Bernard',
      avatar: 'SB',
      property: 'Chalet Montagne',
      dates: '1 déc - 14 déc 2025',
    },
  ],
  Arrivées: [
    {
      id: 4,
      client: 'Jean Lefebvre',
      avatar: 'JL',
      property: 'Studio Plage',
      dates: '10 déc 2025',
    },
    {
      id: 5,
      client: 'Claire Moreau',
      avatar: 'CM',
      property: 'Maison de Campagne',
      dates: '11 déc 2025',
    },
  ],
  Départs: [
    {
      id: 6,
      client: 'Lucas Petit',
      avatar: 'LP',
      property: 'Loft Industriel',
      dates: '9 déc 2025',
    },
    {
      id: 7,
      client: 'Emma Robert',
      avatar: 'ER',
      property: 'Villa Méditerranée',
      dates: '12 déc 2025',
    },
  ],
}

export function ActivityCard() {
  const [activeTab, setActiveTab] = useState(tabs[0])

  return (
    <Card className="border-border bg-card border">
      <CardHeader className="pb-3">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {activityData[activeTab as keyof typeof activityData].map((item) => (
            <div
              key={item.id}
              className="border-border flex items-center gap-4 rounded-lg border p-4"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={`/.jpg?height=40&width=40&query=${item.client} avatar`}
                  alt={item.client}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {item.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-sm font-medium">{item.client}</p>
                <p className="text-foreground text-sm font-semibold">{item.property}</p>
              </div>
              <p className="text-muted-foreground text-sm whitespace-nowrap">{item.dates}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
