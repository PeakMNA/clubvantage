import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getEventById } from '@/lib/data/events'
import { EventDetailContent } from './event-detail-content'

export const metadata: Metadata = {
  title: 'Event Detail | Member Portal',
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = await getEventById(id)

  if (!event) {
    notFound()
  }

  return <EventDetailContent event={event} />
}
