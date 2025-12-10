export type Client = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  createdAt: string
  updatedAt: string
}

export type ClientFormData = Pick<Client, 'firstName' | 'lastName' | 'email' | 'phone'>

export type ClientStats = {
  total: number
  newThisMonth: number
  growthPercentage: number
  activeThisMonth: number
}
