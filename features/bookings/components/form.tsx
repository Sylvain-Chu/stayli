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

import { useBookingForm } from '../context/BookingFormContext'
import { useToast } from '@/hooks/use-toast'

export function BookingForm() {
  const { formData, updateFormData } = useBookingForm()
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  // Nouveau client form
  const [newClientData, setNewClientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    // Fetch properties
    fetch('/api/properties/list')
      .then((res) => res.json())
      .then((data) => setProperties(data))
      .catch((err) => console.error('Error fetching properties:', err))

    // Fetch clients
    fetch('/api/clients/list')
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((err) => console.error('Error fetching clients:', err))
  }, [])

  // Check availability when property or dates change
  useEffect(() => {
    if (!formData.propertyId || !formData.startDate || !formData.endDate) {
      setAvailabilityError(null)
      return
    }

    setCheckingAvailability(true)
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
      .then((data) => {
        if (!data.available && data.conflicts.length > 0) {
          const conflict = data.conflicts[0]
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
        setCheckingAvailability(false)
      })
      .catch((err) => {
        console.error('Error checking availability:', err)
        setCheckingAvailability(false)
      })
  }, [formData.propertyId, formData.startDate, formData.endDate, formData.clientId, toast])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Property Selection */}
        <Card className="border-border bg-card border">
          <CardHeader>
            <CardTitle className="text-base">Propriété</CardTitle>
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

        {/* Client Selection */}
        <Card className="border-border bg-card border">
          <CardHeader>
            <CardTitle className="text-base">Client</CardTitle>
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0">
                      <UserPlus className="h-4 w-4" />
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
                        />
                      </div>
                      <Button className="w-full">Créer le client</Button>
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
          <CardTitle className="text-base">Dates du séjour</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkin" className="text-sm font-semibold">
                Date d&apos;arrivée
              </Label>
              <div className="relative">
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout" className="text-sm font-semibold">
                Date de départ
              </Label>
              <div className="relative">
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

      {/* Guests */}
      <Card className="border-border bg-card border">
        <CardHeader>
          <CardTitle className="text-base">Voyageurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>Nombre de voyageurs</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={() => updateFormData({ adults: Math.max(1, formData.adults - 1) })}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{formData.adults}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={() => updateFormData({ adults: Math.min(10, formData.adults + 1) })}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Options */}
      <Card className="border-border bg-card border">
        <CardHeader>
          <CardTitle className="text-base">Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Linge de maison</Label>
              <p className="text-muted-foreground text-sm">Draps, serviettes, etc.</p>
            </div>
            <Switch
              checked={formData.hasLinens}
              onCheckedChange={(checked) => updateFormData({ hasLinens: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Ménage de fin de séjour</Label>
              <p className="text-muted-foreground text-sm">Nettoyage complet</p>
            </div>
            <Switch
              checked={formData.hasCleaning}
              onCheckedChange={(checked) => updateFormData({ hasCleaning: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Assurance annulation</Label>
              <p className="text-muted-foreground text-sm">Protection en cas d&apos;annulation</p>
            </div>
            <Switch
              checked={formData.hasInsurance}
              onCheckedChange={(checked) => updateFormData({ hasInsurance: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
