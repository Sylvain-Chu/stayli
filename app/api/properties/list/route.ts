import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse } from '@/lib/api-error'

export async function GET() {
  try {
    await requireAuth()

    const properties = await prisma.property.findMany({
      select: {
        id: true,
        name: true,
        address: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return successResponse(properties)
  } catch (error) {
    return handleApiError(error, 'Failed to fetch properties')
  }
}
