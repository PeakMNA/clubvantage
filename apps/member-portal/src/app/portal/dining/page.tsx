import type { Metadata } from 'next'
import { getDiningVenues, getUpcomingDiningReservations } from '@/lib/data/dining'
import { DiningContent } from './dining-content'

export const metadata: Metadata = {
  title: 'Dining | Member Portal',
}

export default async function DiningPage() {
  const [venues, reservations] = await Promise.all([
    getDiningVenues(),
    getUpcomingDiningReservations(),
  ])

  return <DiningContent venues={venues} reservations={reservations} />
}
