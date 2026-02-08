import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

export async function GET() {
  const session = await getSession()

  if (!session.isLoggedIn) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      userId: session.userId,
      memberId: session.memberId,
      clubId: session.clubId,
      email: session.email,
      firstName: session.firstName,
      lastName: session.lastName,
      role: session.role,
    },
  })
}
