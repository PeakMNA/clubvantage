'use client'

import { useState, useEffect } from 'react'
import { cn, Button, Badge } from '@clubvantage/ui'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  User,
  Copy,
  Check,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { CancelBookingDialog, ModifyBookingModal } from '@/components/portal/bookings'
import type { PortalBooking, TimeSlot } from '@/lib/types'
import {
  fetchBookingById,
  cancelBooking,
  rescheduleBooking,
  fetchFacilityAvailability,
  fetchServiceAvailability,
} from '../actions'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(time: string | undefined): string {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours ?? '0', 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes ?? '00'} ${ampm}`
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount)
}

const statusConfig = {
  pending: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700' },
  confirmed: { label: 'Confirmed', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  checked_in: { label: 'Checked In', bg: 'bg-blue-100', text: 'text-blue-700' },
  completed: { label: 'Completed', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  cancelled: { label: 'Cancelled', bg: 'bg-stone-100', text: 'text-stone-500' },
  no_show: { label: 'No Show', bg: 'bg-red-100', text: 'text-red-700' },
}

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = typeof params.id === 'string' ? params.id : ''

  const [booking, setBooking] = useState<PortalBooking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [isRescheduling, setIsRescheduling] = useState(false)

  const loadBooking = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchBookingById(bookingId)
      setBooking(data)
    } catch (err) {
      console.error('Failed to load booking:', err)
      setError('Unable to load booking details. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBooking()
  }, [bookingId])

  const handleCopyId = () => {
    navigator.clipboard.writeText(bookingId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      const result = await cancelBooking(bookingId)
      if (result.success) {
        router.push('/portal/bookings')
      }
    } catch (error) {
      console.error('Failed to cancel:', error)
    } finally {
      setIsCancelling(false)
      setShowCancelDialog(false)
    }
  }

  const handleReschedule = async (newDate: string, newStartTime: string) => {
    setIsRescheduling(true)
    try {
      const result = await rescheduleBooking(bookingId, newDate, newStartTime)
      if (result.success) {
        // Reload booking to show updated date/time
        await loadBooking()
        setShowModifyModal(false)
      } else {
        console.error('Failed to reschedule:', result.error)
      }
    } catch (error) {
      console.error('Failed to reschedule:', error)
    } finally {
      setIsRescheduling(false)
    }
  }

  const fetchTimeSlots = async (date: string): Promise<TimeSlot[]> => {
    if (!booking) return []
    if (booking.type === 'facility') {
      return fetchFacilityAvailability(booking.facility.id, date)
    } else {
      return fetchServiceAvailability(
        booking.service.id,
        date,
        booking.staff?.id
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/30 dark:bg-red-500/10">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <p className="mb-1 font-medium text-red-700 dark:text-red-400">Something went wrong</p>
          <p className="mb-4 text-sm text-red-600 dark:text-red-300">{error}</p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadBooking}
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-500/20"
            >
              <RefreshCw className="mr-1.5 h-4 w-4" />
              Try Again
            </Button>
            <Link href="/portal/bookings">
              <Button variant="outline" size="sm">
                Back to Bookings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Booking not found</p>
        <Link href="/portal/bookings">
          <Button variant="outline" className="mt-4">
            Back to Bookings
          </Button>
        </Link>
      </div>
    )
  }

  const statusStyle = statusConfig[booking.status]
  const title = booking.type === 'facility' ? booking.facility.name : booking.service.name
  const location = booking.type === 'facility'
    ? booking.facility.location
    : booking.facility?.location
  const canCancel = ['pending', 'confirmed'].includes(booking.status)

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/portal/bookings">
          <button className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <h1 className="text-lg font-bold text-foreground">Booking Details</h1>
      </div>

      {/* Booking ID */}
      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
        <span className="text-xs text-muted-foreground">
          Booking ID: <span className="font-mono font-medium">{booking.id}</span>
        </span>
        <button
          onClick={handleCopyId}
          className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
        >
          {copiedId ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Main Card */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {booking.type === 'service' && booking.variation && (
              <p className="text-sm text-muted-foreground">{booking.variation.name}</p>
            )}
          </div>
          <Badge className={cn('text-xs', statusStyle.bg, statusStyle.text)}>
            {statusStyle.label}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{formatDate(booking.date)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
            </span>
          </div>
          {location && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{location}</span>
            </div>
          )}
          {booking.type === 'service' && booking.staff && (
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{booking.staff.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium text-foreground">Price Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Price</span>
            <span className="text-foreground">{formatCurrency(booking.pricing.base)}</span>
          </div>
          {booking.pricing.modifiers.map((mod, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{mod.label}</span>
              <span
                className={cn(
                  mod.type === 'discount'
                    ? 'text-emerald-600'
                    : 'text-foreground'
                )}
              >
                {mod.type === 'discount' ? '-' : '+'}
                {formatCurrency(Math.abs(mod.amount))}
              </span>
            </div>
          ))}
          <div className="my-2 border-t border-border" />
          <div className="flex justify-between">
            <span className="font-medium text-foreground">Total</span>
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(booking.pricing.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium text-foreground">Cancellation Policy</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            Full refund if cancelled before{' '}
            {new Date(booking.cancellationPolicy.fullRefundBefore).toLocaleString()}
          </p>
          <p>
            {booking.cancellationPolicy.partialRefundPercent}% refund if cancelled before{' '}
            {new Date(booking.cancellationPolicy.partialRefundBefore).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Actions */}
      {canCancel && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowModifyModal(true)}
          >
            Reschedule
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCancelDialog(true)}
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
          >
            Cancel Booking
          </Button>
        </div>
      )}

      {/* Cancel Dialog */}
      <CancelBookingDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancel}
        bookingTitle={title}
        bookingDate={formatDate(booking.date)}
        bookingTime={`${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`}
        refundAmount={booking.pricing.total}
        refundPercentage={100}
        isLoading={isCancelling}
      />

      {/* Modify Booking Modal */}
      <ModifyBookingModal
        isOpen={showModifyModal}
        onClose={() => setShowModifyModal(false)}
        onConfirm={handleReschedule}
        booking={booking}
        fetchTimeSlots={fetchTimeSlots}
        isLoading={isRescheduling}
      />
    </div>
  )
}
