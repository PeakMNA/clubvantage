import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { sessionOptions, type SessionData } from '@/lib/auth/session'

// In-memory rate limiter: 5 attempts per 15 minutes per IP
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  entry.count++
  return entry.count <= MAX_ATTEMPTS
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    )
  }

  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    )
  }

  // Find user by email
  const user = await prisma.user.findFirst({
    where: { email, isActive: true },
  })

  if (!user || !user.passwordHash) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    )
  }

  // Verify password
  const isValid = await compare(password, user.passwordHash)
  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    )
  }

  // The User has a memberId FK pointing to Member
  if (!user.memberId) {
    return NextResponse.json(
      { error: 'No active membership found for this account' },
      { status: 403 }
    )
  }

  const member = await prisma.member.findUnique({
    where: { id: user.memberId },
    include: { membershipType: true },
  })

  if (!member || member.status === 'TERMINATED') {
    return NextResponse.json(
      { error: 'No active membership found for this account' },
      { status: 403 }
    )
  }

  // Create session
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  session.userId = user.id
  session.memberId = member.id
  session.clubId = member.clubId
  session.email = user.email
  session.firstName = member.firstName
  session.lastName = member.lastName
  session.role = user.role
  session.isLoggedIn = true
  await session.save()

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: member.firstName,
      lastName: member.lastName,
      memberId: member.memberId,
      membershipType: member.membershipType.name,
    },
  })
}
