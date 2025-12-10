import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst()

    if (!settings) {
      // Create default settings if none exist
      const newSettings = await prisma.settings.create({
        data: {},
      })
      return NextResponse.json(newSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    // Get the first (and only) settings record
    const existingSettings = await prisma.settings.findFirst()

    if (!existingSettings) {
      // Create if doesn't exist
      const settings = await prisma.settings.create({
        data: body,
      })
      return NextResponse.json(settings)
    }

    // Update existing settings
    const settings = await prisma.settings.update({
      where: { id: existingSettings.id },
      data: body,
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
