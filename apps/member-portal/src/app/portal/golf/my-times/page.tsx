import type { Metadata } from 'next'
import { getUpcomingTeeTimes, getPastTeeTimes } from '@/lib/data'

export const metadata: Metadata = {
  title: 'My Tee Times | Member Portal',
}
import { MyTimesContent } from './my-times-content'

export default async function MyTeeTimesPage() {
  const [upcoming, past] = await Promise.all([
    getUpcomingTeeTimes(),
    getPastTeeTimes(),
  ])

  // Serialize dates to ISO strings for client component
  const serializeTeeTimes = (times: typeof upcoming) =>
    times.map((t) => ({
      id: t.id,
      date: t.date.toISOString(),
      time: t.time,
      courseName: t.courseName,
      status: t.status,
      playerCount: t.playerCount,
    }))

  return (
    <MyTimesContent
      upcoming={serializeTeeTimes(upcoming)}
      past={serializeTeeTimes(past)}
    />
  )
}
