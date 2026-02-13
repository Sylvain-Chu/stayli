import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Search, UserPlus, Check, Loader2 } from 'lucide-react'
import type { Property, Client } from '@/hooks/use-calendar'
import type { DragState, NewBookingState, BookingStatus } from './types'
import { MONTHS } from './constants'

interface NewBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dragState: DragState | null
  properties: Property[]
  displayMonth: number
  newBooking: NewBookingState
  setNewBooking: React.Dispatch<React.SetStateAction<NewBookingState>>
  clientSearch: string
  setClientSearch: (value: string) => void
  showClientDropdown: boolean
  setShowClientDropdown: (value: boolean) => void
  filteredClients: Client[]
  showCreateClientOption: boolean
  isSubmitting: boolean
  isCalculating: boolean
  onSelectClient: (client: Client) => void
  onCreateNewClient: () => void
  onOptionChange: (key: string, value: unknown) => void
  onConfirm: () => void
  onCancel: () => void
}

export function NewBookingDialog({
  open,
  onOpenChange,
  dragState,
  properties,
  displayMonth,
  newBooking,
  setNewBooking,
  clientSearch,
  setClientSearch,
  showClientDropdown,
  setShowClientDropdown,
  filteredClients,
  showCreateClientOption,
  isSubmitting,
  isCalculating,
  onSelectClient,
  onCreateNewClient,
  onOptionChange,
  onConfirm,
  onCancel,
}: NewBookingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[550px]">
        <DialogHeader className="shrink-0 p-6 pb-2">
          <DialogTitle className="text-lg">Nouvelle réservation</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-2">
          {dragState && (
            <>
              <div className="bg-primary/5 border-primary/10 grid grid-cols-2 gap-4 rounded-lg border p-3 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Propriété</span>
                  <span className="block truncate font-medium">
                    {properties.find((p) => p.id === dragState.propertyId)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Dates</span>
                  <span className="block font-medium">
                    {Math.min(dragState.startDay, dragState.endDay)} -{' '}
                    {Math.max(dragState.startDay, dragState.endDay)} {MONTHS[displayMonth]}
                  </span>
                </div>
              </div>

              {/* Client search */}
              <div className="space-y-2">
                <Label>Client</Label>
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="Rechercher ou créer un client..."
                    value={clientSearch}
                    onChange={(e) => {
                      setClientSearch(e.target.value)
                      setShowClientDropdown(true)
                      if (newBooking.clientId) {
                        setNewBooking((prev) => ({
                          ...prev,
                          clientId: null,
                          clientName: '',
                          isNewClient: false,
                        }))
                      }
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                    className="pl-9"
                  />

                  {showClientDropdown && (clientSearch || filteredClients.length > 0) && (
                    <div className="bg-card border-border absolute top-full right-0 left-0 z-50 mt-1 max-h-48 overflow-auto rounded-xl border shadow-lg">
                      {filteredClients.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          className="hover:bg-accent/50 flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors"
                          onClick={() => onSelectClient(client)}
                        >
                          <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                            {client.firstName.charAt(0)}
                            {client.lastName.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {client.firstName} {client.lastName}
                            </p>
                            <p className="text-muted-foreground truncate text-xs">{client.email}</p>
                          </div>
                          {newBooking.clientId === client.id && (
                            <Check className="text-primary h-4 w-4" />
                          )}
                        </button>
                      ))}

                      {showCreateClientOption && (
                        <>
                          <div className="border-border border-t" />
                          <button
                            type="button"
                            className="hover:bg-accent/50 flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors"
                            onClick={onCreateNewClient}
                          >
                            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
                              <UserPlus className="text-primary-foreground h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                Créer &quot;{clientSearch}&quot;
                              </p>
                              <p className="text-muted-foreground text-xs">Nouveau client</p>
                            </div>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {newBooking.clientId && !newBooking.isNewClient && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs">
                      <Check className="h-3 w-3" />
                      {newBooking.clientName}
                    </span>
                  </div>
                )}

                {newBooking.isNewClient && (
                  <div className="border-border bg-muted/30 mt-2 space-y-3 rounded-xl border p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Email</Label>
                        <Input
                          type="email"
                          placeholder="email@exemple.com"
                          value={newBooking.clientEmail}
                          onChange={(e) =>
                            setNewBooking((prev) => ({ ...prev, clientEmail: e.target.value }))
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Téléphone</Label>
                        <Input
                          placeholder="06 12 34 56 78"
                          value={newBooking.clientPhone}
                          onChange={(e) =>
                            setNewBooking((prev) => ({ ...prev, clientPhone: e.target.value }))
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status & Guests */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select
                    value={newBooking.status}
                    onValueChange={(value) =>
                      setNewBooking((prev) => ({ ...prev, status: value as BookingStatus }))
                    }
                  >
                    <SelectTrigger className="h-9 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="confirmed">Confirmé</SelectItem>
                      <SelectItem value="blocked">Bloqué</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Invités</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        min="1"
                        value={newBooking.adults}
                        onChange={(e) => onOptionChange('adults', parseInt(e.target.value) || 1)}
                        className="h-9 pr-8"
                      />
                      <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs">
                        Ad.
                      </span>
                    </div>
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        min="0"
                        value={newBooking.children}
                        onChange={(e) => onOptionChange('children', parseInt(e.target.value) || 0)}
                        className="h-9 pr-8"
                      />
                      <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs">
                        Enf.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial details */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">
                    Détails Financiers{' '}
                    {isCalculating && <Loader2 className="ml-2 inline h-3 w-3 animate-spin" />}
                  </Label>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="hasLinens"
                      checked={newBooking.hasLinens}
                      onCheckedChange={(checked) => onOptionChange('hasLinens', checked)}
                    />
                    <Label htmlFor="hasLinens" className="cursor-pointer font-normal">
                      Linge
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="hasCleaning"
                      checked={newBooking.hasCleaning}
                      onCheckedChange={(checked) => onOptionChange('hasCleaning', checked)}
                    />
                    <Label htmlFor="hasCleaning" className="cursor-pointer font-normal">
                      Ménage
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="hasInsurance"
                      checked={newBooking.hasCancellationInsurance}
                      onCheckedChange={(checked) =>
                        onOptionChange('hasCancellationInsurance', checked)
                      }
                    />
                    <Label htmlFor="hasInsurance" className="cursor-pointer font-normal">
                      Assurance
                    </Label>
                  </div>
                </div>

                <div className="bg-muted/20 grid grid-cols-3 gap-3 rounded-lg p-3">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Loyer (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newBooking.basePrice}
                      onChange={(e) =>
                        setNewBooking((prev) => ({
                          ...prev,
                          basePrice: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="bg-background h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Ménage (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newBooking.cleaningFee}
                      onChange={(e) =>
                        setNewBooking((prev) => ({
                          ...prev,
                          cleaningFee: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="bg-background h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Taxes (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newBooking.taxes}
                      onChange={(e) =>
                        setNewBooking((prev) => ({
                          ...prev,
                          taxes: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="bg-background h-8 text-sm"
                    />
                  </div>

                  {(newBooking.hasLinens || newBooking.linensPrice > 0) && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Linge (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newBooking.linensPrice}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            linensPrice: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="bg-background h-8 text-sm"
                      />
                    </div>
                  )}

                  {(newBooking.hasCancellationInsurance || newBooking.insuranceFee > 0) && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Assurance (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newBooking.insuranceFee}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            insuranceFee: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="bg-background h-8 text-sm"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Réduction (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newBooking.discount}
                      onChange={(e) =>
                        setNewBooking((prev) => ({
                          ...prev,
                          discount: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="bg-background h-8 text-sm text-red-600"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-sm">Notes</Label>
                <Textarea
                  placeholder="Notes..."
                  value={newBooking.specialRequests}
                  onChange={(e) =>
                    setNewBooking((prev) => ({ ...prev, specialRequests: e.target.value }))
                  }
                  className="min-h-[60px] resize-none rounded-xl text-sm"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t p-6 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="rounded-xl bg-transparent"
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!newBooking.clientName.trim() || isSubmitting}
            className="rounded-xl"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer la réservation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
