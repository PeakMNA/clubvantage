import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip API routes and static files
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Redirect root to portal
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/portal', request.url))
  }

  // Auth guard: protect /portal/* routes
  const isPortalRoute = pathname.startsWith('/portal')
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/forgot-password')
  const sessionToken = request.cookies.get('session')?.value

  if (isPortalRoute && !sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/portal', request.url))
  }

  // Tenant resolution headers
  const response = NextResponse.next()
  response.headers.set('x-tenant-id', 'tenant-001')
  response.headers.set('x-tenant-slug', 'royal-club')

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-DNS-Prefetch-Control', 'on')

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|mockup|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
