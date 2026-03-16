'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Minus, Plus, UserPlus, Bed, Shirt, Shield, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Property {
  id: string
  name: string
  address: string | null
}

interface Client {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
}

interface OptionPrices {
  linensOptionPrice: number
  cleaningOptionPrice: number
  cancellationInsurancePercentage: number
}

import { useBookingForm } from '../context/BookingFormContext'
import { useToast } from '@/hooks/use-toast'
import * as clientsService from '@/services/clients.service'

export function BookingForm() {
  const { formData, updateFormData } = useBookingForm()
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [optionPrices, setOptionPrices] = useState<OptionPrices | null>(null)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreatingClient, setIsCreatingClient] = useState(false)

  const [newClientData, setNewClientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  const handleCreateClient = async () => {
    if (!newClientData.firstName || !newClientData.lastName) {
      toast({
        title: 'Erreur',
        description: 'Le prénom et le nom sont requis',
        variant: 'destructive',
      })
      return
    }

    setIsCreatingClient(true)
    try {
      const newClient = await clientsService.createClient({
        firstName: newClientData.firstName,
        lastName: newClientData.lastName,
        email: newClientData.email,
        phone: newClientData.phone || undefined,
      })

      setClients([...clients, newClient])
      updateFormData({ clientId: newClient.id })

      setNewClientData({ firstName: '', lastName: '', email: '', phone: '' })
      setIsDialogOpen(false)

      toast({
        title: 'Succès',
        description: 'Client créé et sélectionné',
      })
    } catch (error) {
      console.error('Error creating client:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le client',
        variant: 'destructive',
      })
    } finally {
      setIsCreatingClient(false)
    }
  }

  useEffect(() => {
    fetch('/api/properties/list')
      .then((res) => res.json())
      .then((payload) => {
        const list = Array.isArray(payload) ? payload : (payload?.data ?? [])
        if (!Array.isArray(list)) {
          console.error('Unexpected properties response', payload)
          setProperties([])
          return
        }
        setProperties(list)
      })
      .catch((err) => console.error('Error fetching properties:', err))

    fetch('/api/clients/list')
      .then((res) => res.json())
      .then((payload) => {
        const list = Array.isArray(payload) ? payload : (payload?.data ?? [])
        if (!Array.isArray(list)) {
          console.error('Unexpected clients response', payload)
          setClients([])
          return
        }
        setClients(list)
      })
      .catch((err) => console.error('Error fetching clients:', err))

    fetch('/api/settings')
      .then((res) => res.json())
      .then((payload) => {
        const data = payload?.data ?? payload
        setOptionPrices({
          linensOptionPrice: data?.linensOptionPrice ?? 0,
          cleaningOptionPrice: data?.cleaningOptionPrice ?? 0,
          cancellationInsurancePercentage: data?.cancellationInsurancePercentage ?? 0,
        })
      })
      .catch((err) => console.error('Error fetching settings:', err))
  }, [])

  useEffect(() => {
    let isMounted = true

    const timer = setTimeout(() => {
      if (!formData.propertyId || !formData.startDate || !formData.endDate) {
        if (isMounted) setAvailabilityError(null)
        return
      }

      if (isMounted) setCheckingAvailability(true)

      fetch('/api/bookings/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: formData.propertyId,
          startDate: formData.startDate,
          endDate: formData.endDate,
          clientId: formData.clientId,
        }),
      })
        .then((res) => res.json())
        .then((payload) => {
          if (!isMounted) return

          const data = payload?.data ?? payload
          const conflicts = Array.isArray(data?.conflicts) ? data.conflicts : []

          if (!data.available && conflicts.length > 0) {
            const conflict = conflicts[0]
            const startDate = new Date(conflict.startDate).toLocaleDateString('fr-FR')
            const endDate = new Date(conflict.endDate).toLocaleDateString('fr-FR')

            const errorMessage = conflict.isSameClient
              ? `Ce client a déjà une réservation pour cette propriété du ${startDate} au ${endDate}`
              : `Cette propriété est déjà réservée du ${startDate} au ${endDate} par ${conflict.clientName}`

            setAvailabilityError(errorMessage)
            toast({
              title: conflict.isSameClient ? 'Réservation existante' : 'Propriété non disponible',
              description: errorMessage,
              variant: 'destructive',
            })
          } else {
            setAvailabilityError(null)
          }
        })
        .catch((err) => {
          if (!isMounted) return
          console.error('Error checking availability:', err)
        })
        .finally(() => {
          if (isMounted) setCheckingAvailability(false)
        })
    }, 400)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [formData.propertyId, formData.startDate, formData.endDate, formData.clientId, toast])

  return (
    <div className="space-y-6">
      {/* Propriété + Client */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-border bg-card border">
          <CardHeader>
            <CardTitle className="text-base">
              Propriété <span className="text-destructive">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="property">Sélectionner une propriété</Label>
              <Select
                value={formData.propertyId}
                onValueChange={(value) => updateFormData({ propertyId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une propriété" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card border">
          <CardHeader>
            <CardTitle className="text-base">
              Client <span className="text-destructive">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="client">Sélectionner un client</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => updateFormData({ clientId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.firstName} {client.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
                      <UserPlus className="h-3.5 w-3.5" />
                      Nouveau
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nouveau Client</DialogTitle>
                      <DialogDescription>
                        Créer un nouveau client pour cette réservation
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-firstName">Prénom</Label>
                          <Input
                            id="new-firstName"
                            value={newClientData.firstName}
                            onChange={(e) =>
                              setNewClientData({ ...newClientData, firstName: e.target.value })
                            }
                            disabled={isCreatingClient}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-lastName">Nom</Label>
                          <Input
                            id="new-lastName"
                            value={newClientData.lastName}
                            onChange={(e) =>
                              setNewClientData({ ...newClientData, lastName: e.target.value })
                            }
                            disabled={isCreatingClient}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-email">Email</Label>
                        <Input
                          id="new-email"
                          type="email"
                          value={newClientData.email}
                          onChange={(e) =>
                            setNewClientData({ ...newClientData, email: e.target.value })
                          }
                          disabled={isCreatingClient}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-phone">Téléphone</Label>
                        <Input
                          id="new-phone"
                          type="tel"
                          value={newClientData.phone}
                          onChange={(e) =>
                            setNewClientData({ ...newClientData, phone: e.target.value })
                          }
                          disabled={isCreatingClient}
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={handleCreateClient}
                        disabled={isCreatingClient}
                      >
                        {isCreatingClient ? 'Création...' : 'Créer le client'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dates */}
      <Card className="border-border bg-card border">
        <CardHeader>
          <CardTitle className="text-base">
            Dates du séjour <span className="text-destructive">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkin" className="text-sm font-semibold">
                Date d&apos;arrivée
              </Label>
              <Input
                type="date"
                id="checkin"
                value={formData.startDate}
                onChange={(e) => updateFormData({ startDate: e.target.value })}
                className={`cursor-pointer text-base transition-all ${
                  availabilityError
                    ? 'border-destructive focus-visible:border-destructive'
                    : 'hover:border-primary/50'
                }`}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout" className="text-sm font-semibold">
                Date de départ
              </Label>
              <Input
                type="date"
                id="checkout"
                value={formData.endDate}
                onChange={(e) => updateFormData({ endDate: e.target.value })}
                className={`cursor-pointer text-base transition-all ${
                  availabilityError
                    ? 'border-destructive focus-visible:border-destructive'
                    : 'hover:border-primary/50'
                }`}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          {checkingAvailability && (
            <p className="text-muted-foreground text-sm">Vérification de la disponibilité...</p>
          )}
          {availabilityError && (
            <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg border p-3 text-sm">
              {availabilityError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* GROUPE 1: OCCUPANTS */}
      <Card className="border-border bg-card border">
        <CardHeader>
          <CardTitle className="text-base">Occupants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* Adultes */}
            <div className="bg-muted/30 flex items-center justify-between rounded-lg p-4">
              <div>
                <Label className="font-semibold">Adultes</Label>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Retirer un adulte"
                  disabled={formData.adults <= 1}
                  onClick={() => updateFormData({ adults: Math.max(1, formData.adults - 1) })}
                  className="h-10 w-10"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-lg font-bold">{formData.adults}</span>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Ajouter un adulte"
                  onClick={() => updateFormData({ adults: Math.min(20, formData.adults + 1) })}
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Enfants */}
            <div className="bg-muted/30 flex items-center justify-between rounded-lg p-4">
              <div>
                <Label className="font-semibold">Enfants</Label>
                <p className="text-muted-foreground text-xs">Taxe de séjour</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Retirer un enfant"
                  disabled={formData.children <= 0}
                  onClick={() => updateFormData({ children: Math.max(0, formData.children - 1) })}
                  className="h-10 w-10"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-lg font-bold">{formData.children}</span>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Ajouter un enfant"
                  onClick={() => updateFormData({ children: Math.min(20, formData.children + 1) })}
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GROUPE 2: SERVICES & OPTIONS + TARIFICATION (GRID 2x2) */}
      <Card className="border-border bg-card border">
        <CardHeader>
          <CardTitle className="text-base">Services, Options & Tarification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Linge de maison */}
            <div
              className={`flex h-20 flex-col justify-between rounded-lg border p-4 transition-all ${formData.hasLinens ? 'border-green-500/30 bg-green-50/40' : 'border-border bg-muted/20'}`}
            >
              <div className="flex items-start gap-3">
                <Bed className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
                <div className="flex-1">
                  <Label className="cursor-pointer text-sm font-semibold">Linge de maison</Label>
                  <p className="text-muted-foreground text-xs">Draps, serviettes, etc.</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">
                  {optionPrices?.linensOptionPrice
                    ? `${optionPrices.linensOptionPrice.toFixed(2)} €`
                    : '—'}
                </span>
                <Switch
                  checked={formData.hasLinens}
                  onCheckedChange={(checked) => updateFormData({ hasLinens: checked })}
                />
              </div>
            </div>

            {/* Ménage */}
            <div
              className={`flex h-20 flex-col justify-between rounded-lg border p-4 transition-all ${formData.hasCleaning ? 'border-green-500/30 bg-green-50/40' : 'border-border bg-muted/20'}`}
            >
              <div className="flex items-start gap-3">
                <Shirt className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
                <div className="flex-1">
                  <Label className="cursor-pointer text-sm font-semibold">
                    Ménage de fin de séjour
                  </Label>
                  <p className="text-muted-foreground text-xs">Nettoyage complet</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">
                  {optionPrices?.cleaningOptionPrice
                    ? `${optionPrices.cleaningOptionPrice.toFixed(2)} €`
                    : '—'}
                </span>
                <Switch
                  checked={formData.hasCleaning}
                  onCheckedChange={(checked) => updateFormData({ hasCleaning: checked })}
                />
              </div>
            </div>

            {/* Assurance */}
            <div
              className={`flex h-20 flex-col justify-between rounded-lg border p-4 transition-all ${formData.hasInsurance ? 'border-green-500/30 bg-green-50/40' : 'border-border bg-muted/20'}`}
            >
              <div className="flex items-start gap-3">
                <Shield className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
                <div className="flex-1">
                  <Label className="cursor-pointer text-sm font-semibold">
                    Assurance annulation
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    {optionPrices?.cancellationInsurancePercentage
                      ? `${optionPrices.cancellationInsurancePercentage}% du loyer`
                      : "Protection en cas d'annulation"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold"></span>
                <Switch
                  checked={formData.hasInsurance}
                  onCheckedChange={(checked) => updateFormData({ hasInsurance: checked })}
                />
              </div>
            </div>

            {/* Tarification */}
            <div
              className={`flex h-20 flex-col justify-between rounded-lg border p-4 transition-all ${formData.customBasePrice ? 'border-slate-300 bg-slate-50/50' : 'border-border bg-slate-50/30'}`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="customBasePrice" className="text-sm font-semibold">
                    Prix personnalisé
                  </Label>
                  {formData.customBasePrice && (
                    <Info
                      className="h-3.5 w-3.5 text-slate-600"
                      aria-label="Prix personnalisé (override)"
                    />
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="customBasePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Tarif standard"
                    value={formData.customBasePrice}
                    onChange={(e) => updateFormData({ customBasePrice: e.target.value })}
                    className="h-8 pr-7 text-sm"
                  />
                  <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-sm">
                    €
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GROUPE 4: STATUT & NOTES */}
      <Card className="border-border bg-card border">
        <CardHeader>
          <CardTitle className="text-base">Finalisation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statut avec badge coloré */}
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => updateFormData({ status: value })}
            >
              <SelectTrigger id="status">
                <div className="flex items-center gap-2">
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Confirmé
                  </div>
                </SelectItem>
                <SelectItem value="pending">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    En attente
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="specialRequests">Notes / Demandes spéciales</Label>
            <Textarea
              id="specialRequests"
              placeholder="Ajouter des notes ou demandes particulières..."
              value={formData.specialRequests}
              onChange={(e) => updateFormData({ specialRequests: e.target.value })}
              className="h-14 resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
