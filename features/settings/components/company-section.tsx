'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Upload, Save } from 'lucide-react'
import { updateSettings } from '../hooks/useSettings'
import { useToast } from '@/hooks/use-toast'

interface Settings {
  companyName: string
  companyAddress: string | null
  companyPhoneNumber: string | null
  companyEmail: string | null
  companyLogoUrl: string | null
}

export function CompanySettings({ settings }: { settings: Settings }) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    companyName: settings.companyName,
    companyAddress: settings.companyAddress || '',
    companyPhoneNumber: settings.companyPhoneNumber || '',
    companyEmail: settings.companyEmail || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSettings(formData)
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
        <div className="space-y-2">
          <Label htmlFor="companyName">Nom de l&apos;entreprise</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            value={formData.companyAddress}
            onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={formData.companyPhoneNumber}
              onChange={(e) => setFormData({ ...formData, companyPhoneNumber: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.companyEmail}
              onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
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
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
