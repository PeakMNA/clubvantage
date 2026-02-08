import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAnnouncementById } from '@/lib/data/news'
import { AnnouncementDetailContent } from './announcement-detail-content'

export const metadata: Metadata = {
  title: 'News Detail | Member Portal',
}

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const announcement = await getAnnouncementById(id)

  if (!announcement) {
    notFound()
  }

  return <AnnouncementDetailContent announcement={announcement} />
}
