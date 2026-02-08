'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@clubvantage/ui'
import { Flag } from 'lucide-react'
import { format, isToday, isTomorrow } from 'date-fns'

type Tab = 'upcoming' | 'past'

interface TeeTimeData {
  id: string
  date: string // ISO string
  time: string
  courseName: string
  status: string
  playerCount: number
}

export function MyTimesContent({
  upcoming,
  past,
}: {
  upcoming: TeeTimeData[]
  past: TeeTimeData[]
}) {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming')

  return (
    <div className="px-5 py-6 pb-36">
      {/* Header */}
      <h1 className="text-[22px] font-semibold text-stone-900 mb-5">
        My Tee Times
      </h1>

      {/* Tab Underlines */}
      <div className="flex gap-6 border-b border-stone-100 mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={cn(
            'pb-3 text-sm font-medium transition-all relative',
            activeTab === 'upcoming' ? 'text-stone-900' : 'text-stone-500'
          )}
        >
          Upcoming ({upcoming.length})
          {activeTab === 'upcoming' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={cn(
            'pb-3 text-sm font-medium transition-all relative',
            activeTab === 'past' ? 'text-stone-900' : 'text-stone-500'
          )}
        >
          Past ({past.length})
          {activeTab === 'past' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcoming.map((tt, idx) => {
            const date = new Date(tt.date)
            const isNext = idx === 0
            const dateLabel = isToday(date)
              ? 'TODAY'
              : isTomorrow(date)
                ? 'TOMORROW'
                : null

            return (
              <Link
                key={tt.id}
                href={`/portal/golf/bookings/${tt.id}`}
                className="block group"
              >
                <div
                  className={cn(
                    'rounded-xl overflow-hidden',
                    isNext
                      ? 'bg-stone-900 text-white'
                      : 'bg-white border border-stone-100'
                  )}
                >
                  <div className="p-5">
                    {/* Label badge */}
                    {isNext && dateLabel && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold uppercase mb-3">
                        {dateLabel}
                      </span>
                    )}

                    {/* Time & Course */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p
                          className={cn(
                            'font-bold',
                            isNext ? 'text-2xl text-white' : 'text-base text-stone-900'
                          )}
                        >
                          {isNext
                            ? tt.time
                            : `${format(date, 'MMM d')} \u00b7 ${tt.time}`}
                        </p>
                        <p className={cn(
                          isNext ? 'text-base text-white/70 mt-0.5' : 'text-sm text-stone-500'
                        )}>
                          {tt.courseName}
                        </p>
                      </div>

                      {!isNext && (
                        <span
                          className={cn(
                            'text-xs font-medium',
                            tt.status === 'CONFIRMED' ? 'text-emerald-600' : 'text-amber-600'
                          )}
                        >
                          {tt.status === 'CONFIRMED' ? 'Confirmed' : 'Pending'}
                        </span>
                      )}
                    </div>

                    {/* Player count */}
                    <p className={cn(
                      'text-xs mt-2',
                      isNext ? 'text-white/60' : 'text-stone-500'
                    )}>
                      {tt.playerCount} Player{tt.playerCount > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}

          {upcoming.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Flag className="h-12 w-12 text-stone-200 mb-4" />
              <p className="text-stone-500 font-medium">No upcoming tee times</p>
              <p className="text-sm text-stone-400 mt-1">Book your next round</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'past' && (
        <div className="space-y-4">
          {past.map((tt) => {
            const date = new Date(tt.date)
            return (
              <Link
                key={tt.id}
                href={`/portal/golf/bookings/${tt.id}`}
                className="block"
              >
                <div className="bg-white border border-stone-100 rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-bold text-stone-900">
                        {format(date, 'MMM d')} &middot; {tt.time}
                      </p>
                      <p className="text-sm text-stone-500">{tt.courseName}</p>
                    </div>
                    <span className="text-xs font-medium text-stone-500">
                      {tt.status === 'COMPLETED' ? 'Completed' : tt.status === 'CANCELLED' ? 'Cancelled' : tt.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-2">
                    {tt.playerCount} Player{tt.playerCount > 1 ? 's' : ''}
                  </p>
                </div>
              </Link>
            )
          })}

          {past.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Flag className="h-12 w-12 text-stone-200 mb-4" />
              <p className="text-stone-500 font-medium">No past bookings</p>
              <p className="text-sm text-stone-400 mt-1">Your round history will appear here</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
