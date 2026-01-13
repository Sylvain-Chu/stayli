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
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
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
        throw new Error(data.error || 'Setup failed')
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
      setError(err instanceof Error ? err.message : 'Setup failed')
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
          settings: { companyName: 'My Company' },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Setup failed')
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
      setError(err instanceof Error ? err.message : 'Setup failed')
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
            <h2 className="mb-2 text-2xl font-bold">Setup Complete!</h2>
            <p className="text-muted-foreground mb-4">
              Your account has been created successfully. Redirecting to dashboard...
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
            {step === 'user' ? 'Welcome to Stayli' : 'Company Information'}
          </CardTitle>
          <CardDescription>
            {step === 'user'
              ? 'Create your admin account to get started'
              : 'Set up your company details (optional)'}
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
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <p className="text-muted-foreground text-xs">Minimum 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
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
                Continue
              </Button>
            </form>
          )}

          {step === 'company' && (
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="My Vacation Rentals"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    placeholder="contact@company.com"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Phone</Label>
                  <Input
                    id="companyPhone"
                    placeholder="+33 1 23 45 67 89"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">Address</Label>
                <Input
                  id="companyAddress"
                  placeholder="123 Main Street"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyZipCode">Zip Code</Label>
                  <Input
                    id="companyZipCode"
                    placeholder="75001"
                    value={companyZipCode}
                    onChange={(e) => setCompanyZipCode(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyCity">City</Label>
                  <Input
                    id="companyCity"
                    placeholder="Paris"
                    value={companyCity}
                    onChange={(e) => setCompanyCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySiret">SIRET (optional)</Label>
                <Input
                  id="companySiret"
                  placeholder="123 456 789 00012"
                  value={companySiret}
                  onChange={(e) => setCompanySiret(e.target.value)}
                />
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
                  Skip for now
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Complete Setup'
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
