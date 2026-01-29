'use client'

import { useState, useEffect, useMemo } from 'react'
import { cn } from '@clubvantage/ui'
import {
  Loader2,
  AlertCircle,
  User,
  Calendar,
  Clock,
  MapPin,
} from 'lucide-react'
import { Modal } from './modal'
import { FlightStatusBadge, type FlightStatus } from './flight-status-badge'
import { PlayerSlot, type CaddyValue, type CartValue, type RentalValue } from './player-slot'
import { type CaddyPickerCaddy } from './caddy-picker'
import { AddPlayerFlow, type PlayerData } from './add-player-flow'
import { BookingNotes } from './booking-notes'
import { GolferCountSelector } from './golfer-count-selector'
import { HoleSelector } from './hole-selector'
import type { Booking, BookingStatus, BookingPlayer } from './types'
import type { PlayerType } from './player-type-badge'

// ============================================================================
// Types
// ============================================================================

interface PlayerSlotData {
  player: PlayerData | null
  caddyRequest: CaddyValue
  cartRequest: CartValue
  rentalRequest: RentalValue
}

interface ClubSettings {
  cartPolicy: 'OPTIONAL' | 'REQUIRED'
  rentalPolicy: 'OPTIONAL' | 'REQUIRED'
  maxGuestsPerMember: number
  requireGuestContact: boolean
}

interface PlayerPayload {
  position: number
  playerType: 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALK_UP'
  memberId?: string
  guestName?: string
  guestPhone?: string
  guestEmail?: string
  sponsoringMemberId?: string
  caddyRequest: 'NONE' | 'REQUEST' | string
  cartRequest: 'NONE' | 'REQUEST'
  rentalRequest: 'NONE' | 'REQUEST'
}

interface BookingPayload {
  courseId: string
  teeDate: string
  teeTime: string
  holes: 9 | 18
  startingHole: 1 | 10
  players: PlayerPayload[]
  notes?: string
}

export interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'new' | 'existing'

  // Context (required)
  courseId: string
  courseName: string
  date: Date
  time: string
  startingHole?: 1 | 10

  // Existing booking (required when mode='existing')
  booking?: Booking | null

  // Data
  availableCaddies: CaddyPickerCaddy[]
  clubSettings: ClubSettings

  // Search
  onSearchMembers?: (query: string) => Promise<PlayerData[]>

  // Callbacks
  onSave: (payload: BookingPayload) => Promise<void>
  onCheckIn?: () => Promise<void>
  onCancel?: (reason?: string) => Promise<void>
  onMove?: () => void
  onCopy?: () => void
  onMarkOnCourse?: () => Promise<void>
  onMarkFinished?: () => Promise<void>
  onSettle?: () => void
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours || '0', 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:${minutes} ${ampm}`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' at ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function playerTypeToPayloadType(type: PlayerType): 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALK_UP' {
  switch (type) {
    case 'member': return 'MEMBER'
    case 'guest': return 'GUEST'
    case 'dependent': return 'DEPENDENT'
    case 'walkup': return 'WALK_UP'
  }
}

function bookingPlayerToSlotData(player: BookingPlayer, clubSettings: ClubSettings): PlayerSlotData {
  return {
    player: {
      id: player.memberUuid || player.playerId,
      name: player.name,
      type: player.playerType as PlayerType,
      memberId: player.memberId,
    },
    caddyRequest: (player.caddyRequest as CaddyValue) || 'NONE',
    cartRequest: (player.cartRequest as CartValue) || (clubSettings.cartPolicy === 'REQUIRED' ? 'REQUEST' : 'NONE'),
    rentalRequest: (player.rentalRequest as RentalValue) || (clubSettings.rentalPolicy === 'REQUIRED' ? 'REQUEST' : 'NONE'),
  }
}

function getEmptySlot(clubSettings: ClubSettings): PlayerSlotData {
  return {
    player: null,
    caddyRequest: 'NONE',
    cartRequest: clubSettings.cartPolicy === 'REQUIRED' ? 'REQUEST' : 'NONE',
    rentalRequest: clubSettings.rentalPolicy === 'REQUIRED' ? 'REQUEST' : 'NONE',
  }
}

function getInitialSlots(booking: Booking | null | undefined, clubSettings: ClubSettings): PlayerSlotData[] {
  if (booking?.players) {
    const slots: PlayerSlotData[] = Array(4).fill(null).map(() => getEmptySlot(clubSettings))
    booking.players.forEach((p) => {
      const index = p.position - 1
      if (index >= 0 && index < 4) {
        slots[index] = bookingPlayerToSlotData(p, clubSettings)
      }
    })
    return slots
  }
  return Array(4).fill(null).map(() => getEmptySlot(clubSettings))
}

function mapBookingStatusToFlightStatus(status: BookingStatus): FlightStatus {
  switch (status) {
    case 'booked': return 'booked'
    case 'checked-in': return 'checked-in'
    case 'on-course': return 'on-course'
    case 'completed': return 'finished'
    case 'no-show': return 'no-show'
    case 'cancelled': return 'cancelled'
    default: return 'booked'
  }
}

// ============================================================================
// Booked By Section
// ============================================================================

interface BookedBySectionProps {
  bookerName: string
  bookerMemberId?: string
  createdAt: string
}

function BookedBySection({ bookerName, bookerMemberId, createdAt }: BookedBySectionProps) {
  return (
    <div>
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-stone-500">
        Booked By
      </h3>
      <div className="rounded-xl border border-stone-200 bg-gradient-to-b from-white to-stone-50/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <User className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <span className="font-semibold text-stone-900">{bookerName}</span>
              {bookerMemberId && (
                <span className="ml-2 text-sm text-stone-500">({bookerMemberId})</span>
              )}
              <div className="text-xs text-stone-500">
                Created {formatTimestamp(createdAt)}
              </div>
            </div>
          </div>
          <button className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100">
            View Profile
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Workflow Actions
// ============================================================================

interface WorkflowActionsProps {
  status: BookingStatus
  isProcessing: boolean
  processingAction?: string
  onCheckIn?: () => Promise<void>
  onMarkOnCourse?: () => Promise<void>
  onMarkFinished?: () => Promise<void>
  onSettle?: () => void
  onMove?: () => void
  onCopy?: () => void
  onCancel?: () => void
}

function WorkflowActions({
  status,
  isProcessing,
  processingAction,
  onCheckIn,
  onMarkOnCourse,
  onMarkFinished,
  onSettle,
  onMove,
  onCopy,
  onCancel,
}: WorkflowActionsProps) {
  const isProcessingThis = (action: string) => isProcessing && processingAction === action

  if (status === 'cancelled') {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {/* Cancel - always visible, red, pushed left */}
      {onCancel && status !== 'completed' && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="px-3 py-2 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 mr-auto"
        >
          Cancel Booking
        </button>
      )}

      {/* Status-dependent actions */}
      {status === 'booked' && (
        <>
          {onCheckIn && (
            <button
              type="button"
              onClick={onCheckIn}
              disabled={isProcessing}
              className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessingThis('checkIn') && <Loader2 className="h-4 w-4 animate-spin" />}
              Check In
            </button>
          )}
          {onMove && (
            <button
              type="button"
              onClick={onMove}
              disabled={isProcessing}
              className="px-3 py-2 border border-stone-200 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
            >
              Move
            </button>
          )}
          {onCopy && (
            <button
              type="button"
              onClick={onCopy}
              disabled={isProcessing}
              className="px-3 py-2 border border-stone-200 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
            >
              Copy
            </button>
          )}
        </>
      )}

      {status === 'checked-in' && (
        <>
          {onMarkOnCourse && (
            <button
              type="button"
              onClick={onMarkOnCourse}
              disabled={isProcessing}
              className="px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessingThis('markOnCourse') && <Loader2 className="h-4 w-4 animate-spin" />}
              Mark On Course
            </button>
          )}
          {onSettle && (
            <button
              type="button"
              onClick={onSettle}
              disabled={isProcessing}
              className="px-3 py-2 border border-stone-200 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
            >
              Settle
            </button>
          )}
        </>
      )}

      {status === 'on-course' && (
        <>
          {onMarkFinished && (
            <button
              type="button"
              onClick={onMarkFinished}
              disabled={isProcessing}
              className="px-3 py-2 bg-stone-600 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessingThis('markFinished') && <Loader2 className="h-4 w-4 animate-spin" />}
              Mark Finished
            </button>
          )}
          {onSettle && (
            <button
              type="button"
              onClick={onSettle}
              disabled={isProcessing}
              className="px-3 py-2 border border-stone-200 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
            >
              Settle
            </button>
          )}
        </>
      )}

      {status === 'completed' && onSettle && (
        <button
          type="button"
          onClick={onSettle}
          disabled={isProcessing}
          className="px-3 py-2 border border-stone-200 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
        >
          View Receipt
        </button>
      )}
    </div>
  )
}

// ============================================================================
// Header Subtitle Component
// ============================================================================

interface HeaderSubtitleProps {
  mode: 'new' | 'existing'
  booking?: Booking | null
  time: string
  courseName: string
  date: Date
  startingHole?: 1 | 10
}

function HeaderSubtitle({ mode, booking, time, courseName, date, startingHole }: HeaderSubtitleProps) {
  return (
    <div className="flex items-center gap-3 mt-2 flex-wrap">
      {mode === 'existing' && booking && (
        <FlightStatusBadge status={mapBookingStatusToFlightStatus(booking.status)} size="sm" />
      )}
      <div className="flex items-center gap-1.5 text-sm text-stone-600">
        <Clock className="h-3.5 w-3.5 text-stone-400" />
        <span>{formatTime(time)}</span>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-stone-600">
        <MapPin className="h-3.5 w-3.5 text-stone-400" />
        <span>{courseName}</span>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-stone-600">
        <Calendar className="h-3.5 w-3.5 text-stone-400" />
        <span>{formatDate(date)}</span>
      </div>
      {startingHole === 10 && (
        <span className="text-sm text-amber-600 font-medium">· Hole 10 Start</span>
      )}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function BookingModal({
  isOpen,
  onClose,
  mode,
  courseId,
  courseName,
  date,
  time,
  startingHole = 1,
  booking,
  availableCaddies,
  clubSettings,
  onSearchMembers,
  onSave,
  onCheckIn,
  onCancel,
  onMove,
  onCopy,
  onMarkOnCourse,
  onMarkFinished,
  onSettle,
}: BookingModalProps) {
  // Form state
  const [golferCount, setGolferCount] = useState(1)
  const [holes, setHoles] = useState<9 | 18>(booking?.holes ?? 18)
  const [slots, setSlots] = useState<PlayerSlotData[]>(() => getInitialSlots(booking, clubSettings))
  const [notes, setNotes] = useState(booking?.notes || '')
  const [addingPlayerPosition, setAddingPlayerPosition] = useState<number | null>(null)

  // Original state for change detection
  const [originalState, setOriginalState] = useState<string>('')

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [processingAction, setProcessingAction] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialSlots = getInitialSlots(booking, clubSettings)
      const initialHoles = booking?.holes ?? 18
      const initialNotes = booking?.notes || ''

      setSlots(initialSlots)
      setHoles(initialHoles)
      setNotes(initialNotes)
      setAddingPlayerPosition(null)
      setError(null)

      if (mode === 'existing' && booking) {
        setGolferCount(booking.playerCount || initialSlots.filter(s => s.player).length)
        // Capture original state for change detection
        setOriginalState(JSON.stringify({ slots: initialSlots, holes: initialHoles, notes: initialNotes }))
      } else {
        setGolferCount(1)
        setOriginalState('')
      }
    }
  }, [isOpen, mode, booking, clubSettings])

  // Computed values
  const filledSlots = slots.filter((s) => s.player !== null).length
  const bookerName = slots[0]?.player?.name || 'Unknown'
  const bookingMemberId = slots[0]?.player?.memberId

  // Change detection
  const hasUnsavedChanges = useMemo(() => {
    if (mode === 'new') return filledSlots > 0
    if (!originalState) return false
    const currentState = JSON.stringify({ slots, holes, notes })
    return currentState !== originalState
  }, [mode, originalState, slots, holes, notes, filledSlots])

  // Handlers
  const handleGolferCountChange = (count: number) => {
    setGolferCount(count)
    setSlots((prev) =>
      prev.map((slot, i) => {
        if (i >= count && slot.player) {
          return getEmptySlot(clubSettings)
        }
        return slot
      })
    )
  }

  const handleAddPlayer = (position: number, player: PlayerData) => {
    setSlots((prev) => {
      const newSlots = [...prev]
      const existingSlot = newSlots[position]
      if (existingSlot) {
        newSlots[position] = {
          player,
          caddyRequest: existingSlot.caddyRequest,
          cartRequest: existingSlot.cartRequest,
          rentalRequest: existingSlot.rentalRequest,
        }
      }
      return newSlots
    })
    setAddingPlayerPosition(null)
  }

  const handleRemovePlayer = (position: number) => {
    setSlots((prev) => {
      const newSlots = [...prev]
      newSlots[position] = getEmptySlot(clubSettings)
      return newSlots
    })
  }

  const handleCaddyChange = (position: number, value: CaddyValue) => {
    setSlots((prev) => {
      const newSlots = [...prev]
      const slot = newSlots[position]
      if (slot) {
        newSlots[position] = { ...slot, caddyRequest: value }
      }
      return newSlots
    })
  }

  const handleCartChange = (position: number, value: CartValue) => {
    setSlots((prev) => {
      const newSlots = [...prev]
      const slot = newSlots[position]
      if (slot) {
        newSlots[position] = { ...slot, cartRequest: value }
      }
      return newSlots
    })
  }

  const handleRentalChange = (position: number, value: RentalValue) => {
    setSlots((prev) => {
      const newSlots = [...prev]
      const slot = newSlots[position]
      if (slot) {
        newSlots[position] = { ...slot, rentalRequest: value }
      }
      return newSlots
    })
  }

  const handleDiscard = () => {
    if (mode === 'existing' && booking) {
      const initialSlots = getInitialSlots(booking, clubSettings)
      setSlots(initialSlots)
      setHoles(booking.holes ?? 18)
      setNotes(booking.notes || '')
    }
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const players: PlayerPayload[] = []
      const effectiveCount = mode === 'new' ? golferCount : 4

      slots.forEach((slot, i) => {
        if (i >= effectiveCount) return
        if (!slot.player && mode === 'new' && i >= golferCount) return

        if (slot.player) {
          players.push({
            position: i + 1,
            playerType: playerTypeToPayloadType(slot.player.type),
            memberId: slot.player.type === 'member' || slot.player.type === 'dependent'
              ? slot.player.id
              : undefined,
            guestName: slot.player.type === 'guest' || slot.player.type === 'walkup'
              ? slot.player.name
              : undefined,
            guestPhone: slot.player.phone,
            guestEmail: slot.player.email,
            sponsoringMemberId: slot.player.type === 'guest' ? slot.player.sponsoringMemberId || bookingMemberId : undefined,
            caddyRequest: slot.caddyRequest,
            cartRequest: slot.cartRequest,
            rentalRequest: slot.rentalRequest,
          })
        } else if (mode === 'new' && i < golferCount) {
          // Empty slot in new booking - create placeholder
          players.push({
            position: i + 1,
            playerType: 'GUEST',
            guestName: 'Guest',
            sponsoringMemberId: bookingMemberId,
            caddyRequest: slot.caddyRequest,
            cartRequest: slot.cartRequest,
            rentalRequest: slot.rentalRequest,
          })
        }
      })

      const payload: BookingPayload = {
        courseId,
        teeDate: date.toISOString().split('T')[0] || '',
        teeTime: time,
        holes,
        startingHole,
        players,
        notes: notes.trim() || undefined,
      }

      await onSave(payload)

      // Update original state after successful save
      if (mode === 'existing') {
        setOriginalState(JSON.stringify({ slots, holes, notes }))
      } else {
        onClose()
      }
    } catch {
      setError('Failed to save booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      // Could show confirmation dialog
      const confirmed = window.confirm('You have unsaved changes. Discard?')
      if (!confirmed) return
    }
    onClose()
  }

  const handleCancelBooking = async () => {
    if (!onCancel) return
    setProcessingAction('cancel')
    try {
      await onCancel()
      onClose()
    } catch {
      setError('Failed to cancel booking.')
    } finally {
      setProcessingAction(undefined)
    }
  }

  // Slot state helper
  const getSlotState = (index: number): 'filled' | 'empty' | 'available' => {
    if (slots[index]?.player) return 'filled'
    if (mode === 'new' && index < golferCount) return 'empty'
    if (mode === 'existing') return 'empty' // All 4 slots editable in existing mode
    return 'available'
  }

  // Validation
  const canSave = filledSlots > 0

  // Footer
  const footer = (
    <div className="flex items-center w-full">
      {/* Left side: workflow actions (existing only) */}
      {mode === 'existing' && booking && (
        <WorkflowActions
          status={booking.status}
          isProcessing={isSubmitting || !!processingAction}
          processingAction={processingAction}
          onCheckIn={onCheckIn ? async () => {
            setProcessingAction('checkIn')
            try {
              await onCheckIn()
            } finally {
              setProcessingAction(undefined)
            }
          } : undefined}
          onMarkOnCourse={onMarkOnCourse ? async () => {
            setProcessingAction('markOnCourse')
            try {
              await onMarkOnCourse()
            } finally {
              setProcessingAction(undefined)
            }
          } : undefined}
          onMarkFinished={onMarkFinished ? async () => {
            setProcessingAction('markFinished')
            try {
              await onMarkFinished()
            } finally {
              setProcessingAction(undefined)
            }
          } : undefined}
          onSettle={onSettle}
          onMove={onMove}
          onCopy={onCopy}
          onCancel={() => handleCancelBooking()}
        />
      )}

      {/* Right side: edit actions */}
      <div className="flex items-center gap-2 ml-auto">
        {mode === 'new' ? (
          <>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-stone-200 rounded-lg font-medium hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || isSubmitting}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Booking
            </button>
          </>
        ) : hasUnsavedChanges ? (
          <>
            <button
              type="button"
              onClick={handleDiscard}
              disabled={isSubmitting}
              className="px-4 py-2 border border-stone-200 rounded-lg font-medium hover:bg-stone-50 transition-colors"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || isSubmitting}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </>
        ) : null}
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'new' ? 'New Booking' : `Booking #${booking?.bookingNumber || ''}`}
      subtitle={
        <HeaderSubtitle
          mode={mode}
          booking={booking}
          time={time}
          courseName={courseName}
          date={date}
          startingHole={startingHole}
        />
      }
      footer={footer}
      size="lg"
    >
      <div className="space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Golfer Count + Holes (new) or just Holes (existing) */}
        {mode === 'new' ? (
          <div className="grid grid-cols-2 gap-4">
            <GolferCountSelector value={golferCount} onChange={handleGolferCountChange} />
            <HoleSelector value={holes} onChange={setHoles} />
          </div>
        ) : (
          <HoleSelector value={holes} onChange={setHoles} />
        )}

        {/* Players Section */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">
            Players {mode === 'new' && `(${filledSlots}/${golferCount})`}
          </label>

          <div className="space-y-2">
            {slots.map((slot, index) => {
              const state = getSlotState(index)
              const isAddingThisPosition = addingPlayerPosition === index

              if (isAddingThisPosition) {
                return (
                  <AddPlayerFlow
                    key={index}
                    position={index + 1}
                    onAdd={(player) => handleAddPlayer(index, player)}
                    onCancel={() => setAddingPlayerPosition(null)}
                    bookerName={bookerName}
                    bookingMemberId={bookingMemberId}
                    requireGuestContact={clubSettings.requireGuestContact}
                    searchMemberFn={onSearchMembers}
                  />
                )
              }

              // Skip "available" slots in new mode (show only up to golferCount)
              if (state === 'available' && mode === 'new') {
                return null
              }

              return (
                <PlayerSlot
                  key={index}
                  position={index + 1}
                  player={slot.player ? {
                    id: slot.player.id,
                    name: slot.player.name,
                    type: slot.player.type,
                    memberId: slot.player.memberId,
                  } : null}
                  caddyValue={slot.caddyRequest}
                  cartValue={slot.cartRequest}
                  rentalValue={slot.rentalRequest}
                  onCaddyChange={(v) => handleCaddyChange(index, v)}
                  onCartChange={(v) => handleCartChange(index, v)}
                  onRentalChange={(v) => handleRentalChange(index, v)}
                  onAddPlayer={() => setAddingPlayerPosition(index)}
                  onRemovePlayer={() => handleRemovePlayer(index)}
                  availableCaddies={availableCaddies}
                  cartPolicy={clubSettings.cartPolicy}
                  rentalPolicy={clubSettings.rentalPolicy}
                  state={state}
                  disabled={isSubmitting}
                />
              )
            })}
          </div>
        </div>

        {/* Booked By (existing only) */}
        {mode === 'existing' && booking && (
          <BookedBySection
            bookerName={booking.bookerName}
            bookerMemberId={booking.bookerMemberId}
            createdAt={booking.createdAt}
          />
        )}

        {/* Booking Notes */}
        <BookingNotes value={notes} onChange={setNotes} />
      </div>
    </Modal>
  )
}

export type { BookingPayload, PlayerPayload, ClubSettings }
