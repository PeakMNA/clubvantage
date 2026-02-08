'use server'

import { compare, hash } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth/session'

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session.isLoggedIn || !session.userId) {
    return { success: false, error: 'Not authenticated' }
  }

  if (newPassword.length < 8) {
    return { success: false, error: 'New password must be at least 8 characters' }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { passwordHash: true },
  })

  if (!user) {
    return { success: false, error: 'User not found' }
  }

  const isValid = await compare(currentPassword, user.passwordHash)
  if (!isValid) {
    return { success: false, error: 'Current password is incorrect' }
  }

  const newHash = await hash(newPassword, 12)
  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash: newHash },
  })

  return { success: true }
}
