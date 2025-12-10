import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware to handle authentication and redirects
export function middleware(request: NextRequest) {
  // You can add authentication logic here
  // For now, just pass through
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
