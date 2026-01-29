'use client'

import { cn } from '@clubvantage/ui'
import { AlertCircle, RefreshCw, Settings, Clock, Users, Car, AlertTriangle, ChevronRight } from 'lucide-react'
import { TeeSheetRow } from './tee-sheet-row'
import { FlightStatusBadge } from './flight-status-badge'
import { PlayerTypeBadge } from './player-type-badge'
import type { Flight, Player, BookingMode } from './types'

interface TeeSheetGridProps {
  flights: Flight[]
  bookingMode?: BookingMode // EIGHTEEN = single column, CROSS = dual columns
  isLoading?: boolean
  error?: string
  onRetry?: () => void
  onFlightClick?: (flight: Flight) => void
  onBookSlot?: (flight: Flight, position: number) => void
  onPlayerClick?: (flight: Flight, groupId?: 1 | 2) => void
  onCheckIn?: (flight: Flight) => void
  onNoShow?: (flight: Flight) => void
  onResendConfirmation?: (flight: Flight) => void
  onEditFlight?: (flight: Flight) => void
  onMoveFlight?: (flight: Flight) => void
  onCancelFlight?: (flight: Flight) => void
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border animate-pulse">
      <td className="px-4 py-3">
        <div className="h-4 w-16 bg-muted rounded" />
      </td>
      {[0, 1, 2, 3].map((i) => (
        <td key={i} className="px-3 py-3">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
        </td>
      ))}
      <td className="px-4 py-3">
        <div className="h-6 w-20 bg-muted rounded-full" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-12 bg-muted rounded" />
      </td>
      <td className="px-2 py-3">
        <div className="h-6 w-6 bg-muted rounded" />
      </td>
    </tr>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-card rounded-xl border border/60 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-16 bg-muted rounded" />
        <div className="h-5 w-20 bg-muted rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-4 w-24 bg-muted rounded" />
      </div>
    </div>
  )
}

// Mobile card component for individual flights
function FlightCard({
  flight,
  onFlightClick,
  onBookSlot,
}: {
  flight: Flight
  onFlightClick?: (flight: Flight) => void
  onBookSlot?: (flight: Flight, position: number) => void
}) {
  const isBlocked = flight.status === 'blocked'
  const isNoShow = flight.status === 'no-show'
  const filledSlots = flight.players.filter(Boolean).length
  const emptySlots = 4 - filledSlots
  const isPartial = filledSlots > 0 && filledSlots < 4 && !isBlocked

  const handleCardClick = () => {
    if (!isBlocked) {
      onFlightClick?.(flight)
    }
  }

  const handleBookClick = (e: React.MouseEvent, position: number) => {
    e.stopPropagation()
    onBookSlot?.(flight, position)
  }

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'relative overflow-hidden rounded-xl border bg-card/80 backdrop-blur-sm transition-all duration-300',
        isBlocked && 'bg-muted/80 cursor-not-allowed opacity-75',
        isNoShow && 'bg-red-50/80 dark:bg-red-500/10 border-red-200/60 dark:border-red-500/30',
        isPartial && 'border-l-4 border-l-amber-400',
        !isBlocked && !isNoShow && 'border/60 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/20 cursor-pointer',
        !isBlocked && 'active:scale-[0.99]'
      )}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-muted to-muted/50 shadow-inner">
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="font-bold text-foreground tracking-tight">{flight.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <FlightStatusBadge status={flight.status} />
          {!isBlocked && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3">
        {isBlocked ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm">{flight.blockedReason || 'Time slot blocked'}</span>
          </div>
        ) : (
          <>
            {/* Players */}
            <div className="space-y-2">
              {flight.players.map((player, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  {player ? (
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {idx + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground truncate max-w-[160px]">
                          {player.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <PlayerTypeBadge type={player.type} />
                          {player.handicap !== undefined && (
                            <span className="text-xs text-muted-foreground">HC {player.handicap}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleBookClick(e, idx)}
                      className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed border-emerald-300 text-xs font-medium">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium">+ Book slot</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Resources & Info */}
            {(flight.carts || flight.caddies) && (
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                {flight.carts && flight.carts > 0 && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Car className="h-4 w-4" />
                    <span className="text-xs font-medium">{flight.carts} cart{flight.carts > 1 ? 's' : ''}</span>
                  </div>
                )}
                {flight.caddies && flight.caddies > 0 && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-xs font-medium">{flight.caddies} caddy</span>
                  </div>
                )}
              </div>
            )}

            {/* Partial indicator */}
            {isPartial && (
              <div className="mt-3 pt-3 border-t border-border">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {filledSlots}/4 booked · {emptySlots} {emptySlots === 1 ? 'slot' : 'slots'} open
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export function TeeSheetGrid({
  flights,
  bookingMode = 'EIGHTEEN',
  isLoading,
  error,
  onRetry,
  onFlightClick,
  onBookSlot,
  onPlayerClick,
  onCheckIn,
  onNoShow,
  onResendConfirmation,
  onEditFlight,
  onMoveFlight,
  onCancelFlight,
}: TeeSheetGridProps) {
  // In Cross mode, split flights by starting hole
  const isCrossMode = bookingMode === 'CROSS'
  const hole1Flights = isCrossMode ? flights.filter(f => (f.startingHole ?? 1) === 1) : flights
  const hole10Flights = isCrossMode ? flights.filter(f => f.startingHole === 10) : []
  if (error) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border/60 bg-card/80 shadow-lg shadow-slate-200/30 dark:shadow-black/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent pointer-events-none" />
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-red-300 via-red-500 to-red-300" />
        <div className="relative flex flex-col items-center justify-center py-12 sm:py-16 px-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/20">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground">
            Unable to load tee sheet
          </h3>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl font-medium shadow-lg shadow-slate-900/20 hover:shadow-xl transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!isLoading && flights.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border/60 bg-card/80 shadow-lg shadow-slate-200/30 dark:shadow-black/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent pointer-events-none" />
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-border via-muted-foreground to-muted" />
        <div className="relative flex flex-col items-center justify-center py-12 sm:py-16 px-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Settings className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground">
            No tee times configured
          </h3>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
            Configure tee times in the Settings tab to start accepting bookings.
          </p>
          <a
            href="#settings"
            className="mt-6 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            Go to Settings →
          </a>
        </div>
      </div>
    )
  }

  // Render helper for table structure
  const renderTable = (flightList: Flight[], headerPrefix?: string) => (
    <table className="w-full">
      <thead>
        <tr className="border-b border/60 bg-muted/80">
          <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-20">
            Time
          </th>
          <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[140px]">
            Player 1
          </th>
          <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[140px]">
            Player 2
          </th>
          <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[140px]">
            Player 3
          </th>
          <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[140px]">
            Player 4
          </th>
          <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-28">
            Status
          </th>
          <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-20">
            Resources
          </th>
          <th className="px-2 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-12">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
        ) : (
          flightList.map((flight) => (
            <TeeSheetRow
              key={flight.id}
              flight={flight}
              onRowClick={onFlightClick}
              onBookSlot={onBookSlot}
              onPlayerClick={onPlayerClick}
              onCheckIn={onCheckIn}
              onNoShow={onNoShow}
              onResendConfirmation={onResendConfirmation}
              onEditFlight={onEditFlight}
              onMoveFlight={onMoveFlight}
              onCancelFlight={onCancelFlight}
            />
          ))
        )}
      </tbody>
    </table>
  )

  return (
    <>
      {/* Mobile: Card Layout */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : isCrossMode ? (
          // Cross mode mobile - show starting hole indicator
          <>
            {/* Hole 1 Section */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">Hole 1</span>
                <span className="text-xs text-muted-foreground">{hole1Flights.length} slots</span>
              </div>
              {hole1Flights.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  onFlightClick={onFlightClick}
                  onBookSlot={onBookSlot}
                />
              ))}
            </div>
            {/* Hole 10 Section */}
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">Hole 10</span>
                <span className="text-xs text-muted-foreground">{hole10Flights.length} slots</span>
              </div>
              {hole10Flights.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  onFlightClick={onFlightClick}
                  onBookSlot={onBookSlot}
                />
              ))}
            </div>
          </>
        ) : (
          flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              onFlightClick={onFlightClick}
              onBookSlot={onBookSlot}
            />
          ))
        )}
      </div>

      {/* Desktop: Table Layout */}
      {isCrossMode ? (
        // Cross Mode: Dual-Column Layout
        <div className="hidden md:block relative overflow-hidden rounded-2xl border border/60 bg-card/80 shadow-lg shadow-slate-200/30 dark:shadow-black/20 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent pointer-events-none" />
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400" />

          {/* Cross Mode Header */}
          <div className="relative flex items-center justify-between px-4 py-2 bg-muted/60 border-b border/60">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">Cross Mode</span>
              <span className="text-xs text-muted-foreground">Dual tee starts: Hole 1 + Hole 10</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-muted-foreground">
                Hole 1: <span className="font-medium text-foreground">{hole1Flights.length}</span> slots
              </span>
              <span className="text-muted-foreground">
                Hole 10: <span className="font-medium text-foreground">{hole10Flights.length}</span> slots
              </span>
            </div>
          </div>

          {/* Dual Column Tables */}
          <div className="relative grid grid-cols-2 divide-x divide-border">
            {/* Hole 1 Column */}
            <div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 border-b border/60">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400">Hole 1 Start</span>
              </div>
              <div className="overflow-x-auto">
                {renderTable(hole1Flights)}
              </div>
            </div>

            {/* Hole 10 Column */}
            <div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-500/10 border-b border/60">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-400">Hole 10 Start</span>
              </div>
              <div className="overflow-x-auto">
                {renderTable(hole10Flights)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // EIGHTEEN Mode: Single-Column Layout (default)
        <div className="hidden md:block relative overflow-hidden rounded-2xl border border/60 bg-card/80 shadow-lg shadow-slate-200/30 dark:shadow-black/20 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent pointer-events-none" />
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-300" />

          <div className="relative overflow-x-auto">
            {renderTable(flights)}
          </div>
        </div>
      )}
    </>
  )
}
