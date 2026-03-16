import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Logo upload feature has been removed' },
    { status: 410 }
  )
}
