import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse } from '@/lib/api-error'

export interface Alert {
  id: string
  type: 'checkin' | 'checkout' | 'overdue_invoice' | 'pending_booking'
  title: string
  description: string
  date: string
  severity: 'info' | 'warning' | 'danger'
  link: string
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const now = new Date()
    const alerts: Alert[] = []

    // --- Check-ins within the next 3 days ---
    const threeDaysFromNow = new Date(now)
    threeDaysFromNow.setDate(now.getDate() + 3)

    const upcomingCheckins = await prisma.booking.findMany({
      where: {
        startDate: {
          gte: now,
          lte: threeDaysFromNow,
        },
        status: { in: ['confirmed', 'pending'] },
      },
      include: { client: true, property: true },
      orderBy: { startDate: 'asc' },
      take: 10,
    })

    for (const booking of upcomingCheckins) {
      const daysUntil = Math.ceil(
        (booking.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      )
      const clientName = booking.client
        ? `${booking.client.firstName} ${booking.client.lastName}`
        : 'Client inconnu'

      alerts.push({
        id: `checkin-${booking.id}`,
        type: 'checkin',
        title:
          daysUntil === 0
            ? "Check-in aujourd'hui"
            : `Check-in dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''}`,
        description: `${clientName} — ${booking.property?.name ?? 'Propriété'}`,
        date: booking.startDate.toISOString(),
        severity: daysUntil === 0 ? 'warning' : 'info',
        link: `/bookings/${booking.id}`,
      })
    }

    // --- Check-outs within the next 2 days ---
    const twoDaysFromNow = new Date(now)
    twoDaysFromNow.setDate(now.getDate() + 2)

    const upcomingCheckouts = await prisma.booking.findMany({
      where: {
        endDate: {
          gte: now,
          lte: twoDaysFromNow,
        },
        status: 'confirmed',
      },
      include: { client: true, property: true },
      orderBy: { endDate: 'asc' },
      take: 10,
    })

    for (const booking of upcomingCheckouts) {
      const daysUntil = Math.ceil(
        (booking.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      )
      const clientName = booking.client
        ? `${booking.client.firstName} ${booking.client.lastName}`
        : 'Client inconnu'

      alerts.push({
        id: `checkout-${booking.id}`,
        type: 'checkout',
        title:
          daysUntil === 0
            ? "Check-out aujourd'hui"
            : `Check-out ${daysUntil === 1 ? 'demain' : `dans ${daysUntil} jours`}`,
        description: `${clientName} — ${booking.property?.name ?? 'Propriété'}`,
        date: booking.endDate.toISOString(),
        severity: daysUntil === 0 ? 'warning' : 'info',
        link: `/bookings/${booking.id}`,
      })
    }

    // --- Overdue invoices ---
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: 'sent',
        dueDate: { lt: now },
      },
      include: {
        booking: {
          include: { client: true },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    })

    for (const invoice of overdueInvoices) {
      const daysOverdue = Math.floor(
        (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24),
      )
      const clientName = invoice.booking?.client
        ? `${invoice.booking.client.firstName} ${invoice.booking.client.lastName}`
        : 'Client inconnu'

      alerts.push({
        id: `overdue-${invoice.id}`,
        type: 'overdue_invoice',
        title: `Facture en retard (${daysOverdue}j)`,
        description: `${invoice.invoiceNumber} — ${clientName} — ${invoice.amount.toLocaleString('fr-FR')} €`,
        date: invoice.dueDate.toISOString(),
        severity: 'danger',
        link: `/invoices/${invoice.id}`,
      })
    }

    // --- Pending bookings (awaiting confirmation) ---
    const pendingBookings = await prisma.booking.findMany({
      where: {
        status: 'pending',
        startDate: { gte: now },
      },
      include: { client: true, property: true },
      orderBy: { startDate: 'asc' },
      take: 5,
    })

    for (const booking of pendingBookings) {
      const clientName = booking.client
        ? `${booking.client.firstName} ${booking.client.lastName}`
        : 'Client inconnu'

      alerts.push({
        id: `pending-${booking.id}`,
        type: 'pending_booking',
        title: 'Réservation en attente',
        description: `${clientName} — ${booking.property?.name ?? 'Propriété'}`,
        date: booking.startDate.toISOString(),
        severity: 'info',
        link: `/bookings/${booking.id}`,
      })
    }

    // Sort: danger first, then warning, then info
    const severityOrder = { danger: 0, warning: 1, info: 2 }
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    return successResponse({ alerts, count: alerts.length })
  } catch (error) {
    return handleApiError(error, 'Error fetching notifications')
  }
}
