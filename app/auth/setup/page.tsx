'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Home, CheckCircle, AlertCircle, Building } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { PhoneInput } from '@/components/ui/phone-input'
import { SiretInput } from '@/components/ui/siret-input'

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'checking' | 'user' | 'company' | 'complete'>('checking')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasExistingUser, setHasExistingUser] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [companyName, setCompanyName] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [companyCity, setCompanyCity] = useState('')
  const [companyZipCode, setCompanyZipCode] = useState('')
  const [companySiret, setCompanySiret] = useState('')

  useEffect(() => {
    async function checkSetup() {
      try {
        const response = await fetch('/api/auth/setup')
        const data = await response.json()

        if (data.hasUser) {
          setHasExistingUser(true)
          router.push('/auth/signin')
        } else {
          setStep('user')
        }
      } catch {
        setStep('user')
      }
    }
    checkSetup()
  }, [router])

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setStep('company')
  }

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: { name, email, password },
          settings: {
            companyName,
            companyEmail,
            companyPhoneNumber: companyPhone,
            companyAddress,
            companyCity,
            companyZipCode,
            companySiret,
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "L'installation a échoué")
      }

      setStep('complete')

      setTimeout(async () => {
        await signIn('credentials', {
          email,
          password,
          callbackUrl: '/dashboard',
        })
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'installation a échoué")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkipCompany = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: { name, email, password },
          settings: { companyName: 'Mon Entreprise' },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "L'installation a échoué")
      }

      setStep('complete')

      setTimeout(async () => {
        await signIn('credentials', {
          email,
          password,
          callbackUrl: '/dashboard',
        })
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'installation a échoué")
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'checking' || hasExistingUser) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (step === 'complete') {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-10">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-8 w-8" />
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-bold">Configuration terminée !</h2>
            <p className="text-muted-foreground mb-4">
              Votre compte a été créé avec succès. Redirection vers le tableau de bord...
            </p>
            <Loader2 className="text-primary mx-auto h-5 w-5 animate-spin" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-lg">
              {step === 'user' ? <Home className="h-6 w-6" /> : <Building className="h-6 w-6" />}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === 'user' ? 'Bienvenue sur Stayli' : 'Informations de l’entreprise'}
          </CardTitle>
          <CardDescription>
            {step === 'user'
              ? 'Créez votre compte administrateur pour commencer'
              : 'Configurez les détails de votre entreprise (optionnel)'}
          </CardDescription>

          <div className="flex items-center justify-center gap-2 pt-4">
            <div
              className={`h-2 w-16 rounded-full ${step === 'user' ? 'bg-primary' : 'bg-green-500'}`}
            />
            <div
              className={`h-2 w-16 rounded-full ${step === 'company' ? 'bg-primary' : 'bg-muted'}`}
            />
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive mb-4 flex items-center gap-2 rounded-md p-3 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {step === 'user' && (
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  placeholder="Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <p className="text-muted-foreground text-xs">8 caractères minimum</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Continuer
              </Button>
            </form>
          )}

          {step === 'company' && (
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nom de l&apos;entreprise *</Label>
                <Input
                  id="companyName"
                  placeholder="Mes Locations Vacances"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">E-mail</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    placeholder="contact@entreprise.com"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Téléphone</Label>
                  <PhoneInput id="companyPhone" value={companyPhone} onChange={setCompanyPhone} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">Adresse</Label>
                <Input
                  id="companyAddress"
                  placeholder="123 Rue de la Paix"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyZipCode">Code postal</Label>
                  <Input
                    id="companyZipCode"
                    placeholder="75001"
                    value={companyZipCode}
                    onChange={(e) => setCompanyZipCode(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyCity">Ville</Label>
                  <Input
                    id="companyCity"
                    placeholder="Paris"
                    value={companyCity}
                    onChange={(e) => setCompanyCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySiret">SIRET (optionnel)</Label>
                <SiretInput id="companySiret" value={companySiret} onChange={setCompanySiret} />
              </div>

              <Separator className="my-4" />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleSkipCompany}
                  disabled={isLoading}
                >
                  Passer pour le moment
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    'Terminer la configuration'
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
