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

    // Forward request to the backend API
    const meResponse = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!meResponse.ok) {
      if (meResponse.status === 401) {
        return NextResponse.json(
          { error: 'Session expired' },
          { status: 401 }
        )
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
