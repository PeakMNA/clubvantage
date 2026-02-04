import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001'

/**
 * Auth Sign Out Route Handler
 *
 * Clears authentication cookies and optionally notifies the backend.
 */
export async function POST(request: NextRequest) {
  try {
    // Get access token from cookies in the request
    const accessToken = request.cookies.get('sb-access-token')?.value

    // Try to notify backend (but don't fail if it errors)
    if (accessToken) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        })
      } catch {
        // Ignore backend signout errors
      }
    }

    // Create response that clears cookies
    const response = NextResponse.json({ success: true, message: 'Signed out successfully' })

    // Clear cookies by setting them with Max-Age=0
    const isProduction = process.env.NODE_ENV === 'production'
    const clearCookieOptions = `HttpOnly; Path=/; SameSite=Lax; Max-Age=0${isProduction ? '; Secure' : ''}`

    response.headers.append('Set-Cookie', `sb-access-token=; ${clearCookieOptions}`)
    response.headers.append('Set-Cookie', `sb-refresh-token=; ${clearCookieOptions}`)

    return response
  } catch (error) {
    console.error('[Auth Route] Sign out error:', error)

    // Still clear cookies even on error
    const response = NextResponse.json({ success: true, message: 'Signed out' })
    const isProduction = process.env.NODE_ENV === 'production'
    const clearCookieOptions = `HttpOnly; Path=/; SameSite=Lax; Max-Age=0${isProduction ? '; Secure' : ''}`

    response.headers.append('Set-Cookie', `sb-access-token=; ${clearCookieOptions}`)
    response.headers.append('Set-Cookie', `sb-refresh-token=; ${clearCookieOptions}`)

    return response
  }
}
