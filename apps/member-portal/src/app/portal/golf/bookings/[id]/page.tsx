import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { getTeeTimeById } from '@/lib/data'
import { BookingDetailContent } from './booking-detail-content'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const teeTime = await getTeeTimeById(id)
  return {
    title: teeTime
      ? `${teeTime.courseName} - ${teeTime.time} | Member Portal`
      : 'Tee Time | Member Portal',
  }
}

export default async function GolfBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const teeTime = await getTeeTimeById(id)

  if (!teeTime) {
    notFound()
  }

  return (
    <BookingDetailContent
      booking={{
        id: teeTime.id,
        date: teeTime.date.toISOString(),
        dateFormatted: format(teeTime.date, 'EEEE, MMMM d, yyyy'),
        time: teeTime.time,
        holes: teeTime.holes,
        status: teeTime.status,
        courseName: teeTime.courseName,
        courseHoles: teeTime.courseHoles,
        coursePar: teeTime.coursePar,
        players: teeTime.players,
      }}
    />
  )
}
