'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PhoneInput } from '@/components/ui/phone-input'
import { SiretInput } from '@/components/ui/siret-input'
import { Upload, Save, Loader2, Check, X } from 'lucide-react'
import { useSettingsMutations } from '../hooks/useSettingsMutations'
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
  const { updateSettings } = useSettingsMutations()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    companyName: settings.companyName,
    companyAddress: settings.companyAddress || '',
    companyZipCode: settings.companyZipCode || '',
    companyCity: settings.companyCity || '',
    companyPhoneNumber: settings.companyPhoneNumber || '',
    companyEmail: settings.companyEmail || '',
    companySiret: settings.companySiret || '',
  })
  const [logoUrl, setLogoUrl] = useState<string | null>(settings.companyLogoUrl)
  const [uploadingLogo, setUploadingLogo] = useState(false)
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Type de fichier non supporté',
        description: 'Utilisez un fichier PNG, JPEG, WebP ou SVG.',
        variant: 'destructive',
      })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'Le fichier ne doit pas dépasser 2 Mo.',
        variant: 'destructive',
      })
      return
    }

    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const res = await fetch('/api/settings/logo', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error?.message || 'Échec du téléchargement')
      }

      const { data } = await res.json()
      setLogoUrl(data.logoUrl)
      toast({
        title: 'Logo mis à jour',
        description: 'Le logo de votre entreprise a été mis à jour.',
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de télécharger le logo.',
        variant: 'destructive',
      })
    } finally {
      setUploadingLogo(false)
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveLogo = async () => {
    try {
      await updateSettings({ companyLogoUrl: null })
      setLogoUrl(null)
      toast({
        title: 'Logo supprimé',
        description: 'Le logo a été supprimé.',
      })
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le logo.',
        variant: 'destructive',
      })
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
            <div className="border-border bg-muted/30 relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-dashed">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo entreprise" className="h-full w-full object-contain" />
              ) : (
                <span className="text-muted-foreground text-xl font-bold">
                  {formData.companyName.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <Button
                type="button"
                variant="outline"
                className="bg-transparent"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
              >
                {uploadingLogo ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {uploadingLogo ? 'Envoi...' : 'Changer le logo'}
              </Button>
              {logoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/90"
                  onClick={handleRemoveLogo}
                >
                  <X className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              )}
            </div>
            <p className="text-muted-foreground text-xs">PNG, JPEG, WebP ou SVG. Max 2 Mo.</p>
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
