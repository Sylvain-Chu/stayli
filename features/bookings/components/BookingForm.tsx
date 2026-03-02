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
import { Minus, Plus, UserPlus } from 'lucide-react'
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
  email: string
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

      {/* Voyageurs + Options + Tarification (consolidé) */}
      <Card className="border-border bg-card border">
        <CardHeader>
          <CardTitle className="text-base">Détails du séjour</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Adultes */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Adultes</Label>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                aria-label="Retirer un adulte"
                className="h-8 w-8 bg-transparent"
                onClick={() => updateFormData({ adults: Math.max(1, formData.adults - 1) })}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{formData.adults}</span>
              <Button
                variant="outline"
                size="icon"
                aria-label="Ajouter un adulte"
                className="h-8 w-8 bg-transparent"
                onClick={() => updateFormData({ adults: Math.min(20, formData.adults + 1) })}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Enfants */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Enfants</Label>
              <p className="text-muted-foreground text-sm">Comptés pour la taxe de séjour</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                aria-label="Retirer un enfant"
                className="h-8 w-8 bg-transparent"
                onClick={() => updateFormData({ children: Math.max(0, formData.children - 1) })}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{formData.children}</span>
              <Button
                variant="outline"
                size="icon"
                aria-label="Ajouter un enfant"
                className="h-8 w-8 bg-transparent"
                onClick={() => updateFormData({ children: Math.min(20, formData.children + 1) })}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Linge de maison */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Linge de maison</Label>
              <p className="text-muted-foreground text-sm">
                Draps, serviettes, etc.
                {optionPrices?.linensOptionPrice
                  ? ` — ${optionPrices.linensOptionPrice.toFixed(2)} €`
                  : ''}
              </p>
            </div>
            <Switch
              checked={formData.hasLinens}
              onCheckedChange={(checked) => updateFormData({ hasLinens: checked })}
            />
          </div>

          {/* Ménage */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Ménage de fin de séjour</Label>
              <p className="text-muted-foreground text-sm">
                Nettoyage complet
                {optionPrices?.cleaningOptionPrice
                  ? ` — ${optionPrices.cleaningOptionPrice.toFixed(2)} €`
                  : ''}
              </p>
            </div>
            <Switch
              checked={formData.hasCleaning}
              onCheckedChange={(checked) => updateFormData({ hasCleaning: checked })}
            />
          </div>

          {/* Assurance */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Assurance annulation</Label>
              <p className="text-muted-foreground text-sm">
                Protection en cas d&apos;annulation
                {optionPrices?.cancellationInsurancePercentage
                  ? ` — ${optionPrices.cancellationInsurancePercentage} % du loyer`
                  : ''}
              </p>
            </div>
            <Switch
              checked={formData.hasInsurance}
              onCheckedChange={(checked) => updateFormData({ hasInsurance: checked })}
            />
          </div>

          <Separator />

          {/* Prix de base personnalisé */}
          <div className="space-y-1.5">
            <Label htmlFor="customBasePrice">Prix de base personnalisé (€)</Label>
            <Input
              id="customBasePrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="Laisser vide pour utiliser le tarif standard"
              value={formData.customBasePrice}
              onChange={(e) => updateFormData({ customBasePrice: e.target.value })}
            />
            <p className="text-muted-foreground text-xs">
              Le prix calculé automatiquement est visible dans le résumé →
            </p>
          </div>

          <Separator />

          {/* Statut */}
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => updateFormData({ status: value })}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">Confirmé</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="specialRequests">Notes / Demandes spéciales</Label>
            <Textarea
              id="specialRequests"
              placeholder="Notes, demandes particulières..."
              value={formData.specialRequests}
              onChange={(e) => updateFormData({ specialRequests: e.target.value })}
              className="min-h-20 resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
