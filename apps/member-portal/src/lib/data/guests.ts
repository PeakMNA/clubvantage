import { cache } from 'react'
import { prisma, getMemberId } from '@/lib/db'

export const getMyGuests = cache(async () => {
  const memberId = await getMemberId()

  const guests = await prisma.guest.findMany({
    where: { invitedById: memberId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      booking: {
        select: {
          id: true,
          startTime: true,
          facility: { select: { name: true } },
        },
      },
      teeTimePlayer: {
        select: {
          id: true,
          teeTime: {
            select: {
              teeDate: true,
              teeTime: true,
              course: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return guests.map((g) => {
    const venue = g.booking?.facility?.name
      ?? g.teeTimePlayer?.teeTime?.course?.name
      ?? null

    const visitDate = g.booking?.startTime
      ?? (g.teeTimePlayer?.teeTime?.teeDate ?? null)

    return {
      id: g.id,
      name: g.name,
      email: g.email,
      phone: g.phone,
      venue,
      visitDate,
      createdAt: g.createdAt,
    }
  })
})

export const getGuestStats = cache(async () => {
  const memberId = await getMemberId()

  const [totalGuests, thisMonthGuests] = await Promise.all([
    prisma.guest.count({ where: { invitedById: memberId } }),
    prisma.guest.count({
      where: {
        invitedById: memberId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ])

  return { totalGuests, thisMonthGuests }
})
