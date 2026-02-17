'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Save, Loader2, Check } from 'lucide-react'
import { useSettingsMutations } from '../hooks/useSettingsMutations'
import { useToast } from '@/hooks/use-toast'

interface Settings {
  depositPercentage: number
  securityDepositAmount: number
  checkInTime: string
  checkOutTime: string
  cancellationInsuranceProviderName: string
}

export function ContractSettings({ settings }: { settings: Settings }) {
  const { toast } = useToast()
  const { updateSettings } = useSettingsMutations()
  const [formData, setFormData] = useState({
    depositPercentage: settings.depositPercentage ?? 25,
    securityDepositAmount: settings.securityDepositAmount ?? 0,
    checkInTime: settings.checkInTime ?? '14:00',
    checkOutTime: settings.checkOutTime ?? '10:00',
    cancellationInsuranceProviderName:
      settings.cancellationInsuranceProviderName ?? 'Holiday Peace of Mind Insurance',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await updateSettings(formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      toast({
        title: 'Paramètres sauvegardés',
        description: 'Les paramètres du contrat ont été mis à jour.',
      })
    } catch {
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
        <CardTitle className="text-lg">Contrat de location</CardTitle>
        <CardDescription>
          Paramètres utilisés pour la génération des contrats de location saisonnière
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="depositPercentage">Acompte à la réservation (%)</Label>
            <div className="relative">
              <Input
                id="depositPercentage"
                type="number"
                min={0}
                max={100}
                value={formData.depositPercentage}
                onChange={(e) =>
                  setFormData({ ...formData, depositPercentage: parseFloat(e.target.value) || 0 })
                }
                className="pr-8"
              />
              <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2">
                %
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              Pourcentage du montant total demandé comme acompte
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="securityDeposit">Dépôt de garantie (€)</Label>
            <div className="relative">
              <Input
                id="securityDeposit"
                type="number"
                min={0}
                value={formData.securityDepositAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    securityDepositAmount: parseFloat(e.target.value) || 0,
                  })
                }
                className="pr-8"
              />
              <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2">
                €
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              Caution demandée à l&apos;arrivée pour couvrir d&apos;éventuelles dégradations. 0 pour
              ne pas afficher.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="checkInTime">Heure d&apos;arrivée</Label>
            <Input
              id="checkInTime"
              type="time"
              value={formData.checkInTime}
              onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkOutTime">Heure de départ</Label>
            <Input
              id="checkOutTime"
              type="time"
              value={formData.checkOutTime}
              onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="insuranceProvider">Nom de la compagnie d&apos;assurance annulation</Label>
          <Input
            id="insuranceProvider"
            value={formData.cancellationInsuranceProviderName}
            onChange={(e) =>
              setFormData({ ...formData, cancellationInsuranceProviderName: e.target.value })
            }
            placeholder="Nom de l'assureur partenaire"
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="min-w-[140px] transition-all duration-300"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sauvegarde...
              </>
            ) : saved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Sauvegardé !
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
