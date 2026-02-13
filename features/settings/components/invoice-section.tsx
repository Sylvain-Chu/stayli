'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Save } from 'lucide-react'
import { useSettingsMutations } from '../hooks/useSettingsMutations'
import { useToast } from '@/hooks/use-toast'

interface Settings {
  invoicePrefix: string
  invoiceDueDays: number
  invoicePaymentInstructions: string | null
}

export function InvoiceSettings({ settings }: { settings: Settings }) {
  const { toast } = useToast()
  const { updateSettings } = useSettingsMutations()
  const [formData, setFormData] = useState({
    invoicePrefix: settings.invoicePrefix,
    invoiceDueDays: settings.invoiceDueDays,
    invoicePaymentInstructions: settings.invoicePaymentInstructions || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSettings(formData)
      toast({
        title: 'Paramètres sauvegardés',
        description: 'Les paramètres de facturation ont été mis à jour.',
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
        <CardTitle className="text-lg">Facturation</CardTitle>
        <CardDescription>Paramètres pour la génération de factures</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="invoicePrefix">Préfixe des factures</Label>
            <Input
              id="invoicePrefix"
              value={formData.invoicePrefix}
              onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
              placeholder="INV-"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentDays">Délai de paiement (jours)</Label>
            <Input
              id="paymentDays"
              type="number"
              value={formData.invoiceDueDays}
              onChange={(e) =>
                setFormData({ ...formData, invoiceDueDays: parseInt(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentInstructions">Instructions de paiement</Label>
          <Textarea
            id="paymentInstructions"
            value={formData.invoicePaymentInstructions}
            onChange={(e) =>
              setFormData({ ...formData, invoicePaymentInstructions: e.target.value })
            }
            placeholder="Ajoutez des instructions de paiement (IBAN, RIB, etc.)"
            rows={4}
          />
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
