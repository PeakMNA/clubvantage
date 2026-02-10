import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001'

/**
 * Auth Session Refresh Route Handler
 *
 * Refreshes the access token using the refresh token cookie.
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies in the request
    const refreshToken = request.cookies.get('sb-refresh-token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token' },
        { status: 401 }
      )
    }

    // Forward refresh request to the backend API (10s timeout)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    let refreshResponse: Response
    try {
      refreshResponse = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    if (!refreshResponse.ok) {
      // Clear invalid cookies
      const response = NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )

      const isProduction = process.env.NODE_ENV === 'production'
      const clearCookieOptions = `HttpOnly; Path=/; SameSite=Lax; Max-Age=0${isProduction ? '; Secure' : ''}`
      response.headers.append('Set-Cookie', `sb-access-token=; ${clearCookieOptions}`)
      response.headers.append('Set-Cookie', `sb-refresh-token=; ${clearCookieOptions}`)

      return response
    }

    const refreshData = await refreshResponse.json()
    const data = refreshData.data || refreshData

    // Create response with new cookies
    const response = NextResponse.json({
      success: true,
      data: {
        expiresIn: data.expiresIn,
        expiresAt: Date.now() + (data.expiresIn || 3600) * 1000,
      },
    })

    // Set new cookies
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieOptions = `HttpOnly; Path=/; SameSite=Lax${isProduction ? '; Secure' : ''}`

    response.headers.append(
      'Set-Cookie',
      `sb-access-token=${data.accessToken}; Max-Age=${60 * 60}; ${cookieOptions}`
    )

    if (data.refreshToken) {
      response.headers.append(
        'Set-Cookie',
        `sb-refresh-token=${data.refreshToken}; Max-Age=${7 * 24 * 60 * 60}; ${cookieOptions}`
      )
    }

    return response
  } catch (error) {
    console.error('[Auth Route] Refresh error:', error)
    return NextResponse.json(
      { error: 'Session refresh failed' },
      { status: 500 }
    )
  }
}
