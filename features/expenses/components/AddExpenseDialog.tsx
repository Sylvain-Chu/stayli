'use client'

import { useState, useEffect } from 'react'
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
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { useExpenseMutations } from '../hooks/useExpenseMutations'
import { useToast } from '@/hooks/use-toast'
import { EXPENSE_CATEGORY_CONFIG } from '@/types/entities'
import { CATEGORY_ICONS } from '../constants'
import type { ExpenseCategory } from '../types'

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  properties: Array<{ id: string; name: string }>
  expense?: { id: string; propertyId: string; amount: number; category: ExpenseCategory; date: string; supplier?: string; description?: string } | null
}

export function AddExpenseDialog({ open, onOpenChange, properties, expense }: AddExpenseDialogProps) {
  const { createExpense, updateExpense, isMutating } = useExpenseMutations()
  const { toast } = useToast()

  const [formData, setFormData] = useState<{
    propertyId: string
    amount: string
    category: ExpenseCategory | ''
    date: string
    supplier: string
    description: string
  }>({
    propertyId: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    description: '',
  })

  useEffect(() => {
    if (open) {
      if (expense) {
        setFormData({
          propertyId: expense.propertyId,
          amount: expense.amount.toString(),
          category: expense.category,
          date: expense.date.split('T')[0],
          supplier: expense.supplier || '',
          description: expense.description || '',
        })
      } else {
        setFormData({
          propertyId: properties[0]?.id || '',
          amount: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          supplier: '',
          description: '',
        })
      }
    }
  }, [open, expense, properties])

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.propertyId || !formData.amount || !formData.category) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir les champs obligatoires',
        variant: 'destructive',
      })
      return
    }

    try {
      const expenseData = {
        propertyId: formData.propertyId,
        amount: parseFloat(formData.amount),
        category: formData.category as ExpenseCategory,
        date: formData.date,
        supplier: formData.supplier || undefined,
        description: formData.description || undefined,
      }

      if (expense) {
        await updateExpense(expense.id, expenseData)
        toast({
          title: 'Succès',
          description: 'Dépense modifiée avec succès',
        })
      } else {
        await createExpense(expenseData)
        toast({
          title: 'Succès',
          description: 'Dépense créée avec succès',
        })
      }

      // Reset form
      if (!expense) {
        setFormData({
          propertyId: properties[0]?.id || '',
          amount: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          supplier: '',
          description: '',
        })
      }

      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Erreur',
        description: expense ? 'Impossible de modifier la dépense' : 'Impossible de créer la dépense',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{expense ? 'Modifier la dépense' : 'Ajouter une dépense'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Property Select - Full width */}
          <div className="space-y-2">
            <Label htmlFor="property">Propriété *</Label>
            <Select
              value={formData.propertyId}
              onValueChange={(value) => handleChange('propertyId', value)}
            >
              <SelectTrigger id="property">
                <SelectValue placeholder="Sélectionner une propriété" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((prop) => (
                  <SelectItem key={prop.id} value={prop.id}>
                    {prop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Row 1: Amount & Category (50/50) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant *</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  className="pr-8 text-lg font-semibold"
                  required
                />
                <span className="absolute top-1/2 right-3 -translate-y-1/2 font-medium text-gray-500">
                  €
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(EXPENSE_CATEGORY_CONFIG) as [ExpenseCategory, any][]).map(
                    ([key, config]) => {
                      const Icon = CATEGORY_ICONS[key]
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      )
                    },
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Date & Supplier (50/50) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Fournisseur</Label>
              <Input
                id="supplier"
                type="text"
                placeholder="EDF, Leroy Merlin..."
                value={formData.supplier}
                onChange={(e) => handleChange('supplier', e.target.value)}
              />
            </div>
          </div>

          {/* Description - Full width */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Notes supplémentaires..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isMutating}>
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {expense ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
