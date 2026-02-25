/**
 * Clients Export API Route
 * Returns all clients for CSV export
 */

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { handleApiError, successResponse } from '@/lib/api-error'

export async function GET() {
  try {
    await requireAdmin()

    const clients = await prisma.client.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    })

    return successResponse(clients)
  } catch (error) {
    return handleApiError(error, 'Failed to export clients')
  }
}
