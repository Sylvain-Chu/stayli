'use client'

import { useState } from 'react'
import { Plus, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useUsers } from '../hooks/useUsers'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import * as usersService from '@/services/users.service'

interface UsersToolbarProps {
  onSearchChange: (value: string) => void
}

export function UsersToolbar({ onSearchChange }: UsersToolbarProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    role: 'USER' as const,
  })
  const { mutate } = useUsers()
  const { toast } = useToast()

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir l&apos;email.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await usersService.inviteUser({
        email: formData.email,
        role: formData.role,
      })
      console.log('Invite result:', result)
      setInviteLink(result.data.inviteUrl)
      await mutate()
      toast({
        title: 'Invitation créée',
        description: 'Copiez le lien et partagez-le avec l\'utilisateur.',
      })
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer l&apos;invitation.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyLink = async () => {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      setIsCopied(true)
      toast({
        title: 'Lien copié',
        description: 'Le lien d&apos;invitation a été copié dans le presse-papiers.',
      })
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le lien.',
        variant: 'destructive',
      })
    }
  }

  const handleClose = () => {
    setIsInviteOpen(false)
    setFormData({ email: '', role: 'USER' })
    setInviteLink(null)
    setIsCopied(false)
  }

  return (
    <>
      <div className="flex gap-4">
        <Input
          placeholder="Rechercher un utilisateur..."
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1"
        />
        <Button onClick={() => setIsInviteOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Inviter un utilisateur
        </Button>
      </div>

      <Dialog open={isInviteOpen} onOpenChange={(open) => open === false && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inviter un nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Générez un lien d&apos;invitation et partagez-le avec l&apos;utilisateur
            </DialogDescription>
          </DialogHeader>

          {!inviteLink ? (
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Utilisateur</SelectItem>
                    <SelectItem value="ADMIN">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Générer lien
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteLink">Lien d&apos;invitation</Label>
                <div className="flex gap-2">
                  <Input
                    id="inviteLink"
                    value={inviteLink}
                    readOnly
                    className="bg-muted"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyLink}
                    type="button"
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Valide pendant 24h. Partagez ce lien avec l&apos;utilisateur.
                </p>
              </div>

              <DialogFooter>
                <Button onClick={handleClose} className="w-full">
                  Fermer
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
