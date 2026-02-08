'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@clubvantage/ui'
import {
  ArrowLeft,
  Share2,
  CalendarPlus,
  Copy,
  Check,
} from 'lucide-react'
import { useState } from 'react'
import { CancelBookingDialog } from '@/components/portal/bookings/cancel-booking-dialog'
import { RescheduleDialog } from '@/components/portal/bookings/reschedule-dialog'
import { useToast } from '@/components/portal/toast'
import { cancelBooking, rescheduleBooking } from '../actions'

interface BookingData {
  id: string
  bookingNumber: string
  status: string
  date: string
  timeRange: string
  duration: string
  facilityName: string
  resourceName: string
  facilityCategory: string
  facilityDescription: string
  amenities: string[]
  basePrice: number
  tierDiscount: number
  totalAmount: number
}

const statusStyles: Record<string, { label: string; bg: string; text: string }> = {
  CONFIRMED: { label: 'Confirmed', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  PENDING: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700' },
  COMPLETED: { label: 'Completed', bg: 'bg-stone-100', text: 'text-stone-600' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-600' },
}

export function FacilityBookingDetailContent({ booking }: { booking: BookingData }) {
  const router = useRouter()
  const { toast } = useToast()
  const [copiedId, setCopiedId] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isRescheduling, setIsRescheduling] = useState(false)

  const status = statusStyles[booking.status] ?? { label: booking.status, bg: 'bg-stone-100', text: 'text-stone-600' }
  const canCancel = booking.status === 'CONFIRMED' || booking.status === 'PENDING'

  const handleCancelBooking = async () => {
    setIsCancelling(true)
    const result = await cancelBooking(booking.id)
    setIsCancelling(false)

    if (result.success) {
      setShowCancelDialog(false)
      toast('Booking cancelled successfully')
      router.push('/portal/book')
    } else {
      toast(result.error ?? 'Failed to cancel booking')
    }
  }

  const handleReschedule = async (newDate: string, newTime: string) => {
    setIsRescheduling(true)
    const result = await rescheduleBooking(booking.id, newDate, newTime)
    setIsRescheduling(false)

    if (result.success) {
      setShowRescheduleDialog(false)
      toast('Booking rescheduled successfully')
      router.refresh()
    } else {
      toast(result.error ?? 'Failed to reschedule booking')
    }
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(booking.bookingNumber)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative">
        <div className="h-64 overflow-hidden bg-stone-200" />

        {/* Floating nav buttons */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pt-safe">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 text-stone-900" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
            <Share2 className="h-4 w-4 text-stone-900" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-36">
        {/* Title Section */}
        <div className="pt-5 pb-4 border-b border-stone-100">
          <div className="flex items-start justify-between">
            <h1 className="text-[22px] font-semibold text-stone-900">{booking.resourceName}</h1>
            <span
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold mt-1',
                status.bg,
                status.text
              )}
            >
              {status.label}
            </span>
          </div>
          <p className="text-[15px] text-stone-500 mt-1">{booking.facilityName} &middot; {booking.facilityCategory}</p>
          <button
            onClick={handleCopyId}
            className="flex items-center gap-1.5 mt-2 text-xs text-stone-400"
          >
            <span className="font-mono">{booking.bookingNumber}</span>
            {copiedId ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>

        {/* Date & Time */}
        <div className="py-5 border-b border-stone-100 space-y-4">
          <div>
            <p className="text-[15px] font-medium text-stone-900">{booking.date}</p>
            <p className="text-sm text-stone-500">{booking.timeRange}</p>
          </div>
          <div>
            <p className="text-[15px] font-medium text-stone-900">Duration</p>
            <p className="text-sm text-stone-500">{booking.duration}</p>
          </div>
        </div>

        {/* Amenities */}
        {booking.amenities.length > 0 && (
          <div className="py-5 border-b border-stone-100">
            <h3 className="text-base font-semibold text-stone-900 mb-3">What this place offers</h3>
            <div className="space-y-3">
              {booking.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-stone-400" />
                  <span className="text-[15px] text-stone-600">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {booking.facilityDescription && (
          <div className="py-5 border-b border-stone-100">
            <h3 className="text-base font-semibold text-stone-900 mb-2">Things to know</h3>
            <p className="text-[15px] text-stone-500 leading-relaxed">{booking.facilityDescription}</p>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="py-5 border-b border-stone-100">
          <h3 className="text-base font-semibold text-stone-900 mb-3">Price details</h3>
          <div className="space-y-2.5">
            <div className="flex justify-between text-[15px]">
              <span className="text-stone-500">Base Price</span>
              <span className="text-stone-900">฿{booking.basePrice.toLocaleString()}</span>
            </div>
            {booking.tierDiscount > 0 && (
              <div className="flex justify-between text-[15px]">
                <span className="text-stone-500">Member Discount</span>
                <span className="text-emerald-600">-฿{booking.tierDiscount.toLocaleString()}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-stone-100">
            <span className="text-base font-semibold text-stone-900">Total</span>
            <span className="text-base font-semibold text-stone-900">
              ฿{booking.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="py-5 border-b border-stone-100">
          <h3 className="text-base font-semibold text-stone-900 mb-2">Cancellation policy</h3>
          <p className="text-[15px] text-stone-500 leading-relaxed">
            Free cancellation up to 24 hours before. Late cancellations may incur a 50% fee.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 pt-5">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-200 text-sm font-medium text-stone-700">
            <CalendarPlus className="h-4 w-4" />
            Add to Calendar
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-200 text-sm font-medium text-stone-700">
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-24 left-0 right-0 z-40 px-5 py-4 bg-white border-t border-stone-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-stone-900">
              ฿{booking.totalAmount.toLocaleString()}
            </p>
            <p className="text-xs text-stone-500 underline">{booking.duration}</p>
          </div>
          <div className="flex gap-2">
            {canCancel && (
              <button
                onClick={() => setShowCancelDialog(true)}
                className="px-5 py-3 rounded-xl text-sm font-semibold text-stone-600 border border-stone-300"
              >
                Cancel
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => setShowRescheduleDialog(true)}
                className="px-5 py-3 rounded-xl text-sm font-semibold bg-stone-900 text-white"
              >
                Reschedule
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation */}
      <CancelBookingDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelBooking}
        bookingTitle={booking.resourceName}
        bookingDate={booking.date}
        bookingTime={booking.timeRange}
        isLoading={isCancelling}
      />

      {/* Reschedule Dialog */}
      <RescheduleDialog
        isOpen={showRescheduleDialog}
        onClose={() => setShowRescheduleDialog(false)}
        onConfirm={handleReschedule}
        bookingTitle={booking.resourceName}
        currentDate={booking.date}
        currentTime={booking.timeRange}
        isLoading={isRescheduling}
      />
    </div>
  )
}
