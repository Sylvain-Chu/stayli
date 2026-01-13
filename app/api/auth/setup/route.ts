import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { z } from 'zod'

const setupSchema = z.object({
  user: z.object({
    name: z.string().min(1, 'Le nom est requis'),
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  }),
  settings: z.object({
    companyName: z.string().min(1, "Le nom de l'entreprise est requis"),
    companyEmail: z.string().email().optional().or(z.literal('')),
    companyPhoneNumber: z.string().optional(),
    companyAddress: z.string().optional(),
    companyCity: z.string().optional(),
    companyZipCode: z.string().optional(),
    companySiret: z.string().optional(),
  }),
})

/**
 * GET /api/auth/setup
 * Check if setup is needed (no users exist)
 */
export async function GET() {
  try {
    const userCount = await prisma.user.count()

    return NextResponse.json({
      hasUser: userCount > 0,
      needsSetup: userCount === 0,
    })
  } catch (error) {
    console.error('Setup check error:', error)
    return NextResponse.json({ error: 'Failed to check setup status' }, { status: 500 })
  }
}

/**
 * POST /api/auth/setup
 * Create the first admin user and initial settings
 */
export async function POST(request: NextRequest) {
  try {
    // Check if users already exist
    const existingUserCount = await prisma.user.count()

    if (existingUserCount > 0) {
      return NextResponse.json(
        { error: 'Setup already completed. Please sign in.' },
        { status: 400 },
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = setupSchema.parse(body)

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.user.password, 12)

    // Create user and settings in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create admin user
      const user = await tx.user.create({
        data: {
          name: validatedData.user.name,
          email: validatedData.user.email,
          passwordHash,
          role: 'ADMIN',
        },
      })

      // Create or update settings
      const existingSettings = await tx.settings.findFirst()

      let settings
      if (existingSettings) {
        settings = await tx.settings.update({
          where: { id: existingSettings.id },
          data: {
            companyName: validatedData.settings.companyName,
            companyEmail: validatedData.settings.companyEmail || null,
            companyPhoneNumber: validatedData.settings.companyPhoneNumber || null,
            companyAddress: validatedData.settings.companyAddress || null,
            companyCity: validatedData.settings.companyCity || null,
            companyZipCode: validatedData.settings.companyZipCode || null,
            companySiret: validatedData.settings.companySiret || null,
          },
        })
      } else {
        settings = await tx.settings.create({
          data: {
            companyName: validatedData.settings.companyName,
            companyEmail: validatedData.settings.companyEmail || null,
            companyPhoneNumber: validatedData.settings.companyPhoneNumber || null,
            companyAddress: validatedData.settings.companyAddress || null,
            companyCity: validatedData.settings.companyCity || null,
            companyZipCode: validatedData.settings.companyZipCode || null,
            companySiret: validatedData.settings.companySiret || null,
          },
        })
      }

      return { user, settings }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    })
  } catch (error) {
    console.error('Setup error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Validation error' },
        { status: 400 },
      )
    }

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to complete setup' }, { status: 500 })
  }
}
