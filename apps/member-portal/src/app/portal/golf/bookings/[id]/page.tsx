'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { cn } from '@clubvantage/ui'
import {
  ArrowLeft,
  Clock,
  Users,
  Car,
  Flag,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { StatusBadge } from '@/components/portal/status-badge'
import { PlayerChip } from '@/components/portal/player-chip'
import { fetchGolfBookingById, cancelGolfBooking } from '../../actions'
import type { TeeTimeBooking } from '@/lib/types'

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<TeeTimeBooking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  useEffect(() => {
    async function loadBooking() {
      if (!bookingId) return

      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchGolfBookingById(bookingId)
        if (data) {
          setBooking(data)
        } else {
          setError('Booking not found')
        }
      } catch (err) {
        console.error('Error loading booking:', err)
        setError('Failed to load booking details')
      } finally {
        setIsLoading(false)
      }
    }

    loadBooking()
  }, [bookingId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
        <div className="sticky top-0 z-10 bg-white dark:bg-stone-900 border-b border-border/60">
          <div className="flex items-center gap-4 px-4 py-3">
            <button
              onClick={() => router.push('/portal/golf')}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <ArrowLeft className="h-5 w-5 text-stone-600 dark:text-stone-400" />
            </button>
            <h1 className="font-semibold text-stone-900 dark:text-stone-100">
              Booking Details
            </h1>
          </div>
        </div>
        <div className="px-4 py-12 text-center">
          <p className="text-red-600 dark:text-red-400">{error || 'Booking not found'}</p>
          <button
            onClick={() => router.push('/portal/golf')}
            className="mt-4 text-amber-600 hover:underline"
          >
            Back to Golf
          </button>
        </div>
      </div>
    )
  }

  const date = parseISO(booking.date)
  const isPast = date < new Date()
  const canCancel =
    !isPast && booking.status !== 'cancelled' && booking.status !== 'completed'

  const handleCancel = async () => {
    setIsCancelling(true)
    setCancelError(null)

    try {
      const result = await cancelGolfBooking(booking.id)

      if (result.success) {
        router.push('/portal/golf?cancelled=true')
      } else {
        setCancelError(result.error || 'Failed to cancel booking')
      }
    } catch (err) {
      console.error('Error cancelling booking:', err)
      setCancelError('An unexpected error occurred')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-stone-900 border-b border-border/60">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={() => router.push('/portal/golf')}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <ArrowLeft className="h-5 w-5 text-stone-600 dark:text-stone-400" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-stone-900 dark:text-stone-100">
              Booking Details
            </h1>
          </div>
          <StatusBadge status={booking.status} size="md" />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-32">
        {/* Date & Course Card */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-white shadow-lg shadow-amber-500/25 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm">
              <span className="text-2xl font-bold leading-none">
                {format(date, 'd')}
              </span>
              <span className="text-xs font-medium uppercase opacity-90">
                {format(date, 'MMM')}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">{booking.courseName}</h2>
              <div className="flex items-center gap-2 text-amber-100">
                <Clock className="h-4 w-4" />
                <span>{booking.time}</span>
                <span>-</span>
                <span>
                  {booking.roundType === '18-hole' ? '18 holes' : '9 holes'}
                </span>
              </div>
              <p className="mt-2 text-sm text-amber-100">
                {format(date, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>

        {/* Players */}
        <section className="mb-6">
          <h3 className="text-sm font-medium text-stone-500 mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Players ({booking.players.length})
          </h3>
          <div className="rounded-2xl bg-white dark:bg-stone-800 border border-border/60 p-4">
            <div className="flex flex-wrap gap-2">
              {booking.players.map((player) => (
                <PlayerChip key={player.id} player={player} />
              ))}
            </div>
          </div>
        </section>

        {/* Resources */}
        <section className="mb-6">
          <h3 className="text-sm font-medium text-stone-500 mb-3 flex items-center gap-2">
            <Car className="h-4 w-4" />
            Resources
          </h3>
          <div className="rounded-2xl bg-white dark:bg-stone-800 border border-border/60 p-4">
            <div className="space-y-3">
              {booking.cart && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-700">
                      <Car className="h-5 w-5 text-stone-600 dark:text-stone-400" />
                    </div>
                    <span className="font-medium text-stone-900 dark:text-stone-100">
                      Golf Cart
                    </span>
                  </div>
                  <span className="font-mono text-stone-600 dark:text-stone-400">
                    ฿500
                  </span>
                </div>
              )}
              {booking.caddy !== 'none' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-700">
                      <Flag className="h-5 w-5 text-stone-600 dark:text-stone-400" />
                    </div>
                    <span className="font-medium text-stone-900 dark:text-stone-100">
                      {booking.caddy === 'shared'
                        ? 'Shared Caddy'
                        : 'Individual Caddies'}
                    </span>
                  </div>
                  <span className="font-mono text-stone-600 dark:text-stone-400">
                    ฿
                    {booking.caddy === 'shared'
                      ? '1,500'
                      : (2500 * booking.players.length).toLocaleString()}
                  </span>
                </div>
              )}
              {!booking.cart && booking.caddy === 'none' && (
                <p className="text-stone-500 text-sm">No resources added</p>
              )}
            </div>
          </div>
        </section>

        {/* Pricing Summary */}
        <section className="mb-6">
          <h3 className="text-sm font-medium text-stone-500 mb-3">Summary</h3>
          <div className="rounded-2xl bg-white dark:bg-stone-800 border border-border/60 overflow-hidden">
            <div className="p-4 space-y-2">
              {booking.priceBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-stone-600 dark:text-stone-400">
                    {item.label}
                  </span>
                  <span className="font-mono text-stone-900 dark:text-stone-100">
                    ฿{item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4 bg-stone-50 dark:bg-stone-900/50 border-t border-border/60">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  Total
                </span>
                <span className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100">
                  ฿{booking.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Cancellation Policy */}
        {canCancel && (
          <section>
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                    Cancellation Policy
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Free cancellation up to 24 hours before tee time. Late
                    cancellations may incur a 50% fee.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Bottom Action */}
      {canCancel && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-stone-900 border-t border-border/60 pb-safe">
          <button
            onClick={() => setShowCancelModal(true)}
            className={cn(
              'w-full py-4 rounded-xl font-semibold text-base transition-all',
              'bg-red-50 text-red-600 hover:bg-red-100',
              'dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50'
            )}
          >
            Cancel Booking
          </button>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-t-3xl md:rounded-3xl p-6 pb-safe">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Cancel Booking?
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="h-5 w-5 text-stone-500" />
              </button>
            </div>

            {cancelError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {cancelError}
                </p>
              </div>
            )}

            <p className="text-stone-600 dark:text-stone-400 mb-6">
              Are you sure you want to cancel your tee time on{' '}
              <strong>{format(date, 'MMMM d')}</strong> at{' '}
              <strong>{booking.time}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="flex-1 py-3 rounded-xl font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className={cn(
                  'flex-1 py-3 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors',
                  isCancelling && 'opacity-75 cursor-not-allowed'
                )}
              >
                {isCancelling ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cancelling...
                  </span>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
