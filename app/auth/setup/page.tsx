'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Home, CheckCircle, AlertCircle, Building, DollarSign } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { PhoneInput } from '@/components/ui/phone-input'
import { SiretInput } from '@/components/ui/siret-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CURRENCIES = [
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'USD', symbol: '$', label: 'Dollar US ($)' },
  { code: 'GBP', symbol: '£', label: 'Livre sterling (£)' },
  { code: 'CHF', symbol: 'Fr', label: 'Franc suisse (Fr)' },
  { code: 'CAD', symbol: 'CA$', label: 'Dollar canadien (CA$)' },
  { code: 'AUD', symbol: 'A$', label: 'Dollar australien (A$)' },
]

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'checking' | 'user' | 'company' | 'pricing' | 'complete'>(
    'checking',
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasExistingUser, setHasExistingUser] = useState(false)

  // Step 1: user
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Step 2: company
  const [companyName, setCompanyName] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [companyCity, setCompanyCity] = useState('')
  const [companyZipCode, setCompanyZipCode] = useState('')
  const [companySiret, setCompanySiret] = useState('')

  // Step 3: pricing
  const [currencyCode, setCurrencyCode] = useState('EUR')
  const [currencySymbol, setCurrencySymbol] = useState('€')
  const [lowSeasonRate, setLowSeasonRate] = useState('')
  const [highSeasonRate, setHighSeasonRate] = useState('')
  const [checkInTime, setCheckInTime] = useState('14:00')
  const [checkOutTime, setCheckOutTime] = useState('10:00')
  const [insuranceProviderName, setInsuranceProviderName] = useState('')
  const [insurancePercentage, setInsurancePercentage] = useState('')

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
        // If we can't reach the API, redirect to signin — safer than showing the form
        router.push('/auth/signin')
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
    setStep('pricing')
  }

  const handleSkipCompany = () => {
    setStep('pricing')
  }

  const submitSetup = async (includePricing: boolean) => {
    setIsLoading(true)
    setError(null)

    try {
      const pricingData = includePricing
        ? {
            currencyCode,
            currencySymbol,
            ...(lowSeasonRate && { lowSeasonRate: parseFloat(lowSeasonRate) }),
            ...(highSeasonRate && { highSeasonRate: parseFloat(highSeasonRate) }),
            checkInTime,
            checkOutTime,
            ...(insuranceProviderName && { cancellationInsuranceProviderName: insuranceProviderName }),
            ...(insurancePercentage && {
              cancellationInsurancePercentage: parseFloat(insurancePercentage),
            }),
          }
        : {}

      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: { name, email, password },
          settings: {
            companyName: companyName || 'Mon Entreprise',
            companyEmail,
            companyPhoneNumber: companyPhone,
            companyAddress,
            companyCity,
            companyZipCode,
            companySiret,
            ...pricingData,
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 400) {
          router.push('/auth/signin')
          return
        }
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

  const handlePricingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitSetup(true)
  }

  const handleSkipPricing = async () => {
    await submitSetup(false)
  }

  const stepIndex = { user: 0, company: 1, pricing: 2 }[step as 'user' | 'company' | 'pricing'] ?? 0

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

  const stepIcon = { user: <Home className="h-6 w-6" />, company: <Building className="h-6 w-6" />, pricing: <DollarSign className="h-6 w-6" /> }[step as 'user' | 'company' | 'pricing']
  const stepTitle = {
    user: 'Bienvenue sur Stayli',
    company: "Informations de l'entreprise",
    pricing: 'Tarification de base',
  }[step as 'user' | 'company' | 'pricing']
  const stepDescription = {
    user: 'Créez votre compte administrateur pour commencer',
    company: 'Configurez les détails de votre entreprise (optionnel)',
    pricing: "Configurez vos tarifs pour utiliser l'application (optionnel)",
  }[step as 'user' | 'company' | 'pricing']

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-lg">
              {stepIcon}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{stepTitle}</CardTitle>
          <CardDescription>{stepDescription}</CardDescription>

          <div className="flex items-center justify-center gap-2 pt-4">
            <div className={`h-2 w-14 rounded-full ${stepIndex >= 0 ? (stepIndex > 0 ? 'bg-green-500' : 'bg-primary') : 'bg-muted'}`} />
            <div className={`h-2 w-14 rounded-full ${stepIndex >= 1 ? (stepIndex > 1 ? 'bg-green-500' : 'bg-primary') : 'bg-muted'}`} />
            <div className={`h-2 w-14 rounded-full ${stepIndex >= 2 ? 'bg-primary' : 'bg-muted'}`} />
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
                <Label htmlFor="companySiret">Numéro de registre / SIRET (optionnel)</Label>
                <SiretInput id="companySiret" value={companySiret} onChange={setCompanySiret} />
              </div>

              <Separator className="my-4" />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleSkipCompany}
                >
                  Passer pour le moment
                </Button>
                <Button type="submit" className="flex-1">
                  Continuer
                </Button>
              </div>
            </form>
          )}

          {step === 'pricing' && (
            <form onSubmit={handlePricingSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <Select
                  value={currencyCode}
                  onValueChange={(val) => {
                    setCurrencyCode(val)
                    const found = CURRENCIES.find((c) => c.code === val)
                    if (found) setCurrencySymbol(found.symbol)
                  }}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lowSeasonRate">Tarif basse saison (/ nuit)</Label>
                  <Input
                    id="lowSeasonRate"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="ex: 80"
                    value={lowSeasonRate}
                    onChange={(e) => setLowSeasonRate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="highSeasonRate">Tarif haute saison (/ nuit)</Label>
                  <Input
                    id="highSeasonRate"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="ex: 120"
                    value={highSeasonRate}
                    onChange={(e) => setHighSeasonRate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkInTime">Heure d&apos;arrivée</Label>
                  <Input
                    id="checkInTime"
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOutTime">Heure de départ</Label>
                  <Input
                    id="checkOutTime"
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                  />
                </div>
              </div>

              <Separator className="my-2" />
              <p className="text-muted-foreground text-sm font-medium">Assurance annulation (optionnel)</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="insuranceProviderName">Nom de l&apos;assureur</Label>
                  <Input
                    id="insuranceProviderName"
                    placeholder="ex: MMA, Hiscox..."
                    value={insuranceProviderName}
                    onChange={(e) => setInsuranceProviderName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="insurancePercentage">Pourcentage (%)</Label>
                <Input
                  id="insurancePercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="ex: 6"
                  value={insurancePercentage}
                  onChange={(e) => setInsurancePercentage(e.target.value)}
                />
              </div>

              <Separator className="my-4" />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleSkipPricing}
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
