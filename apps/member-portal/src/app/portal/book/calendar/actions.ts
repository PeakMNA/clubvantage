'use server'

import { prisma, getMemberId, getClubId } from '@/lib/db'

interface TimeSlotResult {
  time: string
  available: boolean
}

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

export async function getAvailableSlots(facilityId: string, dateStr: string): Promise<TimeSlotResult[]> {
  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    include: {
      resources: {
        where: { isActive: true, isBookable: true },
        select: { id: true },
      },
    },
  })

  if (!facility) return []

  const date = new Date(dateStr)
  const dayName = DAYS[date.getUTCDay()]!
  const hours = facility.operatingHours as Record<string, { open: string; close: string }> | null
  const dayHours = hours?.[dayName]

  if (!dayHours) return []

  const openHour = parseInt(dayHours.open.split(':')[0]!, 10)
  const closeHour = parseInt(dayHours.close.split(':')[0]!, 10)
  const slotDuration = facility.bookingDuration // minutes

  // Build the day's start and end for booking queries
  const dayStart = new Date(dateStr + 'T00:00:00Z')
  const dayEnd = new Date(dateStr + 'T23:59:59Z')

  const resourceIds = facility.resources.map((r) => r.id)
  if (resourceIds.length === 0) return []

  // Fetch all bookings for this facility's resources on this date
  const existingBookings = await prisma.booking.findMany({
    where: {
      resourceId: { in: resourceIds },
      status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
      startTime: { gte: dayStart },
      endTime: { lte: dayEnd },
    },
    select: { resourceId: true, startTime: true, endTime: true },
  })

  const slots: TimeSlotResult[] = []
  const totalResources = resourceIds.length

  for (let hour = openHour; hour < closeHour; hour++) {
    // Check if enough time remains for a full slot
    const slotEndHour = hour + slotDuration / 60
    if (slotEndHour > closeHour) break

    const slotStart = new Date(dateStr + `T${String(hour).padStart(2, '0')}:00:00Z`)
    const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000)

    // Count how many resources are booked during this slot
    const bookedCount = existingBookings.filter((b) => {
      return b.startTime < slotEnd && b.endTime > slotStart
    }).length

    slots.push({
      time: `${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
      available: bookedCount < totalResources,
    })
  }

  return slots
}

export async function createBookingAction(input: {
  facilityId: string
  date: string
  time: string
  durationHours: number
}): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  const [memberId, clubId] = await Promise.all([getMemberId(), getClubId()])

  const facility = await prisma.facility.findUnique({
    where: { id: input.facilityId },
    include: {
      resources: {
        where: { isActive: true, isBookable: true },
        select: { id: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!facility) return { success: false, error: 'Facility not found' }

  // Parse the time string (e.g., "10:00 AM") into 24h hour
  const timeParts = input.time.match(/^(\d+):(\d+)\s*(AM|PM)$/i)
  if (!timeParts) return { success: false, error: 'Invalid time format' }

  let hour = parseInt(timeParts[1]!, 10)
  const minute = parseInt(timeParts[2]!, 10)
  const ampm = timeParts[3]!.toUpperCase()
  if (ampm === 'PM' && hour !== 12) hour += 12
  if (ampm === 'AM' && hour === 12) hour = 0

  const durationMinutes = input.durationHours * 60
  const startTime = new Date(input.date + `T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00Z`)
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000)

  // Find an available resource
  const resourceIds = facility.resources.map((r) => r.id)
  const conflicting = await prisma.booking.findMany({
    where: {
      resourceId: { in: resourceIds },
      status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
    select: { resourceId: true },
  })

  const bookedResourceIds = new Set(conflicting.map((b) => b.resourceId))
  const availableResourceId = resourceIds.find((id) => !bookedResourceIds.has(id))

  if (!availableResourceId) {
    return { success: false, error: 'No available resources for this time slot' }
  }

  const basePrice = Number(facility.memberRate ?? 0) * input.durationHours
  const bookingNumber = `BK-${Date.now().toString(36).toUpperCase()}`

  const booking = await prisma.booking.create({
    data: {
      clubId,
      memberId,
      facilityId: input.facilityId,
      resourceId: availableResourceId,
      bookingNumber,
      bookingType: 'FACILITY',
      startTime,
      endTime,
      durationMinutes,
      status: 'CONFIRMED',
      basePrice,
      totalAmount: basePrice,
    },
  })

  return { success: true, bookingId: booking.id }
}
