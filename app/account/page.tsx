'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layouts/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { getInitials } from '@/lib/utils'
import { Save, Loader2, Check, Eye, EyeOff } from 'lucide-react'

export default function AccountPage() {
  const { data: session, update: updateSession } = useSession()
  const { toast } = useToast()

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [savingPassword, setSavingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Update profile data when session changes
  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || '',
        email: session.user.email || '',
      })
    }
  }, [session])

  const handleProfileSave = async () => {
    setSavingProfile(true)
    setProfileSaved(false)
    try {
      const response = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      const result = await response.json()
      const updatedUser = result.data

      // Update session with new data from server
      await updateSession({
        name: updatedUser.name,
        email: updatedUser.email,
      })

      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)

      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été sauvegardées avec succès.',
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description:
          error instanceof Error ? error.message : 'Impossible de mettre à jour le profil.',
        variant: 'destructive',
      })
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSave = async () => {
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas.',
        variant: 'destructive',
      })
      return
    }

    // Validate password length
    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Erreur',
        description: 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
        variant: 'destructive',
      })
      return
    }

    setSavingPassword(true)
    try {
      const response = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la mise à jour du mot de passe')
      }

      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      toast({
        title: 'Mot de passe mis à jour',
        description: 'Votre mot de passe a été changé avec succès.',
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description:
          error instanceof Error ? error.message : 'Impossible de changer le mot de passe.',
        variant: 'destructive',
      })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <AppLayout title="Compte">
      <div className="grid grid-cols-1 gap-6 xl:max-w-7xl xl:grid-cols-2">
        <Card className="border-border bg-card flex flex-col border">
          <CardHeader>
            <CardTitle className="text-lg">Profil</CardTitle>
            <CardDescription>Gérez vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/professional-avatar.png" />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {getInitials(profileData.name || session?.user?.name)}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" className="bg-transparent">
                Changer la photo
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">Nom Complet</Label>
              <Input
                id="firstName"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Entrez votre nom complet"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountEmail">Email</Label>
              <Input
                id="accountEmail"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="votre@email.com"
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleProfileSave}
                disabled={savingProfile}
                className="min-w-[140px] transition-all duration-300"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : profileSaved ? (
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

        <Card className="border-border bg-card flex flex-col border">
          <CardHeader>
            <CardTitle className="text-lg">Sécurité</CardTitle>
            <CardDescription>Modifier votre mot de passe</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="text-muted-foreground h-4 w-4" />
                  ) : (
                    <Eye className="text-muted-foreground h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="text-muted-foreground h-4 w-4" />
                  ) : (
                    <Eye className="text-muted-foreground h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                Le mot de passe doit contenir au moins 8 caractères
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="text-muted-foreground h-4 w-4" />
                  ) : (
                    <Eye className="text-muted-foreground h-4 w-4" />
                  )}
                </Button>
              </div>
              {passwordData.confirmPassword &&
                passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-destructive text-xs">Les mots de passe ne correspondent pas</p>
                )}
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={handlePasswordSave}
                disabled={
                  savingPassword ||
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword
                }
                className="min-w-[160px] transition-all duration-300"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  'Mettre à jour'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
