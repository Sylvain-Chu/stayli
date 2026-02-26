'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MoreVertical, Trash2, Edit2 } from 'lucide-react'
import { useUsers } from '../hooks/useUsers'
import { useUserMutations } from '../hooks/useUserMutations'
import { useUsersContext } from '../context/UsersContext'
import { EditUserDialog } from './EditUserDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'
import { getInitials } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import type { User } from '../types'

interface UsersTableProps {
  searchQuery?: string
  page?: number
  perPage?: number
}

export function UsersTable({ searchQuery = '', page = 1, perPage = 10 }: UsersTableProps) {
  const { users, isLoading, mutate } = useUsers(searchQuery, page, perPage)
  const { deleteUser, isMutating } = useUserMutations()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)

  const handleEditClick = (user: User) => {
    setUserToEdit(user)
    setEditDialogOpen(true)
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return

    try {
      await deleteUser(userToDelete.id)
      await mutate()
      setDeleteConfirmOpen(false)
      setUserToDelete(null)
      toast({
        title: 'Utilisateur supprimé',
        description: 'L\'utilisateur a été supprimé avec succès.',
      })
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer l\'utilisateur.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="divide-y divide-border">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!users || users.length === 0) {
    return (
      <div className="border border-border rounded-lg p-8 text-center text-muted-foreground">
        Aucun utilisateur trouvé
      </div>
    )
  }

  return (
    <>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Utilisateur</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Rôle</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Créé le</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user.name || user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {user.role === 'ADMIN' ? 'Admin' : 'Utilisateur'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(user)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(user)}
                        disabled={
                          user.id === session?.user?.id || isMutating
                        }
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={userToEdit}
        onSuccess={mutate}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Supprimer l'utilisateur"
        description={`Êtes-vous sûr de vouloir supprimer ${userToDelete?.name || userToDelete?.email} ?`}
        onConfirm={handleConfirmDelete}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="destructive"
      />
    </>
  )
}
