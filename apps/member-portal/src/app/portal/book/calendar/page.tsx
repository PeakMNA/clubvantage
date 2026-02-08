import { redirect } from 'next/navigation'
import { getFacilityById } from '@/lib/data'
import { CalendarContent } from './calendar-content'

export default async function FacilityCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ facilityId?: string }>
}) {
  const { facilityId } = await searchParams

  if (!facilityId) {
    redirect('/portal/book')
  }

  const facility = await getFacilityById(facilityId)

  if (!facility) {
    redirect('/portal/book')
  }

  return <CalendarContent facility={facility} />
}
