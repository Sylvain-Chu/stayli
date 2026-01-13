'use client'

import * as React from 'react'
import { Badge, type BadgeProps } from './badge'
import {
  BookingStatus,
  InvoiceStatus,
  BOOKING_STATUS_CONFIG,
  INVOICE_STATUS_CONFIG,
} from '@/types/entities'

interface BookingStatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: BookingStatus
}

interface InvoiceStatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: InvoiceStatus
}

const bookingStatusToVariant: Record<BookingStatus, BadgeProps['variant']> = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'danger',
  blocked: 'muted',
}

const invoiceStatusToVariant: Record<InvoiceStatus, BadgeProps['variant']> = {
  draft: 'muted',
  sent: 'info',
  paid: 'success',
  overdue: 'danger',
  cancelled: 'muted',
}

function BookingStatusBadge({ status, className, ...props }: BookingStatusBadgeProps) {
  const config = BOOKING_STATUS_CONFIG[status]
  const variant = bookingStatusToVariant[status]

  return (
    <Badge variant={variant} className={className} {...props}>
      {config.label}
    </Badge>
  )
}

function InvoiceStatusBadge({ status, className, ...props }: InvoiceStatusBadgeProps) {
  const config = INVOICE_STATUS_CONFIG[status]
  const variant = invoiceStatusToVariant[status]

  return (
    <Badge variant={variant} className={className} {...props}>
      {config.label}
    </Badge>
  )
}

export { BookingStatusBadge, InvoiceStatusBadge }
