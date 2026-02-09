import { cache } from 'react'
import { prisma, getClubId, getMemberId } from '@/lib/db'

export const getDirectoryMembers = cache(async (search?: string) => {
  const clubId = await getClubId()

  const members = await prisma.member.findMany({
    where: {
      clubId,
      status: 'ACTIVE',
      isActive: true,
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' as const } },
              { lastName: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      joinDate: true,
      membershipType: { select: { name: true } },
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    take: 50,
  })

  return members.map((m) => ({
    id: m.id,
    firstName: m.firstName,
    lastInitial: m.lastName[0] ?? '',
    avatarUrl: m.avatarUrl,
    memberSince: m.joinDate.getFullYear(),
    membershipType: m.membershipType.name,
  }))
})

export const getDirectoryMember = cache(async (id: string) => {
  const clubId = await getClubId()

  const member = await prisma.member.findFirst({
    where: { id, clubId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      joinDate: true,
      membershipType: { select: { name: true } },
      interests: { select: { category: { select: { name: true } } } },
    },
  })

  if (!member) return null

  return {
    id: member.id,
    firstName: member.firstName,
    lastInitial: member.lastName[0] ?? '',
    avatarUrl: member.avatarUrl,
    memberSince: member.joinDate.getFullYear(),
    membershipType: member.membershipType.name,
    interests: member.interests.map((i) => i.category.name),
  }
})
