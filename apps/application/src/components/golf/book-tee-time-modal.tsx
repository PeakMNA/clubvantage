'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@clubvantage/ui'
import { Loader2, X, AlertCircle } from 'lucide-react'
import { Modal } from './modal'
import { PersonSearch } from './person-search'
import { PlayerTypeBadge, type PlayerType } from './player-type-badge'
import { BookingTypeSelector, type BookingType } from './booking-type-selector'
import type { BookingGroup, Player, HoleChoice, Course } from './types'

// GraphQL query for searching members
const SEARCH_MEMBERS_QUERY = `
  query SearchMembers($search: String, $first: Int) {
    members(search: $search, first: $first) {
      edges {
        node {
          id
          memberId
          firstName
          lastName
          email
          phone
        }
      }
    }
  }
`

interface TimeSlot {
  time: string
  available: number
}

interface SelectedPlayer {
  id: string
  name: string
  type: PlayerType
  memberId?: string
}

export interface BookTeeTimeModalProps {
  isOpen: boolean
  onClose: () => void
  courseName: string
  date: string
  preselectedTime?: string
  availableSlots: TimeSlot[]
  existingPlayers?: (Player | null)[]
  existingGroups?: BookingGroup[]
  // 18-hole booking support
  course?: Course
  enable18HoleBooking?: boolean
  onConfirm: (data: {
    time: string
    players: SelectedPlayer[]
    caddyRequest: 'none' | 'shared' | 'individual'
    cartRequest: boolean
    notes: string
    bookingType?: BookingType
    holeChoice?: HoleChoice
    startingNine?: 'front9' | 'back9'
  }) => Promise<void>
}

export function BookTeeTimeModal({
  isOpen,
  onClose,
  courseName,
  date,
  preselectedTime,
  availableSlots,
  existingPlayers = [],
  existingGroups = [],
  course,
  enable18HoleBooking = false,
  onConfirm,
}: BookTeeTimeModalProps) {
  const [selectedTime, setSelectedTime] = useState<string>(preselectedTime || '')
  const [numberOfGolfers, setNumberOfGolfers] = useState<number>(1)
  const [players, setPlayers] = useState<SelectedPlayer[]>([])
  const [caddyRequest, setCaddyRequest] = useState<'none' | 'shared' | 'individual'>('none')
  const [cartRequest, setCartRequest] = useState(false)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showWalkupForm, setShowWalkupForm] = useState(false)
  const [walkupName, setWalkupName] = useState('')
  const [bookingType, setBookingType] = useState<BookingType>('add')
  // 18-hole booking state
  const [holeChoice, setHoleChoice] = useState<HoleChoice>('9-hole')
  const [startingNine, setStartingNine] = useState<'front9' | 'back9'>('front9')

  // Member search function using real API with authenticated fetch
  const searchMembers = useCallback(async (query: string): Promise<{ id: string; name: string; type: PlayerType; phone?: string; email?: string; memberId?: string }[]> => {
    if (query.length < 2) return []

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          query: SEARCH_MEMBERS_QUERY,
          variables: { search: query, first: 10 },
        }),
      })

      const data = await response.json()

      if (data.errors) {
        console.error('GraphQL errors:', data.errors)
        return []
      }

      return data.data.members.edges.map(({ node }: { node: { id: string; memberId: string; firstName: string; lastName: string; email: string | null; phone: string | null } }) => ({
        id: node.id, // This is the actual UUID
        name: `${node.firstName} ${node.lastName}`,
        type: 'member' as PlayerType,
        phone: node.phone || undefined,
        email: node.email || undefined,
        memberId: node.memberId, // This is the member number like M-0001 (for display)
      }))
    } catch (error) {
      console.error('Failed to search members:', error)
      return []
    }
  }, [])

  // Calculate projected time for second 9 based on pace of play
  const getProjectedSecond9Time = () => {
    if (!course?.paceOfPlay || !selectedTime) return null
    const { front9Minutes, back9Minutes, turnTimeMinutes } = course.paceOfPlay
    const playTime = startingNine === 'front9' ? front9Minutes : back9Minutes
    const totalMinutes = playTime + turnTimeMinutes

    // Parse the selected time
    const match = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!match) return null

    let hours = parseInt(match[1] || '0', 10)
    const minutes = parseInt(match[2] || '0', 10)
    const isPM = (match[3] || 'AM').toUpperCase() === 'PM'

    if (isPM && hours !== 12) hours += 12
    if (!isPM && hours === 12) hours = 0

    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + totalMinutes

    const endHours = Math.floor(endMinutes / 60) % 24
    const endMins = endMinutes % 60
    const endIsPM = endHours >= 12
    const displayHours = endHours > 12 ? endHours - 12 : endHours === 0 ? 12 : endHours

    return `${displayHours}:${endMins.toString().padStart(2, '0')} ${endIsPM ? 'PM' : 'AM'}`
  }

  const projectedSecond9Time = holeChoice === '18-hole' ? getProjectedSecond9Time() : null

  const hasExistingPlayers = existingPlayers.some((p) => p !== null)

  const selectedSlot = availableSlots.find((s) => s.time === selectedTime)
  const maxAvailable = selectedSlot?.available || 4
  const maxPlayers = Math.min(numberOfGolfers, maxAvailable)
  const canAddPlayer = players.length < maxPlayers

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTime(preselectedTime || '')
      setNumberOfGolfers(1)
      setPlayers([])
      setCaddyRequest('none')
      setCartRequest(false)
      setNotes('')
      setError(null)
      setShowWalkupForm(false)
      setWalkupName('')
      setBookingType('add')
      setHoleChoice('9-hole')
      setStartingNine('front9')
    }
  }, [isOpen, preselectedTime])

  // Adjust numberOfGolfers when maxAvailable changes
  useEffect(() => {
    if (numberOfGolfers > maxAvailable) {
      setNumberOfGolfers(Math.max(1, maxAvailable))
      // Also trim players if needed
      if (players.length > maxAvailable) {
        setPlayers(players.slice(0, maxAvailable))
      }
    }
  }, [maxAvailable, numberOfGolfers, players])

  const handleAddPlayer = (person: { id: string; name: string; type: PlayerType; memberId?: string }) => {
    if (canAddPlayer) {
      setPlayers([...players, person])
    }
  }

  const handleAddWalkup = () => {
    if (walkupName.trim() && canAddPlayer) {
      setPlayers([
        ...players,
        {
          id: `walkup-${Date.now()}`,
          name: walkupName.trim(),
          type: 'walkup',
        },
      ])
      setWalkupName('')
      setShowWalkupForm(false)
    }
  }

  const handleRemovePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index))
  }

  const handleConfirm = async () => {
    if (!selectedTime || players.length === 0 || players.length < numberOfGolfers) return

    setIsSubmitting(true)
    setError(null)

    try {
      await onConfirm({
        time: selectedTime,
        players,
        caddyRequest,
        cartRequest,
        notes,
        bookingType: hasExistingPlayers ? bookingType : undefined,
        holeChoice: enable18HoleBooking ? holeChoice : undefined,
        startingNine: enable18HoleBooking && holeChoice === '18-hole' ? startingNine : undefined,
      })
      onClose()
    } catch (err) {
      setError('Failed to book tee time. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Price calculation (mock)
  const greenFee = 1500
  const cartFee = cartRequest ? 800 : 0
  const caddyFee = caddyRequest === 'individual' ? 400 * players.length : caddyRequest === 'shared' ? 600 : 0
  const totalPerPlayer = greenFee + (cartRequest ? cartFee / Math.max(players.length, 1) : 0) + (caddyRequest === 'individual' ? 400 : caddyRequest === 'shared' ? caddyFee / Math.max(players.length, 1) : 0)
  const total = greenFee * players.length + cartFee + caddyFee

  const footer = (
    <>
      <button
        onClick={onClose}
        className="px-4 py-2 border border-border rounded-md font-medium hover:bg-muted/50 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={handleConfirm}
        disabled={!selectedTime || players.length < numberOfGolfers || isSubmitting}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {players.length < numberOfGolfers
          ? `Add ${numberOfGolfers - players.length} more player${numberOfGolfers - players.length !== 1 ? 's' : ''}`
          : 'Confirm Booking'}
      </button>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Tee Time"
      subtitle={`${courseName} • ${date}`}
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

        {/* Time Slot Selector */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Select Time Slot
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1">
            {availableSlots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => setSelectedTime(slot.time)}
                disabled={slot.available === 0}
                className={cn(
                  'p-2 text-sm rounded-md border transition-colors',
                  selectedTime === slot.time
                    ? 'bg-primary text-primary-foreground border-primary'
                    : slot.available === 0
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'hover:border-primary hover:bg-primary/5'
                )}
              >
                <div className="font-medium">{slot.time}</div>
                <div className="text-xs opacity-70">{slot.available} avail</div>
              </button>
            ))}
          </div>
        </div>

        {/* 18-Hole Booking Selector - shown when course supports it */}
        {enable18HoleBooking && selectedTime && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Round Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setHoleChoice('9-hole')}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-left',
                    holeChoice === '9-hole'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="font-semibold">9 Holes</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Single loop • ~2 hours
                  </div>
                </button>
                <button
                  onClick={() => setHoleChoice('18-hole')}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-left',
                    holeChoice === '18-hole'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="font-semibold">18 Holes</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Full round • ~4 hours
                  </div>
                </button>
              </div>
            </div>

            {/* Starting Nine Selector - only for 18-hole */}
            {holeChoice === '18-hole' && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Starting Nine
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setStartingNine('front9')}
                    className={cn(
                      'p-3 rounded-lg border transition-all text-left',
                      startingNine === 'front9'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="font-medium">Front 9</div>
                    <div className="text-xs text-muted-foreground">
                      {course?.front9?.name || 'Holes 1-9'}
                    </div>
                  </button>
                  <button
                    onClick={() => setStartingNine('back9')}
                    className={cn(
                      'p-3 rounded-lg border transition-all text-left',
                      startingNine === 'back9'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="font-medium">Back 9</div>
                    <div className="text-xs text-muted-foreground">
                      {course?.back9?.name || 'Holes 10-18'}
                    </div>
                  </button>
                </div>

                {/* Projected Second 9 Time */}
                {projectedSecond9Time && (
                  <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <span className="text-sm font-medium">
                        {startingNine === 'front9' ? 'Back 9' : 'Front 9'} slot will be auto-reserved at ~{projectedSecond9Time}
                      </span>
                    </div>
                    <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                      Based on average pace of play ({course?.paceOfPlay?.front9Minutes || 120} min + {course?.paceOfPlay?.turnTimeMinutes || 15} min turn)
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Booking Type Selector - shown when slot has existing players */}
        {hasExistingPlayers && selectedTime && (
          <BookingTypeSelector
            value={bookingType}
            onChange={setBookingType}
            existingGroups={existingGroups}
            existingPlayers={existingPlayers}
          />
        )}

        {/* Number of Golfers Selector */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Number of Golfers
            {selectedTime && maxAvailable < 4 && (
              <span className="text-xs font-normal text-muted-foreground ml-2">
                ({maxAvailable} slot{maxAvailable !== 1 ? 's' : ''} available)
              </span>
            )}
          </label>
          <div className="flex gap-2">
            {Array.from({ length: maxAvailable }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => {
                  setNumberOfGolfers(num)
                  // Remove excess players if reducing count
                  if (players.length > num) {
                    setPlayers(players.slice(0, num))
                  }
                }}
                className={cn(
                  'flex-1 py-3 text-lg font-semibold rounded-md border transition-colors',
                  numberOfGolfers === num
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:border-primary hover:bg-primary/5'
                )}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Player Entry */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Players ({players.length}/{numberOfGolfers})
          </label>

          {/* Added Players */}
          <div className="space-y-2 mb-3">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{player.name}</span>
                  <PlayerTypeBadge type={player.type} />
                  {player.memberId && (
                    <span className="text-xs text-muted-foreground">
                      {player.memberId}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemovePlayer(index)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>

          {/* Search or Walk-up Form */}
          {canAddPlayer && (
            showWalkupForm ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={walkupName}
                  onChange={(e) => setWalkupName(e.target.value)}
                  placeholder="Walk-up guest name"
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleAddWalkup}
                  disabled={!walkupName.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowWalkupForm(false)}
                  className="px-4 py-2 border rounded-md hover:bg-muted/50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <PersonSearch
                onSelect={handleAddPlayer}
                onWalkup={() => setShowWalkupForm(true)}
                searchFn={searchMembers}
              />
            )
          )}
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Caddy Request */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Caddy Request
            </label>
            <div className="flex gap-2">
              {(['none', 'shared', 'individual'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setCaddyRequest(option)}
                  className={cn(
                    'flex-1 py-2 px-3 text-sm rounded-md border transition-colors capitalize',
                    caddyRequest === option
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:border-border'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Cart Request */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Cart Request
            </label>
            <button
              onClick={() => setCartRequest(!cartRequest)}
              className={cn(
                'w-full py-2 px-3 text-sm rounded-md border transition-colors',
                cartRequest
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:border-border'
              )}
            >
              {cartRequest ? 'Cart Requested' : 'No Cart'}
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special instructions or requests..."
            rows={2}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Price Preview */}
        {players.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Price Preview</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Green Fees ({players.length} × ฿{greenFee.toLocaleString()})</span>
                <span>฿{(greenFee * players.length).toLocaleString()}</span>
              </div>
              {cartRequest && (
                <div className="flex justify-between">
                  <span>Cart</span>
                  <span>฿{cartFee.toLocaleString()}</span>
                </div>
              )}
              {caddyRequest !== 'none' && (
                <div className="flex justify-between">
                  <span>Caddy ({caddyRequest})</span>
                  <span>฿{caddyFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t mt-2">
                <span>Total</span>
                <span>฿{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
