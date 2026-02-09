'use server'

import { prisma, getMemberId, getClubId } from '@/lib/db'

export async function registerForEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  const [memberId, clubId] = await Promise.all([getMemberId(), getClubId()])

  const event = await prisma.event.findFirst({
    where: { id: eventId, clubId },
    include: {
      _count: { select: { registrations: { where: { status: 'REGISTERED' } } } },
    },
  })

  if (!event) return { success: false, error: 'Event not found' }

  if (event.capacity && event._count.registrations >= event.capacity) {
    return { success: false, error: 'Event is full' }
  }

  // Check if already registered
  const existing = await prisma.eventRegistration.findUnique({
    where: { eventId_memberId: { eventId, memberId } },
  })

  if (existing && existing.status === 'REGISTERED') {
    return { success: false, error: 'Already registered' }
  }

  await prisma.eventRegistration.upsert({
    where: { eventId_memberId: { eventId, memberId } },
    update: { status: 'REGISTERED' },
    create: {
      eventId,
      memberId,
      status: 'REGISTERED',
    },
  })

  return { success: true }
}

export async function unregisterFromEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  const memberId = await getMemberId()

  await prisma.eventRegistration.updateMany({
    where: { eventId, memberId, status: 'REGISTERED' },
    data: { status: 'CANCELLED' },
  })

  return { success: true }
}
