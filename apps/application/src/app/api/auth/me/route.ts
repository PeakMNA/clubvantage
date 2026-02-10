import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001'

/**
 * Auth Session Info Route Handler
 *
 * Returns the current authenticated user's information.
 */
export async function GET(request: NextRequest) {
  try {
    // Get access token from cookies in the request
    const accessToken = request.cookies.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Forward request to the backend API (10s timeout)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    let meResponse: Response
    try {
      meResponse = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    if (!meResponse.ok) {
      if (meResponse.status === 401) {
        // Clear stale cookies so middleware redirects directly to login next time
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
      return NextResponse.json(
        { error: 'Failed to get user info' },
        { status: meResponse.status }
      )
    }

    const userData = await meResponse.json()
    const data = userData.data || userData

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('[Auth Route] Get user error:', error)
    return NextResponse.json(
      { error: 'Failed to get user info' },
      { status: 500 }
    )
  }
}
