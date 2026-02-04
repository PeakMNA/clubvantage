import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001'

/**
 * Auth Sign In Route Handler
 *
 * Proxies authentication to the backend API and sets cookies on the frontend domain.
 * This solves the cross-origin cookie problem where API (port 3001) and app (port 3000)
 * are different origins and cookies don't transfer between them.
 *
 * Vercel Best Practice: Set cookies from the same origin as the frontend app.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('[Auth Route] Sign in attempt for:', email)

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Forward login request to the backend API
    console.log('[Auth Route] Forwarding to backend:', `${API_BASE_URL}/api/v1/auth/login`)
    const loginResponse = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    console.log('[Auth Route] Backend response status:', loginResponse.status)

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json().catch(() => ({}))
      console.log('[Auth Route] Backend error:', errorData)
      return NextResponse.json(
        { error: errorData.message || 'Invalid credentials' },
        { status: loginResponse.status }
      )
    }

    const loginData = await loginResponse.json()
    console.log('[Auth Route] Backend login successful')

    // Handle both wrapped { success, data } and direct response formats
    const data = loginData.data || loginData

    // Create response with cookies set via headers (more compatible approach)
    const response = NextResponse.json({
      success: true,
      data: {
        user: data.user,
        expiresIn: data.expiresIn,
        expiresAt: Date.now() + (data.expiresIn || 3600) * 1000,
      },
    })

    // Set HttpOnly cookies using response headers
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieOptions = `HttpOnly; Path=/; SameSite=Lax${isProduction ? '; Secure' : ''}`

    // Set access token cookie (7 days expiry)
    response.headers.append(
      'Set-Cookie',
      `sb-access-token=${data.accessToken}; Max-Age=${7 * 24 * 60 * 60}; ${cookieOptions}`
    )

    // Set refresh token cookie (30 days expiry)
    response.headers.append(
      'Set-Cookie',
      `sb-refresh-token=${data.refreshToken}; Max-Age=${30 * 24 * 60 * 60}; ${cookieOptions}`
    )

    console.log('[Auth Route] Cookies set, returning response')
    return response
  } catch (error) {
    console.error('[Auth Route] Sign in error:', error)
    return NextResponse.json(
      { error: 'Authentication failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
