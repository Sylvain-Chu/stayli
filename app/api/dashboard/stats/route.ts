import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse } from '@/lib/api-error'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const propertyId = searchParams.get('propertyId') || undefined

    const propertyFilter = propertyId ? { propertyId } : {}

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Réservations actives (en cours)
    const activeBookings = await prisma.booking.count({
      where: {
        ...propertyFilter,
        startDate: { lte: now },
        endDate: { gte: now },
        status: { in: ['confirmed', 'pending'] },
      },
    })

    const lastMonthActiveBookings = await prisma.booking.count({
      where: {
        ...propertyFilter,
        startDate: { lte: lastMonth },
        endDate: { gte: lastMonth },
        status: { in: ['confirmed', 'pending'] },
      },
    })

    // Revenus mensuels
    const monthlyRevenue = await prisma.booking.aggregate({
      where: {
        ...propertyFilter,
        startDate: { gte: startOfMonth, lte: endOfMonth },
        status: { in: ['confirmed', 'pending'] },
      },
      _sum: { totalPrice: true },
    })

    const lastMonthRevenue = await prisma.booking.aggregate({
      where: {
        ...propertyFilter,
        startDate: { gte: lastMonth, lte: endOfLastMonth },
        status: { in: ['confirmed', 'pending'] },
      },
      _sum: { totalPrice: true },
    })

    // Factures en attente
    const pendingInvoices = await prisma.invoice.count({
      where: {
        status: { in: ['sent', 'draft', 'overdue'] },
      },
    })

    // Dépenses du mois courant
    const monthlyExpenses = await prisma.expense.aggregate({
      where: {
        ...propertyFilter,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    })

    // Taux d'occupation (jours occupés / jours totaux du mois)
    const daysInMonth = endOfMonth.getDate()
    const properties = propertyId ? 1 : await prisma.property.count()

    const bookingsThisMonth = await prisma.booking.findMany({
      where: {
        ...propertyFilter,
        OR: [
          { startDate: { gte: startOfMonth, lte: endOfMonth } },
          { endDate: { gte: startOfMonth, lte: endOfMonth } },
          {
            AND: [{ startDate: { lte: startOfMonth } }, { endDate: { gte: endOfMonth } }],
          },
        ],
        status: { in: ['confirmed', 'pending'] },
      },
      select: {
        propertyId: true,
        startDate: true,
        endDate: true,
      },
    })

    const bookingsLastMonth = await prisma.booking.findMany({
      where: {
        ...propertyFilter,
        OR: [
          { startDate: { gte: lastMonth, lte: endOfLastMonth } },
          { endDate: { gte: lastMonth, lte: endOfLastMonth } },
          {
            AND: [{ startDate: { lte: lastMonth } }, { endDate: { gte: endOfLastMonth } }],
          },
        ],
        status: { in: ['confirmed', 'pending'] },
      },
      select: {
        propertyId: true,
        startDate: true,
        endDate: true,
      },
    })

    // Calculer les jours occupés (par propriété)
    const occupiedDays = new Set<string>()
    bookingsThisMonth.forEach((booking) => {
      const start = booking.startDate > startOfMonth ? booking.startDate : startOfMonth
      const end = booking.endDate < endOfMonth ? booking.endDate : endOfMonth
      const currentDate = new Date(start)
      while (currentDate.getTime() <= end.getTime()) {
        occupiedDays.add(`${booking.propertyId}-${currentDate.toDateString()}`)
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })

    const lastMonthOccupiedDays = new Set<string>()
    bookingsLastMonth.forEach((booking) => {
      const start = booking.startDate > lastMonth ? booking.startDate : lastMonth
      const end = booking.endDate < endOfLastMonth ? booking.endDate : endOfLastMonth
      const currentDate = new Date(start)
      while (currentDate.getTime() <= end.getTime()) {
        lastMonthOccupiedDays.add(`${booking.propertyId}-${currentDate.toDateString()}`)
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })

    const totalPossibleDays = daysInMonth * properties
    const occupancyRate = totalPossibleDays > 0 ? (occupiedDays.size / totalPossibleDays) * 100 : 0

    const lastMonthDaysInMonth = endOfLastMonth.getDate()
    const lastMonthTotalPossibleDays = lastMonthDaysInMonth * properties
    const lastMonthOccupancyRate =
      lastMonthTotalPossibleDays > 0
        ? (lastMonthOccupiedDays.size / lastMonthTotalPossibleDays) * 100
        : 0

    // Calculer les tendances
    const revenue = monthlyRevenue._sum.totalPrice || 0
    const lastRevenue = lastMonthRevenue._sum.totalPrice || 0
    const revenueTrend =
      lastRevenue > 0 ? ((revenue - lastRevenue) / lastRevenue) * 100 : revenue > 0 ? 100 : 0

    const bookingsTrend = activeBookings - lastMonthActiveBookings
    const occupancyTrend = occupancyRate - lastMonthOccupancyRate

    const expenses = monthlyExpenses._sum.amount || 0
    const netRevenue = revenue - expenses

    return successResponse({
      occupancyRate: Math.round(occupancyRate),
      occupancyTrend: Math.round(occupancyTrend),
      monthlyRevenue: revenue,
      revenueTrend: Math.round(revenueTrend),
      activeBookings,
      bookingsTrend,
      pendingInvoices,
      monthlyExpenses: expenses,
      netRevenue,
    })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch dashboard stats')
  }
}
