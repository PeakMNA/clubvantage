import { getIronSession, type SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  userId: string
  memberId: string
  clubId: string
  email: string
  firstName: string
  lastName: string
  role: string
  isLoggedIn: boolean
}

const defaultSession: SessionData = {
  userId: '',
  memberId: '',
  clubId: '',
  email: '',
  firstName: '',
  lastName: '',
  role: '',
  isLoggedIn: false,
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? 'clubvantage-dev-secret-key-min-32-chars-long!',
  cookieName: 'session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
  },
}

export async function getSession() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (!session.isLoggedIn) {
    session.userId = defaultSession.userId
    session.memberId = defaultSession.memberId
    session.clubId = defaultSession.clubId
    session.email = defaultSession.email
    session.firstName = defaultSession.firstName
    session.lastName = defaultSession.lastName
    session.role = defaultSession.role
    session.isLoggedIn = defaultSession.isLoggedIn
  }

  return session
}
