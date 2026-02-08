import { cache } from 'react'
import { prisma, getClubId, getMemberId } from '@/lib/db'

export const getDiningVenues = cache(async () => {
  const clubId = await getClubId()
  const facilities = await prisma.facility.findMany({
    where: { clubId, isActive: true, category: 'DINING' },
    include: {
      resources: {
        where: { isActive: true, isBookable: true },
        select: { id: true, name: true, capacity: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  return facilities.map((f) => ({
    id: f.id,
    name: f.name,
    code: f.code,
    description: f.description,
    imageUrl: f.imageUrl,
    capacity: f.capacity,
    amenities: f.amenities,
    bookingDuration: f.bookingDuration,
    maxAdvanceDays: f.maxAdvanceDays,
    operatingHours: f.operatingHours as Record<string, { open: string; close: string }>,
    tableCount: f.resources.length,
  }))
})

export const getUpcomingDiningReservations = cache(async () => {
  const [clubId, memberId] = await Promise.all([getClubId(), getMemberId()])
  const bookings = await prisma.booking.findMany({
    where: {
      clubId,
      memberId,
      startTime: { gte: new Date() },
      status: { in: ['PENDING', 'CONFIRMED'] },
      facility: { category: 'DINING' },
    },
    include: {
      resource: {
        include: {
          facility: { select: { name: true, imageUrl: true } },
        },
      },
    },
    orderBy: { startTime: 'asc' },
    take: 10,
  })

  return bookings
    .filter((b) => b.resource !== null)
    .map((b) => ({
      id: b.id,
      bookingNumber: b.bookingNumber,
      status: b.status,
      startTime: b.startTime,
      endTime: b.endTime,
      guestCount: b.guestCount,
      tableName: b.resource!.name,
      venueName: b.resource!.facility.name,
      venueImage: b.resource!.facility.imageUrl,
    }))
})
