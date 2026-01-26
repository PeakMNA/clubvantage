'use client'

import { cn } from '@clubvantage/ui'
import { Link2, AlertTriangle, Clock, Users, Car } from 'lucide-react'
import { FlightStatusBadge } from './flight-status-badge'
import { PlayerTypeBadge } from './player-type-badge'
import type { Flight, TeeSheetSideBySide, Player, NineHoleType } from './types'

interface TeeSheetSideBySideProps {
  data: TeeSheetSideBySide
  isLoading?: boolean
  onFlightClick?: (flight: Flight, nineHole: NineHoleType) => void
  onBookSlot?: (flight: Flight, position: number, nineHole: NineHoleType) => void
  onPlayerClick?: (flight: Flight, groupId?: 1 | 2) => void
}

// Mini slot view for the side-by-side layout
function MiniFlightSlot({
  flight,
  nineHole,
  linkedFlightId,
  onFlightClick,
  onBookSlot,
}: {
  flight: Flight
  nineHole: NineHoleType
  linkedFlightId?: string
  onFlightClick?: (flight: Flight, nineHole: NineHoleType) => void
  onBookSlot?: (flight: Flight, position: number, nineHole: NineHoleType) => void
}) {
  const isBlocked = flight.status === 'blocked'
  const isNoShow = flight.status === 'no-show'
  const filledSlots = flight.players.filter(Boolean).length
  const isPartial = filledSlots > 0 && filledSlots < 4 && !isBlocked
  const hasLinkedBooking = !!linkedFlightId

  const handleClick = () => {
    if (!isBlocked) {
      onFlightClick?.(flight, nineHole)
    }
  }

  const handleBookClick = (e: React.MouseEvent, position: number) => {
    e.stopPropagation()
    onBookSlot?.(flight, position, nineHole)
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative p-2 rounded-lg border transition-all duration-200 min-h-[72px]',
        isBlocked && 'bg-muted/60 cursor-not-allowed opacity-70',
        isNoShow && 'bg-red-50 dark:bg-red-500/10 border-red-200',
        isPartial && 'border-l-4 border-l-amber-400',
        hasLinkedBooking && 'ring-2 ring-emerald-400/50 ring-offset-1',
        !isBlocked && !isNoShow && 'bg-card hover:shadow-md cursor-pointer',
        !isBlocked && 'active:scale-[0.99]'
      )}
    >
      {/* Linked booking indicator */}
      {hasLinkedBooking && (
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-10">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shadow-sm">
            <Link2 className="h-3 w-3 text-white" />
          </div>
        </div>
      )}

      {/* Time */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-foreground">{flight.time}</span>
        <FlightStatusBadge status={flight.status} size="sm" />
      </div>

      {/* Players grid - 2x2 */}
      {isBlocked ? (
        <div className="flex items-center gap-1 text-muted-foreground">
          <AlertTriangle className="h-3 w-3 text-amber-500" />
          <span className="text-[10px] truncate">{flight.blockedReason || 'Blocked'}</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1">
          {flight.players.map((player, idx) => (
            <div
              key={idx}
              className={cn(
                'flex items-center gap-1 p-1 rounded text-[10px]',
                player ? 'bg-muted/50' : 'bg-transparent'
              )}
            >
              {player ? (
                <>
                  <PlayerTypeBadge type={player.type} size="xs" />
                  <span className="truncate max-w-[50px] font-medium">
                    {player.name.split(' ')[0]}
                  </span>
                </>
              ) : (
                <button
                  onClick={(e) => handleBookClick(e, idx)}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  + Book
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resources indicator */}
      {(flight.carts || flight.caddies) && (
        <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-border">
          {flight.carts && (
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <Car className="h-3 w-3" />
              <span className="text-[9px]">{flight.carts}</span>
            </div>
          )}
          {flight.caddies && (
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <Users className="h-3 w-3" />
              <span className="text-[9px]">{flight.caddies}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Column header for each nine
function NineHeader({
  title,
  subtitle,
  stats,
}: {
  title: string
  subtitle?: string
  stats: { slots: string; players: number }
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-muted/80 to-muted/40 border-b border-border">
      <div>
        <h3 className="font-bold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="px-2 py-1 rounded-full bg-background/80 font-medium">
          {stats.slots} slots
        </span>
        <span className="px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-medium">
          {stats.players} players
        </span>
      </div>
    </div>
  )
}

// Visual connector line between linked slots
function LinkedSlotConnector({
  isVisible,
}: {
  isVisible: boolean
}) {
  if (!isVisible) return null

  return (
    <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-8 pointer-events-none">
      <svg className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="rgb(16, 185, 129)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1="50%"
          x2="100%"
          y2="50%"
          stroke="url(#linkGradient)"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
      </svg>
    </div>
  )
}

export function TeeSheetSideBySideView({
  data,
  isLoading,
  onFlightClick,
  onBookSlot,
}: TeeSheetSideBySideProps) {
  // Create a map of linked bookings for quick lookup
  const linkedMap = new Map<string, string>()
  data.linkedBookings.forEach((link) => {
    linkedMap.set(link.front9FlightId, link.back9FlightId)
    linkedMap.set(link.back9FlightId, link.front9FlightId)
  })

  // Get maximum number of slots to align rows
  const maxSlots = Math.max(data.front9Flights.length, data.back9Flights.length)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 animate-pulse">
        {[0, 1].map((col) => (
          <div key={col} className="space-y-2">
            <div className="h-16 bg-muted rounded-lg" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted/50 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border/60 bg-card/80 shadow-lg backdrop-blur-sm">
      {/* Top gradient bar */}
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-400 via-emerald-500 to-amber-400" />

      {/* Side-by-side layout */}
      <div className="grid grid-cols-2 divide-x divide-border">
        {/* Front 9 Column */}
        <div>
          <NineHeader
            title="Front 9"
            subtitle={data.front9Flights[0]?.time ? `Starting ${data.front9Flights[0].time}` : undefined}
            stats={{
              slots: `${data.metrics.front9.bookedSlots}/${data.metrics.front9.totalSlots}`,
              players: data.metrics.front9.players,
            }}
          />
          <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
            {data.front9Flights.map((flight) => (
              <MiniFlightSlot
                key={flight.id}
                flight={flight}
                nineHole="front9"
                linkedFlightId={linkedMap.get(flight.id)}
                onFlightClick={onFlightClick}
                onBookSlot={onBookSlot}
              />
            ))}
            {data.front9Flights.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No tee times available
              </div>
            )}
          </div>
        </div>

        {/* Back 9 Column */}
        <div>
          <NineHeader
            title="Back 9"
            subtitle={data.back9Flights[0]?.time ? `Starting ${data.back9Flights[0].time}` : undefined}
            stats={{
              slots: `${data.metrics.back9.bookedSlots}/${data.metrics.back9.totalSlots}`,
              players: data.metrics.back9.players,
            }}
          />
          <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
            {data.back9Flights.map((flight) => (
              <MiniFlightSlot
                key={flight.id}
                flight={flight}
                nineHole="back9"
                linkedFlightId={linkedMap.get(flight.id)}
                onFlightClick={onFlightClick}
                onBookSlot={onBookSlot}
              />
            ))}
            {data.back9Flights.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No tee times available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 18-Hole Bookings Summary */}
      <div className="border-t border-border p-3 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-foreground">
              {data.metrics.total18HoleBookings} Active 18-Hole Bookings
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Projected Revenue: <span className="font-semibold text-foreground">฿{data.metrics.projectedRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
