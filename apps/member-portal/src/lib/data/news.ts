import { cache } from 'react'
import { prisma, getClubId } from '@/lib/db'

export const getAnnouncements = cache(async () => {
  const clubId = await getClubId()
  const now = new Date()

  const announcements = await prisma.announcement.findMany({
    where: {
      clubId,
      publishedAt: { not: null, lte: now },
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: now } },
      ],
    },
    orderBy: [
      { isPinned: 'desc' },
      { publishedAt: 'desc' },
    ],
    take: 20,
  })

  return announcements.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    imageUrl: a.imageUrl,
    category: a.category,
    isPinned: a.isPinned,
    publishedAt: a.publishedAt!,
  }))
})

export const getAnnouncementById = cache(async (id: string) => {
  const clubId = await getClubId()

  const announcement = await prisma.announcement.findUnique({
    where: { id },
  })

  if (!announcement || announcement.clubId !== clubId) return null

  return {
    id: announcement.id,
    title: announcement.title,
    body: announcement.body,
    imageUrl: announcement.imageUrl,
    category: announcement.category,
    isPinned: announcement.isPinned,
    publishedAt: announcement.publishedAt,
  }
})
