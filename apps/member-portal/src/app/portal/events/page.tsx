import type { Metadata } from 'next'
import { getUpcomingEvents } from '@/lib/data/events'
import { EventsContent } from './events-content'

export const metadata: Metadata = {
  title: 'Events | Member Portal',
}

export default async function EventsPage() {
  const events = await getUpcomingEvents()
  return <EventsContent events={events} />
}
