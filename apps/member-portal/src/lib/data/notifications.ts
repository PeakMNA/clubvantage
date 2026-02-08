import { cache } from 'react'
import { prisma, getMemberId, getClubId } from '@/lib/db'

export const getNotifications = cache(async () => {
  const [memberId, clubId] = await Promise.all([getMemberId(), getClubId()])

  const notifications = await prisma.notification.findMany({
    where: {
      clubId,
      OR: [
        { memberId },
        { memberId: null }, // Club-wide notifications
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  return notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    read: !!n.readAt,
    createdAt: n.createdAt,
    channel: n.channel,
  }))
})

export const getUnreadCount = cache(async () => {
  const [memberId, clubId] = await Promise.all([getMemberId(), getClubId()])

  return prisma.notification.count({
    where: {
      clubId,
      readAt: null,
      OR: [
        { memberId },
        { memberId: null },
      ],
    },
  })
})
