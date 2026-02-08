import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { getSession } from '@/lib/auth/session'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

export const prisma =
  global.__prisma ||
  new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma
}

/** Resolve the current member ID from the session cookie */
export async function getMemberId(): Promise<string> {
  const session = await getSession()
  if (!session.isLoggedIn || !session.memberId) {
    throw new Error('Not authenticated')
  }
  return session.memberId
}

/** Resolve the current club ID from the session cookie */
export async function getClubId(): Promise<string> {
  const session = await getSession()
  if (!session.isLoggedIn || !session.clubId) {
    throw new Error('Not authenticated')
  }
  return session.clubId
}
