import type { Metadata } from 'next'
import { getUpcomingTeeTimes, getPastTeeTimes, getUpcomingFacilityBookings, getPastFacilityBookings } from '@/lib/data'

export const metadata: Metadata = {
  title: 'My Bookings | Member Portal',
}
import { format } from 'date-fns'
import { BookingsContent } from './bookings-content'

export default async function MyBookingsPage() {
  const [upcomingTee, pastTee, upcomingFacility, pastFacility] = await Promise.all([
    getUpcomingTeeTimes(),
    getPastTeeTimes(),
    getUpcomingFacilityBookings(),
    getPastFacilityBookings(),
  ])

  // Merge tee times and facility bookings into a unified format
  const upcoming = [
    ...upcomingTee.map((t) => ({
      id: t.id,
      type: 'golf' as const,
      title: t.courseName,
      location: `${t.playerCount} Players`,
      date: t.date.toISOString(),
      time: t.time,
      status: t.status,
      playerCount: t.playerCount,
    })),
    ...upcomingFacility.map((b) => ({
      id: b.id,
      type: 'facility' as const,
      title: b.facilityName,
      location: b.resourceName,
      date: b.startTime.toISOString(),
      time: format(b.startTime, 'h:mm a'),
      status: b.status,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const past = [
    ...pastTee.map((t) => ({
      id: t.id,
      type: 'golf' as const,
      title: t.courseName,
      location: `${t.playerCount} Players`,
      date: t.date.toISOString(),
      time: t.time,
      status: t.status,
      playerCount: t.playerCount,
    })),
    ...pastFacility.map((b) => ({
      id: b.id,
      type: 'facility' as const,
      title: b.facilityName,
      location: b.resourceName,
      date: b.startTime.toISOString(),
      time: format(b.startTime, 'h:mm a'),
      status: b.status,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return <BookingsContent upcoming={upcoming} past={past} />
}
