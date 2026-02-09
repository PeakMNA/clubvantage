'use client'

import { cn } from '@clubvantage/ui'
import { AlertCircle, RefreshCw, Settings, Plus, AlertTriangle, Lock } from 'lucide-react'
import {
  PlacementModeOverlay,
  usePlacementMode,
  type SlotValidationResult,
} from './placement-mode-overlay'
import { PartialFitDialog } from './partial-fit-dialog'
import { BookingContextMenu, SlotContextMenu, type BookingAction, type SlotAction } from './context-menus'
import { FlightStatusBadge } from './flight-status-badge'
import { PlayerTypeBadge } from './player-type-badge'
import type { Flight, Booking, BookingStatus, Player } from './types'
import { useState, useCallback } from 'react'

interface TeeSheetBookingViewProps {
  flights: Flight[]
  bookingMode?: 'EIGHTEEN' | 'CROSS'
  isLoading?: boolean
  error?: string
  onRetry?: () => void
  placementMode: ReturnType<typeof usePlacementMode>
  clipboardBooking: Booking | null
  onBookingSelect: (flightId: string, playerId: string) => void
  onAddBooking: (teeTime: string, slotIndex: number) => void
  onBookingAction: (bookingId: string, action: BookingAction) => void
  onSlotAction: (teeTime: string, action: SlotAction) => void
  onPlacementSelect: (teeTime: string, selectedPlayerIds?: string[]) => void
  onReleaseBlock: (blockId: string) => void
}

// Player slot component
function PlayerSlot({
  player,
  slotIndex,
  flightId,
  isBlocked,
  onBook,
  onClick,
  onContextMenu,
}: {
  player: Player | null
  slotIndex: number
  flightId: string
  isBlocked: boolean
  onBook: () => void
  onClick: () => void
  onContextMenu: (e: React.MouseEvent) => void
}) {
  if (isBlocked) {
    return (
      <div className="flex items-center justify-center h-10 text-stone-400 dark:text-stone-500">
        <Lock className="h-3 w-3" />
      </div>
    )
  }

  if (!player) {
    return (
      <button
        onClick={onBook}
        className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded px-2 py-1 transition-colors text-sm"
      >
        <Plus className="h-3 w-3" />
        <span>Book</span>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className="group flex flex-col items-start gap-0.5 px-2 py-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-left w-full"
    >
      <span className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate max-w-[120px]">
        {player.name}
      </span>
      <div className="flex items-center gap-1.5">
        <PlayerTypeBadge type={player.type} />
        {player.handicap !== undefined && (
          <span className="text-[10px] text-stone-500 dark:text-stone-400">HC {player.handicap}</span>
        )}
      </div>
    </button>
  )
}

// Skeleton row for loading state
function SkeletonRow() {
  return (
    <tr className="border-b border-stone-200 dark:border-stone-700 animate-pulse">
      <td className="px-4 py-3">
        <div className="h-4 w-16 bg-stone-200 dark:bg-stone-700 rounded" />
      </td>
      {[0, 1, 2, 3].map((i) => (
        <td key={i} className="px-3 py-3">
          <div className="space-y-1">
            <div className="h-4 w-20 bg-stone-200 dark:bg-stone-700 rounded" />
            <div className="h-3 w-12 bg-stone-200 dark:bg-stone-700 rounded" />
          </div>
        </td>
      ))}
      <td className="px-4 py-3">
        <div className="h-6 w-16 bg-stone-200 dark:bg-stone-700 rounded-full" />
      </td>
    </tr>
  )
}

export function TeeSheetBookingView({
  flights,
  bookingMode = 'EIGHTEEN',
  isLoading,
  error,
  onRetry,
  placementMode,
  clipboardBooking,
  onBookingSelect,
  onAddBooking,
  onBookingAction,
  onSlotAction,
  onPlacementSelect,
  onReleaseBlock,
}: TeeSheetBookingViewProps) {
  // Context menu state
  const [bookingContextMenu, setBookingContextMenu] = useState<{
    isOpen: boolean
    position: { x: number; y: number }
    bookingId: string
    status: BookingStatus
  }>({ isOpen: false, position: { x: 0, y: 0 }, bookingId: '', status: 'BOOKED' })

  const [slotContextMenu, setSlotContextMenu] = useState<{
    isOpen: boolean
    position: { x: number; y: number }
    teeTime: string
  }>({ isOpen: false, position: { x: 0, y: 0 }, teeTime: '' })

  // Partial fit dialog state
  const [partialFitDialog, setPartialFitDialog] = useState<{
    isOpen: boolean
    targetTime: string
    validation: SlotValidationResult | null
  }>({ isOpen: false, targetTime: '', validation: null })

  // In Cross mode, split by starting hole
  const isCrossMode = bookingMode === 'CROSS'
  const hole1Flights = isCrossMode ? flights.filter((f) => (f.startingHole ?? 1) === 1) : flights
  const hole10Flights = isCrossMode ? flights.filter((f) => f.startingHole === 10) : []

  // Context menu handlers
  const handlePlayerContextMenu = (e: React.MouseEvent, bookingId: string, status: string) => {
    e.preventDefault()
    e.stopPropagation()
    // Close slot context menu first
    setSlotContextMenu((prev) => ({ ...prev, isOpen: false }))
    setBookingContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      bookingId, // Use the player's actual booking ID
      status: status as BookingStatus,
    })
  }

  const handleRowContextMenu = (e: React.MouseEvent, teeTime: string) => {
    e.preventDefault()
    // Close booking context menu first
    setBookingContextMenu((prev) => ({ ...prev, isOpen: false }))
    setSlotContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      teeTime,
    })
  }

  const handleBookingMenuAction = (action: BookingAction) => {
    onBookingAction(bookingContextMenu.bookingId, action)
    setBookingContextMenu((prev) => ({ ...prev, isOpen: false }))
  }

  const handleSlotMenuAction = (action: SlotAction) => {
    onSlotAction(slotContextMenu.teeTime, action)
    setSlotContextMenu((prev) => ({ ...prev, isOpen: false }))
  }

  // Handle slot click during placement mode
  const handlePlacementSlotClick = useCallback(
    (teeTime: string, validation: SlotValidationResult | null) => {
      if (!validation) return

      if (validation.status === 'valid') {
        // Valid - proceed directly
        onPlacementSelect(teeTime)
      } else if (validation.status === 'partial') {
        // Partial - show dialog to select which players
        setPartialFitDialog({
          isOpen: true,
          targetTime: teeTime,
          validation,
        })
      }
      // Invalid or source - do nothing
    },
    [onPlacementSelect]
  )

  // Handle partial fit dialog confirmation
  const handlePartialFitConfirm = useCallback(
    (selectedPlayerIds: string[]) => {
      onPlacementSelect(partialFitDialog.targetTime, selectedPlayerIds)
      setPartialFitDialog({ isOpen: false, targetTime: '', validation: null })
    },
    [onPlacementSelect, partialFitDialog.targetTime]
  )

  // Error state
  if (error) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-stone-200/60 dark:border-stone-700/60 bg-white/80 dark:bg-stone-900/80 shadow-lg shadow-stone-200/30 dark:shadow-black/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-50/50 dark:from-stone-800/30 to-transparent pointer-events-none" />
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-red-300 via-red-500 to-red-300" />
        <div className="relative flex flex-col items-center justify-center py-12 sm:py-16 px-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <h3 className="mt-4 text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Unable to load tee sheet
          </h3>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 text-center max-w-sm">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-stone-800 to-stone-900 dark:from-stone-200 dark:to-stone-300 text-white dark:text-stone-900 rounded-xl font-medium shadow-lg shadow-stone-900/20 hover:shadow-xl transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  // Empty state
  if (!isLoading && flights.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-stone-200/60 dark:border-stone-700/60 bg-white/80 dark:bg-stone-900/80 shadow-lg shadow-stone-200/30 dark:shadow-black/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-50/50 dark:from-stone-800/30 to-transparent pointer-events-none" />
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-stone-300 via-stone-500 to-stone-300" />
        <div className="relative flex flex-col items-center justify-center py-12 sm:py-16 px-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
            <Settings className="h-7 w-7 text-stone-500 dark:text-stone-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
            No tee times configured
          </h3>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 text-center max-w-sm">
            Configure tee times in the Settings tab to start accepting bookings.
          </p>
        </div>
      </div>
    )
  }

  // Render table
  const renderTable = (flightList: Flight[]) => (
    <table className="w-full">
      <thead>
        <tr className="border-b border-stone-200/60 dark:border-stone-700/60 bg-stone-50/80 dark:bg-stone-800/80">
          <th className="px-4 py-3 text-left text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider w-20">
            Time
          </th>
          <th className="px-3 py-3 text-left text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider min-w-[140px]">
            Slot 1
          </th>
          <th className="px-3 py-3 text-left text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider min-w-[140px]">
            Slot 2
          </th>
          <th className="px-3 py-3 text-left text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider min-w-[140px]">
            Slot 3
          </th>
          <th className="px-3 py-3 text-left text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider min-w-[140px]">
            Slot 4
          </th>
          <th className="px-4 py-3 text-left text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider w-28">
            Status
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
        ) : (
          flightList.map((flight) => {
            const isBlocked = flight.status === 'BLOCKED'
            const filledSlots = flight.players.filter(Boolean).length
            const isPartial = filledSlots > 0 && filledSlots < 4 && !isBlocked

            // Get smart validation for this slot during placement mode
            const slotValidation = placementMode.state.active
              ? placementMode.getSlotValidation(flight.time)
              : null
            const slotClass = placementMode.state.active
              ? placementMode.getSlotClass(flight.time)
              : ''

            return (
              <tr
                key={flight.id}
                className={cn(
                  'transition-colors',
                  isBlocked && 'bg-stone-100/50 dark:bg-stone-800/50',
                  isPartial && !placementMode.state.active && 'border-l-4 border-l-amber-400',
                  !isBlocked && !placementMode.state.active && 'hover:bg-stone-50 dark:hover:bg-stone-800/50',
                  // Smart placement mode styling
                  placementMode.state.active && slotClass
                )}
                onContextMenu={(e) => handleRowContextMenu(e, flight.time)}
                onClick={() => {
                  if (placementMode.state.active && slotValidation) {
                    handlePlacementSlotClick(flight.time, slotValidation)
                  }
                }}
              >
                {/* Time */}
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">{flight.time}</span>
                </td>

                {/* Player Slots */}
                {[0, 1, 2, 3].map((slotIndex) => (
                  <td key={slotIndex} className="px-3 py-2">
                    {isBlocked ? (
                      slotIndex === 0 ? (
                        <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span className="text-sm">{flight.blockedReason || 'Blocked'}</span>
                          <button
                            onClick={() => onReleaseBlock(flight.id)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline ml-2"
                          >
                            Release
                          </button>
                        </div>
                      ) : null
                    ) : (
                      <PlayerSlot
                        player={flight.players[slotIndex] || null}
                        slotIndex={slotIndex}
                        flightId={flight.id}
                        isBlocked={isBlocked}
                        onBook={() => onAddBooking(flight.time, slotIndex)}
                        onClick={() => {
                          const player = flight.players[slotIndex]
                          if (player) {
                            onBookingSelect(flight.id, player.id)
                          }
                        }}
                        onContextMenu={(e) => {
                          const player = flight.players[slotIndex]
                          // Use player's bookingId if available, fall back to flight.id
                          const bookingId = player?.bookingId || flight.id
                          handlePlayerContextMenu(e, bookingId, flight.status)
                        }}
                      />
                    )}
                  </td>
                ))}

                {/* Status */}
                <td className="px-4 py-3">
                  <FlightStatusBadge status={flight.status} />
                </td>
              </tr>
            )
          })
        )}
      </tbody>
    </table>
  )

  return (
    <>
      {/* Placement Mode Overlay */}
      {placementMode.state.active && placementMode.state.sourceBooking && (
        <PlacementModeOverlay
          active={placementMode.state.active}
          action={placementMode.state.action}
          sourceBooking={placementMode.state.sourceBooking}
          onCancel={placementMode.cancel}
          isProcessing={false}
        />
      )}

      {/* Partial Fit Dialog */}
      {partialFitDialog.isOpen &&
        placementMode.state.sourceBooking &&
        partialFitDialog.validation && (
          <PartialFitDialog
            isOpen={partialFitDialog.isOpen}
            action={placementMode.state.action}
            players={placementMode.state.sourceBooking.playerNames.map((name, i) => ({
              id: placementMode.state.sourceBooking?.playerIds?.[i] || `player-${i}`,
              name,
            }))}
            canFit={partialFitDialog.validation.canFit}
            targetTime={partialFitDialog.targetTime}
            sourceTime={placementMode.state.sourceBooking.sourceTeeTime}
            onConfirm={handlePartialFitConfirm}
            onCancel={() =>
              setPartialFitDialog({ isOpen: false, targetTime: '', validation: null })
            }
          />
        )}

      {/* Context Menus */}
      <BookingContextMenu
        isOpen={bookingContextMenu.isOpen}
        position={bookingContextMenu.position}
        bookingStatus={bookingContextMenu.status}
        onClose={() => setBookingContextMenu((prev) => ({ ...prev, isOpen: false }))}
        onAction={handleBookingMenuAction}
      />
      <SlotContextMenu
        isOpen={slotContextMenu.isOpen}
        position={slotContextMenu.position}
        hasClipboard={!!clipboardBooking}
        onClose={() => setSlotContextMenu((prev) => ({ ...prev, isOpen: false }))}
        onAction={handleSlotMenuAction}
      />

      {/* Main Grid */}
      {isCrossMode ? (
        // Cross Mode: Dual-Column Layout
        <div className="relative overflow-hidden rounded-2xl border border-stone-200/60 dark:border-stone-700/60 bg-white/80 dark:bg-stone-900/80 shadow-lg shadow-stone-200/30 dark:shadow-black/30 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-stone-50/50 dark:from-stone-800/30 to-transparent pointer-events-none" />
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400" />

          {/* Cross Mode Header */}
          <div className="relative flex items-center justify-between px-4 py-2 bg-stone-50/60 dark:bg-stone-800/60 border-b border-stone-200/60 dark:border-stone-700/60">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">Cross Mode</span>
              <span className="text-xs text-stone-500 dark:text-stone-400">Dual tee starts: Hole 1 + Hole 10</span>
            </div>
          </div>

          {/* Dual Column Layout */}
          <div className="relative grid grid-cols-2 divide-x divide-stone-200 dark:divide-stone-700">
            <div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border-b border-stone-200/60 dark:border-stone-700/60">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400">Hole 1 Start</span>
              </div>
              <div className="overflow-x-auto">{renderTable(hole1Flights)}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 border-b border-stone-200/60 dark:border-stone-700/60">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-400">Hole 10 Start</span>
              </div>
              <div className="overflow-x-auto">{renderTable(hole10Flights)}</div>
            </div>
          </div>
        </div>
      ) : (
        // EIGHTEEN Mode: Single-Column Layout
        <div className="relative overflow-hidden rounded-2xl border border-stone-200/60 dark:border-stone-700/60 bg-white/80 dark:bg-stone-900/80 shadow-lg shadow-stone-200/30 dark:shadow-black/30 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-stone-50/50 dark:from-stone-800/30 to-transparent pointer-events-none" />
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-300" />

          <div className="relative overflow-x-auto">
            {renderTable(flights)}
          </div>
        </div>
      )}
    </>
  )
}
