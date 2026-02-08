import type { Metadata } from 'next'
import { format } from 'date-fns'
import { getGolfCourses, getAvailableTeeTimes } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Book Tee Time | Member Portal',
}
import { BrowseContent } from './browse-content'

export default async function BrowseTeeTimes() {
  const today = format(new Date(), 'yyyy-MM-dd')

  const [courses, slots] = await Promise.all([
    getGolfCourses(),
    getAvailableTeeTimes(today),
  ])

  return (
    <BrowseContent
      courses={courses}
      initialSlots={slots.map((s) => ({
        id: s.id,
        time: s.time,
        spotsBooked: s.spotsBooked,
        maxSpots: s.maxSpots,
        price: s.price,
        status: s.status,
      }))}
      initialDate={today}
    />
  )
}
