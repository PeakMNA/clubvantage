'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Share2,
  CalendarPlus,
} from 'lucide-react'
import { CancelBookingDialog } from '@/components/portal/bookings/cancel-booking-dialog'
import { useToast } from '@/components/portal/toast'
import { cancelGolfBooking } from '../../actions'

interface PlayerData {
  id: string
  position: number
  playerType: string
  name: string
  initials: string
  greenFee: number
  cartFee: number
  caddyFee: number
}

interface BookingData {
  id: string
  date: string
  dateFormatted: string
  time: string
  holes: number
  status: string
  courseName: string
  courseHoles: number
  coursePar: number
  players: PlayerData[]
}

const playerTypeLabels: Record<string, string> = {
  MEMBER: 'Member',
  DEPENDENT: 'Dependent',
  GUEST: 'Guest',
  WALK_UP: 'Walk-up',
}

export function BookingDetailContent({ booking }: { booking: BookingData }) {
  const router = useRouter()
  const { toast } = useToast()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const totalPrice = booking.players.reduce((sum, p) => sum + p.greenFee + p.cartFee + p.caddyFee, 0)
  const canCancel = booking.status === 'CONFIRMED' || booking.status === 'PENDING'

  const handleCancelBooking = async () => {
    setIsCancelling(true)
    const result = await cancelGolfBooking(booking.id)
    setIsCancelling(false)

    if (result.success) {
      setShowCancelDialog(false)
      toast('Tee time cancelled successfully')
      router.push('/portal/golf')
    } else {
      toast(result.error ?? 'Failed to cancel tee time')
    }
  }
  const filledPlayers = booking.players.length
  const maxPlayers = 4

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="relative">
        <div className="h-64 overflow-hidden bg-stone-200">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* Floating nav */}
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

        {/* Title on image */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{booking.courseName}</h1>
              <p className="text-sm text-white/80">{booking.courseHoles} Holes &middot; Par {booking.coursePar}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold text-white">
              {booking.status === 'CONFIRMED' ? 'Confirmed' : booking.status === 'PENDING' ? 'Pending' : booking.status}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-36">
        {/* Date & Time */}
        <div className="py-5 border-b border-stone-100">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-stone-50">
              <span className="text-lg font-bold text-stone-900 leading-none">
                {new Date(booking.date).getDate()}
              </span>
              <span className="text-[10px] font-semibold text-stone-500 uppercase">
                {new Date(booking.date).toLocaleString('en', { month: 'short' })}
              </span>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-stone-900">{booking.time}</p>
              <p className="text-sm text-stone-500">{booking.dateFormatted}</p>
            </div>
          </div>
          <p className="text-sm text-stone-500 mt-3">
            {booking.holes} holes &middot; Starting from Hole 1
          </p>
        </div>

        {/* Players */}
        <div className="py-5 border-b border-stone-100">
          <h3 className="text-base font-semibold text-stone-900 mb-4">
            Players ({filledPlayers} of {maxPlayers})
          </h3>
          <div className="space-y-3">
            {booking.players.map((player) => (
              <div key={player.id} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white text-sm font-semibold flex-shrink-0">
                  {player.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-stone-900">{player.name}</p>
                  <p className="text-xs text-stone-500">{playerTypeLabels[player.playerType] ?? player.playerType}</p>
                </div>
              </div>
            ))}
            {/* Open slots */}
            {Array.from({ length: maxPlayers - filledPlayers }).map((_, i) => (
              <div key={`open-${i}`} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-stone-300 text-stone-400 text-sm font-semibold flex-shrink-0">
                  +
                </div>
                <p className="text-[15px] text-stone-400">Open Slot</p>
              </div>
            ))}
          </div>
        </div>

        {/* Price details */}
        <div className="py-5 border-b border-stone-100">
          <h3 className="text-base font-semibold text-stone-900 mb-3">Price details</h3>
          <div className="space-y-2.5">
            {booking.players.map((player) => (
              <div key={player.id}>
                {player.greenFee > 0 && (
                  <div className="flex items-center justify-between text-[15px]">
                    <span className="text-stone-500">Green Fee ({playerTypeLabels[player.playerType] ?? player.playerType})</span>
                    <span className="text-stone-900">฿{player.greenFee.toLocaleString()}</span>
                  </div>
                )}
                {player.cartFee > 0 && (
                  <div className="flex items-center justify-between text-[15px]">
                    <span className="text-stone-500">Cart ({player.initials})</span>
                    <span className="text-stone-900">฿{player.cartFee.toLocaleString()}</span>
                  </div>
                )}
                {player.caddyFee > 0 && (
                  <div className="flex items-center justify-between text-[15px]">
                    <span className="text-stone-500">Caddy ({player.initials})</span>
                    <span className="text-stone-900">฿{player.caddyFee.toLocaleString()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
            <span className="text-base font-semibold text-stone-900">Total</span>
            <span className="text-base font-semibold text-stone-900">
              ฿{totalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Cancellation policy */}
        <div className="py-5 border-b border-stone-100">
          <h3 className="text-base font-semibold text-stone-900 mb-2">Cancellation policy</h3>
          <p className="text-[15px] text-stone-500 leading-relaxed">
            Free cancellation up to 24 hours before tee time. Late cancellations may incur a 50% fee.
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
      <div className="fixed bottom-[100px] left-0 right-0 z-40 px-5 py-3 bg-white/95 backdrop-blur-sm border-t border-stone-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-stone-900">
              ฿{totalPrice.toLocaleString()}
            </p>
            <p className="text-xs text-stone-500 underline">{booking.holes} holes</p>
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
                className="px-5 py-3 rounded-xl text-sm font-semibold bg-stone-900 text-white"
              >
                Modify
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
        bookingTitle={booking.courseName}
        bookingDate={booking.dateFormatted}
        bookingTime={booking.time}
        isLoading={isCancelling}
      />
    </div>
  )
}
