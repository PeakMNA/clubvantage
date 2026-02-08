import type { Metadata } from 'next'
import { getMyGuests, getGuestStats } from '@/lib/data/guests'
import { GuestsContent } from './guests-content'

export const metadata: Metadata = {
  title: 'Guest Management | Member Portal',
}

export default async function GuestsPage() {
  const [guests, stats] = await Promise.all([getMyGuests(), getGuestStats()])
  return <GuestsContent guests={guests} stats={stats} />
}
