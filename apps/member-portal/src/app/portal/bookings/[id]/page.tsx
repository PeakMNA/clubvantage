import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { getBookingById } from '@/lib/data'
import { FacilityBookingDetailContent } from './booking-detail-content'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const booking = await getBookingById(id)
  return {
    title: booking
      ? `${booking.resourceName} | Member Portal`
      : 'Booking | Member Portal',
  }
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const booking = await getBookingById(id)

  if (!booking) {
    notFound()
  }

  const durationHours = Math.floor(booking.durationMinutes / 60)
  const durationMins = booking.durationMinutes % 60
  const durationStr = durationHours > 0
    ? durationMins > 0 ? `${durationHours}h ${durationMins}m` : `${durationHours} hour${durationHours > 1 ? 's' : ''}`
    : `${durationMins} min`

  return (
    <FacilityBookingDetailContent
      booking={{
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        date: format(booking.startTime, 'EEEE, MMMM d, yyyy'),
        timeRange: `${format(booking.startTime, 'h:mm a')} - ${format(booking.endTime, 'h:mm a')}`,
        duration: durationStr,
        facilityName: booking.facilityName,
        resourceName: booking.resourceName,
        facilityCategory: booking.facilityCategory,
        facilityDescription: booking.facilityDescription,
        amenities: booking.amenities as string[],
        basePrice: booking.basePrice,
        tierDiscount: booking.tierDiscount,
        totalAmount: booking.totalAmount,
      }}
    />
  )
}
