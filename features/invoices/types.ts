export interface Invoice {
  id: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  bookingId: string
  booking?: {
    id: string
    client: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
    property: {
      id: string
      name: string
    }
    startDate: string
    endDate: string
  }
  createdAt: string
  updatedAt: string
}

export interface InvoiceFormData {
  bookingId: string
  issueDate?: string
  dueDate: string
  amount: number
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
}

export interface InvoiceStats {
  total: number
  paid: number
  overdue: number
  totalAmount: number
  paidAmount: number
  overdueAmount: number
}
