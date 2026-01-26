'use client'

import Link from 'next/link'
import { cn } from '@clubvantage/ui'
import { ChevronRight, Car, Users } from 'lucide-react'
import { StatusBadge } from './status-badge'
import { format, parseISO } from 'date-fns'
import type { TeeTimeBooking } from '@/lib/types'

interface TeeTimeCardProps {
  booking: TeeTimeBooking
  variant?: 'full' | 'compact'
}

export function TeeTimeCard({ booking, variant = 'full' }: TeeTimeCardProps) {
  const date = parseISO(booking.date)
  const dayNumber = format(date, 'd')
  const monthShort = format(date, 'MMM')
  const isPast = date < new Date()
  const isCancelled = booking.status === 'cancelled'

  return (
    <Link
      href={`/portal/golf/bookings/${booking.id}`}
      className={cn(
        'block rounded-2xl bg-card border border-border/60 p-4',
        'hover:shadow-lg hover:shadow-stone-200/50 dark:hover:shadow-black/20',
        'transition-all duration-200',
        isPast && 'opacity-75',
        isCancelled && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Date Badge */}
        <div
          className={cn(
            'flex-shrink-0 flex flex-col items-center justify-center',
            'w-12 h-12 rounded-xl',
            'bg-stone-100 dark:bg-stone-800'
          )}
        >
          <span className="text-lg font-bold text-stone-900 dark:text-stone-100 leading-none">
            {dayNumber}
          </span>
          <span className="text-[10px] font-medium text-stone-500 uppercase">
            {monthShort}
          </span>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3
                className={cn(
                  'font-semibold text-stone-900 dark:text-stone-100',
                  isCancelled && 'line-through'
                )}
              >
                {booking.courseName}
              </h3>
              <p className="text-sm text-stone-500 mt-0.5">
                {booking.time} • {booking.roundType === '18-hole' ? '18 holes' : '9 holes'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={booking.status} size="sm" />
              {variant === 'full' && (
                <ChevronRight className="h-5 w-5 text-stone-400" />
              )}
            </div>
          </div>

          {/* Players and resources */}
          <div className="flex items-center gap-4 mt-3">
            {/* Player avatars */}
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {booking.players.slice(0, 4).map((player, idx) => (
                  <div
                    key={player.id}
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full',
                      'border-2 border-white dark:border-stone-900',
                      'text-[10px] font-medium',
                      player.type === 'member'
                        ? 'bg-blue-500 text-white'
                        : player.type === 'dependent'
                        ? 'bg-teal-500 text-white'
                        : 'bg-amber-500 text-white'
                    )}
                    title={player.name}
                  >
                    {player.name[0]}
                  </div>
                ))}
              </div>
              <span className="ml-2 text-xs text-stone-500">
                {booking.players.length} player{booking.players.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Resources */}
            {booking.cart && (
              <div className="flex items-center gap-1 text-stone-400">
                <Car className="h-4 w-4" />
              </div>
            )}
            {booking.caddy !== 'none' && (
              <div className="flex items-center gap-1 text-stone-400">
                <Users className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
