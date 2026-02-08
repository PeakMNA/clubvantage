'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@clubvantage/ui'
import {
  Calendar,
  Clock,
  Plus,
  Flag,
} from 'lucide-react'
import { format } from 'date-fns'

type Tab = 'upcoming' | 'past'

interface BookingItem {
  id: string
  type: 'golf' | 'facility'
  title: string
  location: string
  date: string // ISO string
  time: string
  status: string
  playerCount?: number
}

const statusStyles: Record<string, { label: string; text: string }> = {
  CONFIRMED: { label: 'Confirmed', text: 'text-emerald-600' },
  PENDING: { label: 'Pending', text: 'text-amber-600' },
  COMPLETED: { label: 'Completed', text: 'text-stone-500' },
  CANCELLED: { label: 'Cancelled', text: 'text-red-500' },
  CHECKED_IN: { label: 'Checked In', text: 'text-blue-600' },
  IN_PROGRESS: { label: 'In Progress', text: 'text-blue-600' },
}

export function BookingsContent({
  upcoming,
  past,
}: {
  upcoming: BookingItem[]
  past: BookingItem[]
}) {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming')

  const bookings = activeTab === 'upcoming' ? upcoming : past

  return (
    <div className="px-5 py-6 pb-36">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-semibold text-stone-900">My Bookings</h1>
        <Link
          href="/portal/book"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-stone-900 text-white"
        >
          <Plus className="h-4 w-4" />
          Book
        </Link>
      </div>

      {/* Tab Underlines */}
      <div className="flex gap-6 border-b border-stone-100 mb-5">
        {(['upcoming', 'past'] as Tab[]).map((tab) => {
          const count = tab === 'upcoming' ? upcoming.length : past.length
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'pb-3 text-sm font-medium transition-all relative capitalize',
                activeTab === tab
                  ? 'text-stone-900'
                  : 'text-stone-500'
              )}
            >
              {tab} ({count})
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Booking Cards */}
      <div className="space-y-6">
        {bookings.map((booking) => {
          const status = statusStyles[booking.status] ?? { label: booking.status, text: 'text-stone-500' }
          const href = booking.type === 'golf'
            ? `/portal/golf/bookings/${booking.id}`
            : `/portal/bookings/${booking.id}`
          const date = new Date(booking.date)
          return (
            <Link
              key={booking.id}
              href={href}
              className="block group"
            >
              <div className="rounded-xl border border-stone-100 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-50 flex-shrink-0">
                      {booking.type === 'golf' ? (
                        <Flag className="h-5 w-5 text-stone-600" />
                      ) : (
                        <Calendar className="h-5 w-5 text-stone-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-stone-900">
                        {booking.title}
                      </h3>
                      <p className="text-sm text-stone-500 mt-0.5">{booking.location}</p>
                    </div>
                  </div>
                  <span className={cn('text-xs font-medium mt-0.5', status.text)}>
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-stone-500 mt-3 ml-14">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(date, 'MMM d')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {booking.time}
                  </span>
                  {booking.playerCount && (
                    <span>{booking.playerCount} players</span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Empty State */}
      {bookings.length === 0 && (
        <div className="text-center py-16">
          <Clock className="mx-auto h-10 w-10 text-stone-300 mb-3" />
          <p className="font-medium text-stone-600">
            {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
          </p>
          <p className="text-sm text-stone-400 mt-1">
            {activeTab === 'upcoming' ? 'Book a facility or tee time' : 'Your booking history will appear here'}
          </p>
        </div>
      )}
    </div>
  )
}
