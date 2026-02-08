import { cache } from 'react'
import { prisma, getClubId, getMemberId } from '@/lib/db'

export const getFacilities = cache(async () => {
  const clubId = await getClubId()
  const facilities = await prisma.facility.findMany({
    where: { clubId, isActive: true },
    include: {
      resources: {
        where: { isActive: true },
        select: { id: true, name: true },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  return facilities.map((f) => ({
    id: f.id,
    name: f.name,
    code: f.code,
    category: f.category,
    description: f.description,
    imageUrl: f.imageUrl,
    capacity: f.capacity,
    amenities: f.amenities,
    memberRate: Number(f.memberRate),
    guestRate: Number(f.guestRate),
    bookingDuration: f.bookingDuration,
    maxAdvanceDays: f.maxAdvanceDays,
    resourceCount: f.resources.length,
    resources: f.resources,
  }))
})

export const getFacilityBookings = cache(async () => {
  const [clubId, memberId] = await Promise.all([getClubId(), getMemberId()])
  const bookings = await prisma.booking.findMany({
    where: { clubId, memberId, resourceId: { not: null } },
    select: {
      id: true,
      status: true,
      startTime: true,
      endTime: true,
      resource: {
        select: {
          name: true,
          facility: { select: { name: true, category: true } },
        },
      },
    },
    orderBy: { startTime: 'desc' },
    take: 10,
  })

  return bookings.map((b) => ({
    id: b.id,
    status: b.status,
    startTime: b.startTime,
    endTime: b.endTime,
    resourceName: b.resource!.name,
    facilityName: b.resource!.facility.name,
    facilityCategory: b.resource!.facility.category,
  }))
})

export const getUpcomingFacilityBookings = cache(async () => {
  const [clubId, memberId] = await Promise.all([getClubId(), getMemberId()])
  const bookings = await prisma.booking.findMany({
    where: {
      clubId,
      memberId,
      startTime: { gte: new Date() },
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
    include: {
      resource: {
        include: {
          facility: { select: { name: true, category: true, description: true } },
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
      durationMinutes: b.durationMinutes,
      totalAmount: b.totalAmount ? Number(b.totalAmount) : Number(b.basePrice),
      resourceName: b.resource!.name,
      facilityName: b.resource!.facility.name,
      facilityCategory: b.resource!.facility.category,
    }))
})

export const getPastFacilityBookings = cache(async () => {
  const [clubId, memberId] = await Promise.all([getClubId(), getMemberId()])
  const bookings = await prisma.booking.findMany({
    where: {
      clubId,
      memberId,
      startTime: { lt: new Date() },
    },
    include: {
      resource: {
        include: {
          facility: { select: { name: true, category: true } },
        },
      },
    },
    orderBy: { startTime: 'desc' },
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
      durationMinutes: b.durationMinutes,
      totalAmount: b.totalAmount ? Number(b.totalAmount) : Number(b.basePrice),
      resourceName: b.resource!.name,
      facilityName: b.resource!.facility.name,
      facilityCategory: b.resource!.facility.category,
    }))
})

export const getFacilityById = cache(async (id: string) => {
  const facility = await prisma.facility.findUnique({
    where: { id },
    include: {
      resources: {
        where: { isActive: true, isBookable: true },
        select: { id: true, name: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!facility) return null

  return {
    id: facility.id,
    name: facility.name,
    code: facility.code,
    category: facility.category,
    description: facility.description,
    imageUrl: facility.imageUrl,
    capacity: facility.capacity,
    amenities: facility.amenities,
    memberRate: Number(facility.memberRate ?? 0),
    guestRate: Number(facility.guestRate ?? 0),
    bookingDuration: facility.bookingDuration,
    maxAdvanceDays: facility.maxAdvanceDays,
    operatingHours: facility.operatingHours as Record<string, { open: string; close: string }>,
    resources: facility.resources,
  }
})

export const getBookingById = cache(async (id: string) => {
  const memberId = await getMemberId()
  const booking = await prisma.booking.findFirst({
    where: { id, memberId },
    include: {
      resource: {
        include: {
          facility: true,
        },
      },
    },
  })

  if (!booking) return null

  return {
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    status: booking.status,
    startTime: booking.startTime,
    endTime: booking.endTime,
    durationMinutes: booking.durationMinutes,
    notes: booking.notes,
    basePrice: Number(booking.basePrice),
    tierDiscount: Number(booking.tierDiscount),
    totalAmount: booking.totalAmount ? Number(booking.totalAmount) : Number(booking.basePrice),
    resourceName: booking.resource?.name ?? 'Unknown',
    facilityName: booking.resource?.facility.name ?? 'Unknown',
    facilityCategory: booking.resource?.facility.category ?? 'Unknown',
    facilityDescription: booking.resource?.facility.description ?? '',
    amenities: booking.resource?.facility.amenities ?? [],
  }
})
