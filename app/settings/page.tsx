'use client'

import { AppLayout } from '@/components/layouts/app-shell'
import { CompanySettings, SeasonSettings, InvoiceSettings } from '@/features/settings'
import { useSettings } from '@/features/settings/hooks/useSettings'
import { Card, CardContent } from '@/components/ui/card'

export default function SettingsPage() {
  const { settings, isLoading } = useSettings()

  if (isLoading) {
    return (
      <AppLayout title="Paramètres">
        <Card>
          <CardContent className="py-10">
            <p className="text-muted-foreground text-center">Chargement des paramètres...</p>
          </CardContent>
        </Card>
      </AppLayout>
    )
  }

  if (!settings) {
    return (
      <AppLayout title="Paramètres">
        <Card>
          <CardContent className="py-10">
            <p className="text-muted-foreground text-center">
              Erreur lors du chargement des paramètres
            </p>
          </CardContent>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Paramètres">
      <div className="space-y-6 pb-24">
        <CompanySettings settings={settings} />
        <SeasonSettings settings={settings} />
        <InvoiceSettings settings={settings} />
      </div>
    </AppLayout>
  )
}
