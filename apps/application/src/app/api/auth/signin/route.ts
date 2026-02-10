import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001'

const SignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

/**
 * Auth Sign In Route Handler
 *
 * Proxies authentication to the backend API and sets cookies on the frontend domain.
 * This solves the cross-origin cookie problem where API (port 3001) and app (port 3000)
 * are different origins and cookies don't transfer between them.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsed = SignInSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    // Forward login request to the backend API
    const loginController = new AbortController()
    const loginTimeout = setTimeout(() => loginController.abort(), 10000)
    let loginResponse: Response
    try {
      loginResponse = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: loginController.signal,
      })
    } finally {
      clearTimeout(loginTimeout)
    }

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Invalid credentials' },
        { status: loginResponse.status }
      )
    }

    const loginData = await loginResponse.json()

    // Handle both wrapped { success, data } and direct response formats
    const data = loginData.data || loginData

    // Create response with cookies set via headers
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

    // Set access token cookie (1 hour - matches JWT expiry)
    response.headers.append(
      'Set-Cookie',
      `sb-access-token=${data.accessToken}; Max-Age=${60 * 60}; ${cookieOptions}`
    )

    // Set refresh token cookie (7 days - matches refresh token expiry)
    response.headers.append(
      'Set-Cookie',
      `sb-refresh-token=${data.refreshToken}; Max-Age=${7 * 24 * 60 * 60}; ${cookieOptions}`
    )

    return response
  } catch (error) {
    console.error('[Auth Route] Sign in error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
