'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PhoneInput } from '@/components/ui/phone-input'
import { SiretInput } from '@/components/ui/siret-input'
import { Upload, Save, Loader2, Check } from 'lucide-react'
import { updateSettings } from '../hooks/useSettings'
import { useToast } from '@/hooks/use-toast'
import { isValidFrenchPhone, isValidSiret } from '@/lib/utils'

interface Settings {
  companyName: string
  companyAddress: string | null
  companyZipCode: string | null
  companyCity: string | null
  companyPhoneNumber: string | null
  companyEmail: string | null
  companySiret: string | null
  companyLogoUrl: string | null
}

export function CompanySettings({ settings }: { settings: Settings }) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    companyName: settings.companyName,
    companyAddress: settings.companyAddress || '',
    companyZipCode: settings.companyZipCode || '',
    companyCity: settings.companyCity || '',
    companyPhoneNumber: settings.companyPhoneNumber || '',
    companyEmail: settings.companyEmail || '',
    companySiret: settings.companySiret || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    // Validate phone if provided
    if (formData.companyPhoneNumber && !isValidFrenchPhone(formData.companyPhoneNumber)) {
      toast({
        title: 'Erreur de validation',
        description: "Le numéro de téléphone n'est pas valide. Format attendu : +33 X XX XX XX XX",
        variant: 'destructive',
      })
      return
    }

    // Validate SIRET if provided
    if (formData.companySiret && !isValidSiret(formData.companySiret)) {
      toast({
        title: 'Erreur de validation',
        description: 'Le numéro SIRET doit contenir exactement 14 chiffres.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    setSaved(false)
    try {
      await updateSettings(formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      toast({
        title: 'Paramètres sauvegardés',
        description: "Les informations de l'entreprise ont été mises à jour.",
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
        <CardTitle className="text-lg">Entreprise</CardTitle>
        <CardDescription>
          Informations de votre entreprise affichées sur les documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nom de l&apos;entreprise</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siret">Numéro SIRET</Label>
            <SiretInput
              id="siret"
              value={formData.companySiret}
              onChange={(value) => setFormData({ ...formData, companySiret: value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse (Rue)</Label>
          <Input
            id="address"
            value={formData.companyAddress}
            onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
            placeholder="123 Rue de la Paix"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="zipCode">Code Postal</Label>
            <Input
              id="zipCode"
              value={formData.companyZipCode}
              onChange={(e) => setFormData({ ...formData, companyZipCode: e.target.value })}
              placeholder="75000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              value={formData.companyCity}
              onChange={(e) => setFormData({ ...formData, companyCity: e.target.value })}
              placeholder="Paris"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <PhoneInput
              id="phone"
              value={formData.companyPhoneNumber}
              onChange={(value) => setFormData({ ...formData, companyPhoneNumber: value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.companyEmail}
              onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
              placeholder="contact@entreprise.fr"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Logo</Label>
          <div className="flex items-center gap-4">
            <div className="border-border bg-muted/30 flex h-20 w-20 items-center justify-center rounded-lg border border-dashed">
              <span className="text-muted-foreground text-xl font-bold">
                {formData.companyName.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <Button variant="outline" className="bg-transparent">
              <Upload className="mr-2 h-4 w-4" />
              Changer le logo
            </Button>
          </div>
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
