'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettingsMutations } from '../hooks/useSettingsMutations'
import { useToast } from '@/hooks/use-toast'

const MONTHS = [
  { id: 1, short: 'J', name: 'Janvier' },
  { id: 2, short: 'F', name: 'Février' },
  { id: 3, short: 'M', name: 'Mars' },
  { id: 4, short: 'A', name: 'Avril' },
  { id: 5, short: 'M', name: 'Mai' },
  { id: 6, short: 'J', name: 'Juin' },
  { id: 7, short: 'J', name: 'Juillet' },
  { id: 8, short: 'A', name: 'Août' },
  { id: 9, short: 'S', name: 'Septembre' },
  { id: 10, short: 'O', name: 'Octobre' },
  { id: 11, short: 'N', name: 'Novembre' },
  { id: 12, short: 'D', name: 'Décembre' },
]

interface Settings {
  lowSeasonMonths: number[]
  lowSeasonRate: number
  highSeasonRate: number
  linensOptionPrice: number
  cleaningOptionPrice: number
  touristTaxRatePerPersonPerDay: number
  cancellationInsurancePercentage: number
}

export function SeasonSettings({ settings }: { settings: Settings }) {
  const { toast } = useToast()
  const { updateSettings } = useSettingsMutations()
  const [formData, setFormData] = useState({
    lowSeasonMonths: settings.lowSeasonMonths,
    lowSeasonRate: settings.lowSeasonRate,
    highSeasonRate: settings.highSeasonRate,
    linensOptionPrice: settings.linensOptionPrice,
    cleaningOptionPrice: settings.cleaningOptionPrice,
    touristTaxRatePerPersonPerDay: settings.touristTaxRatePerPersonPerDay,
    cancellationInsurancePercentage: settings.cancellationInsurancePercentage,
  })
  const [saving, setSaving] = useState(false)

  const toggleMonth = (monthId: number) => {
    setFormData((prev) => ({
      ...prev,
      lowSeasonMonths: prev.lowSeasonMonths.includes(monthId)
        ? prev.lowSeasonMonths.filter((m) => m !== monthId)
        : [...prev.lowSeasonMonths, monthId],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSettings(formData)
      toast({
        title: 'Paramètres sauvegardés',
        description: 'Les tarifs et saisons ont été mis à jour.',
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les paramètres.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-border bg-card border">
      <CardHeader>
        <CardTitle className="text-lg">Tarification & Saisons</CardTitle>
        <CardDescription>Configurez vos tarifs et options par défaut</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Mois en basse saison</Label>
          <p className="text-muted-foreground text-sm">
            Cliquez sur un mois pour le marquer comme basse saison (en gris)
          </p>
          <div className="flex flex-wrap gap-2">
            {MONTHS.map((month) => {
              const isLowSeason = formData.lowSeasonMonths.includes(month.id)
              return (
                <button
                  key={month.id}
                  onClick={() => toggleMonth(month.id)}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                    isLowSeason
                      ? 'bg-muted text-muted-foreground border-border border'
                      : 'bg-primary text-primary-foreground',
                  )}
                  title={month.name}
                >
                  {month.short}
                </button>
              )
            })}
          </div>
          <div className="text-muted-foreground flex gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="bg-primary h-3 w-3 rounded"></span>
              Haute saison
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-muted border-border h-3 w-3 rounded border"></span>
              Basse saison
            </span>
          </div>
          <p className="text-muted-foreground text-xs">
            Basse saison:{' '}
            {formData.lowSeasonMonths
              .sort((a, b) => a - b)
              .map((m) => MONTHS.find((month) => month.id === m)?.name)
              .join(', ') || 'Aucun'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lowSeasonPrice">Tarif Basse Saison (€/nuit)</Label>
            <Input
              id="lowSeasonPrice"
              type="number"
              value={formData.lowSeasonRate}
              onChange={(e) =>
                setFormData({ ...formData, lowSeasonRate: parseFloat(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="highSeasonPrice">Tarif Haute Saison (€/nuit)</Label>
            <Input
              id="highSeasonPrice"
              type="number"
              value={formData.highSeasonRate}
              onChange={(e) =>
                setFormData({ ...formData, highSeasonRate: parseFloat(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="border-border border-t pt-6">
          <Label className="mb-4 block text-base font-medium">Options par défaut</Label>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="linenPrice">Option linge (€)</Label>
              <Input
                id="linenPrice"
                type="number"
                value={formData.linensOptionPrice}
                onChange={(e) =>
                  setFormData({ ...formData, linensOptionPrice: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cleaningPrice">Option ménage (€)</Label>
              <Input
                id="cleaningPrice"
                type="number"
                value={formData.cleaningOptionPrice}
                onChange={(e) =>
                  setFormData({ ...formData, cleaningOptionPrice: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="touristTax">Taxe de séjour (€/nuit/pers.)</Label>
              <Input
                id="touristTax"
                type="number"
                step="0.01"
                value={formData.touristTaxRatePerPersonPerDay}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    touristTaxRatePerPersonPerDay: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insuranceRate">Taux d&apos;assurance (%)</Label>
              <div className="relative">
                <Input
                  id="insuranceRate"
                  type="number"
                  step="0.1"
                  value={formData.cancellationInsurancePercentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cancellationInsurancePercentage: parseFloat(e.target.value),
                    })
                  }
                  className="pr-8"
                />
                <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
