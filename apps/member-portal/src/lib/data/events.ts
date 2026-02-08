import { cache } from 'react'
import { prisma, getClubId, getMemberId } from '@/lib/db'

export const getUpcomingEvents = cache(async () => {
  const clubId = await getClubId()
  const events = await prisma.event.findMany({
    where: {
      clubId,
      isPublished: true,
      startDate: { gte: new Date() },
    },
    include: {
      _count: { select: { registrations: { where: { status: 'REGISTERED' } } } },
    },
    orderBy: { startDate: 'asc' },
    take: 20,
  })

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    imageUrl: e.imageUrl,
    category: e.category,
    location: e.location,
    startDate: e.startDate,
    endDate: e.endDate,
    capacity: e.capacity,
    price: e.price ? Number(e.price) : null,
    isFeatured: e.isFeatured,
    registeredCount: e._count.registrations,
    spotsLeft: e.capacity ? e.capacity - e._count.registrations : null,
  }))
})

export const getEventById = cache(async (id: string) => {
  const [clubId, memberId] = await Promise.all([getClubId(), getMemberId()])

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      _count: { select: { registrations: { where: { status: 'REGISTERED' } } } },
      registrations: {
        where: { memberId, status: 'REGISTERED' },
        take: 1,
      },
    },
  })

  if (!event || event.clubId !== clubId) return null

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    imageUrl: event.imageUrl,
    category: event.category,
    location: event.location,
    startDate: event.startDate,
    endDate: event.endDate,
    capacity: event.capacity,
    price: event.price ? Number(event.price) : null,
    isFeatured: event.isFeatured,
    registeredCount: event._count.registrations,
    spotsLeft: event.capacity ? event.capacity - event._count.registrations : null,
    isRegistered: event.registrations.length > 0,
  }
})
