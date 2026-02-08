import { cache } from 'react'
import { prisma, getMemberId, getClubId } from '@/lib/db'

export const getMemberProfile = cache(async () => {
  const memberId = await getMemberId()
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      membershipType: true,
      dependents: true,
    },
  })

  if (!member) throw new Error('Member not found')

  return {
    id: member.id,
    memberId: member.memberId,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email ?? '',
    phone: member.phone ?? '',
    avatarUrl: member.avatarUrl,
    membershipType: member.membershipType.name,
    joinDate: member.joinDate,
    status: member.status,
    outstandingBalance: Number(member.outstandingBalance),
    creditBalance: Number(member.creditBalance),
    dependentCount: member.dependents.length,
  }
})

export const getMemberStats = cache(async () => {
  const [clubId, memberId] = await Promise.all([getClubId(), getMemberId()])
  const [teeTimeCount, bookingCount, member] = await Promise.all([
    prisma.teeTime.count({
      where: {
        clubId,
        status: 'COMPLETED',
      },
    }),
    prisma.booking.count({
      where: {
        clubId,
      },
    }),
    prisma.member.findUnique({
      where: { id: memberId },
      select: { joinDate: true },
    }),
  ])

  return {
    rounds: teeTimeCount,
    bookings: bookingCount,
    memberSince: member?.joinDate.getFullYear() ?? 2024,
  }
})
