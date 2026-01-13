import { z } from 'zod'

/**
 * Booking status enum matching Prisma schema
 */
export const BookingStatusEnum = z.enum(['confirmed', 'pending', 'cancelled', 'blocked'])

/**
 * Base schema without refinement for partial usage
 */
const baseBookingSchema = z.object({
  startDate: z
    .string()
    .datetime({ message: 'Date de début invalide' })
    .or(z.string().min(1, 'La date de début est requise')),
  endDate: z
    .string()
    .datetime({ message: 'Date de fin invalide' })
    .or(z.string().min(1, 'La date de fin est requise')),
  propertyId: z.string().uuid('ID de propriété invalide'),
  clientId: z.string().uuid('ID de client invalide'),
  adults: z.number().int().min(1, 'Au moins 1 adulte requis').default(1),
  children: z.number().int().min(0).default(0),
  basePrice: z.number().min(0, 'Le prix de base doit être positif'),
  totalPrice: z.number().min(0, 'Le prix total doit être positif'),
  cleaningFee: z.number().min(0).default(0),
  taxes: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  discountType: z.enum(['amount', 'percent']).nullable().optional(),
  hasLinens: z.boolean().default(false),
  linensPrice: z.number().min(0).default(0),
  hasCleaning: z.boolean().default(false),
  cleaningPrice: z.number().min(0).default(0),
  hasCancellationInsurance: z.boolean().default(false),
  insuranceFee: z.number().min(0).default(0),
  specialRequests: z.string().nullable().optional(),
  status: BookingStatusEnum.default('confirmed'),
})

/**
 * Booking validation schema for creation
 */
export const createBookingSchema = baseBookingSchema.refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate'],
  },
)

/**
 * Booking validation schema for updates (all fields optional)
 */
export const updateBookingSchema = baseBookingSchema.partial().refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate)
    }
    return true
  },
  {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate'],
  },
)

/**
 * Query params validation for booking list
 */
export const bookingQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  from: z.string().optional(),
  to: z.string().optional(),
  q: z.string().optional(),
  status: BookingStatusEnum.optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>
export type BookingQueryParams = z.infer<typeof bookingQuerySchema>
