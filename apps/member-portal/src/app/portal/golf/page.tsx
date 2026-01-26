'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@clubvantage/ui'
import { Plus, Calendar, Flag, Loader2 } from 'lucide-react'
import { TeeTimeCard } from '@/components/portal/tee-time-card'
import { fetchMyGolfBookings } from './actions'
import type { TeeTimeBooking } from '@/lib/types'

type TabValue = 'upcoming' | 'past'

export default function GolfPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('upcoming')
  const [upcomingBookings, setUpcomingBookings] = useState<TeeTimeBooking[]>([])
  const [pastBookings, setPastBookings] = useState<TeeTimeBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadBookings() {
      setIsLoading(true)
      setError(null)
      try {
        const [upcoming, past] = await Promise.all([
          fetchMyGolfBookings('upcoming'),
          fetchMyGolfBookings('past'),
        ])
        setUpcomingBookings(upcoming)
        setPastBookings(past)
      } catch (err) {
        console.error('Error loading bookings:', err)
        setError('Failed to load bookings')
      } finally {
        setIsLoading(false)
      }
    }

    loadBookings()
  }, [])

  const displayedBookings =
    activeTab === 'upcoming' ? upcomingBookings : pastBookings

  return (
    <div className="px-4 py-6">
      {/* Header with Book button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Golf
        </h1>
        <Link
          href="/portal/golf/book"
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl',
            'bg-amber-500 text-white font-semibold text-sm',
            'hover:bg-amber-600 transition-colors',
            'shadow-lg shadow-amber-500/25'
          )}
        >
          <Plus className="h-4 w-4" />
          Book Tee Time
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={cn(
            'flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all',
            activeTab === 'upcoming'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
              : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming
            {upcomingBookings.length > 0 && (
              <span
                className={cn(
                  'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                  activeTab === 'upcoming'
                    ? 'bg-amber-500 text-white'
                    : 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300'
                )}
              >
                {upcomingBookings.length}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={cn(
            'flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all',
            activeTab === 'past'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
              : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
          )}
        >
          Past
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-6 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Bookings List */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {displayedBookings.length > 0 ? (
            displayedBookings.map((booking) => (
              <TeeTimeCard key={booking.id} booking={booking} variant="full" />
            ))
          ) : (
            <div className="rounded-2xl bg-card border border-border/60 p-8 text-center">
              <Flag className="h-12 w-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                {activeTab === 'upcoming'
                  ? 'No Upcoming Bookings'
                  : 'No Past Bookings'}
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
                {activeTab === 'upcoming'
                  ? "You don't have any upcoming tee times scheduled."
                  : "You haven't played any rounds yet."}
              </p>
              {activeTab === 'upcoming' && (
                <Link
                  href="/portal/golf/book"
                  className={cn(
                    'inline-flex items-center gap-2 px-6 py-3 rounded-xl',
                    'bg-amber-500 text-white font-semibold text-sm',
                    'hover:bg-amber-600 transition-colors'
                  )}
                >
                  <Plus className="h-4 w-4" />
                  Book Your First Tee Time
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
