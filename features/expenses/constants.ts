import { Zap, Package, Shield, FileText } from 'lucide-react'
import type { ExpenseCategory } from './types'

export const CATEGORY_ICONS: Record<ExpenseCategory, any> = {
  energy: Zap,
  materials: Package,
  maintenance: Shield,
  insurance: FileText,
}
