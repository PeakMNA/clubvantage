'use client'

import { useState } from 'react'
import { cn } from '@clubvantage/ui'
import { Loader2, AlertCircle, X } from 'lucide-react'
import { Modal } from './modal'
import { PersonSearch } from './person-search'
import { FlightStatusBadge } from './flight-status-badge'
import { PlayerTypeBadge, type PlayerType } from './player-type-badge'
import type { Flight, Player } from './types'

interface AddPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  flight: Flight
  onAdd: (data: {
    position: number
    player: {
      id: string
      name: string
      type: PlayerType
      memberId?: string
      handicap?: number
    }
    notes: string
  }) => Promise<void>
}

export function AddPlayerModal({
  isOpen,
  onClose,
  flight,
  onAdd,
}: AddPlayerModalProps) {
  const existingPlayers = flight.players.filter(Boolean) as Player[]
  const availableSlots = 4 - existingPlayers.length

  // Find first available position
  const nextAvailablePosition = flight.players.findIndex(p => p === null)

  const [playerName, setPlayerName] = useState('')
  const [memberId, setMemberId] = useState('')
  const [playerType, setPlayerType] = useState<PlayerType>('member')
  const [handicap, setHandicap] = useState('')
  const [notes, setNotes] = useState('')
  const [showWalkupForm, setShowWalkupForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSelectPerson = (person: {
    id: string
    name: string
    type: PlayerType
    memberId?: string
    handicap?: number
  }) => {
    setPlayerName(person.name)
    setPlayerType(person.type)
    setMemberId(person.memberId || '')
    setHandicap(person.handicap?.toString() || '')
    setShowWalkupForm(false)
  }

  const handleClearForm = () => {
    setPlayerName('')
    setMemberId('')
    setPlayerType('member')
    setHandicap('')
    setNotes('')
  }

  const handleAdd = async () => {
    if (nextAvailablePosition === -1 || !playerName.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      await onAdd({
        position: nextAvailablePosition,
        player: {
          id: memberId || `walkup-${Date.now()}`,
          name: playerName.trim(),
          type: playerType,
          memberId: memberId || undefined,
          handicap: handicap ? parseInt(handicap) : undefined,
        },
        notes,
      })
      onClose()
    } catch (err) {
      setError('Failed to add player. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = nextAvailablePosition !== -1 && playerName.trim()

  const footer = (
    <>
      <button
        onClick={onClose}
        className="px-4 py-2 border border-border rounded-md font-medium hover:bg-muted/50 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={handleAdd}
        disabled={!canSubmit || isSubmitting}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Add Player
      </button>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Player to Flight"
      subtitle={flight.time}
      footer={footer}
      size="lg"
    >
      <div className="space-y-6">
        {/* Flight Info */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <div className="text-2xl font-bold">{flight.time}</div>
            <div className="text-sm text-muted-foreground">
              {existingPlayers.length}/4 players • {availableSlots} slot{availableSlots !== 1 ? 's' : ''} available
            </div>
          </div>
          <FlightStatusBadge status={flight.status} />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Current Players */}
        {existingPlayers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Current Players
            </label>
            <div className="space-y-2">
              {existingPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 border rounded-lg"
                >
                  <span className="font-medium flex-1">{player.name}</span>
                  <PlayerTypeBadge type={player.type} />
                  {player.handicap !== undefined && (
                    <span className="text-sm text-muted-foreground">
                      HCP: {player.handicap}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Slots Available */}
        {availableSlots === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="font-medium">Flight is full</p>
            <p className="text-sm">All 4 slots are occupied</p>
          </div>
        ) : (
          <>
            {/* Person Search */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Find Player
              </label>
              {showWalkupForm ? (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Add as Walk-up</span>
                    <button
                      onClick={() => setShowWalkupForm(false)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Fill in the player details below to add as a walk-up guest.
                  </p>
                </div>
              ) : (
                <PersonSearch
                  onSelect={handleSelectPerson}
                  onWalkup={() => {
                    setShowWalkupForm(true)
                    setPlayerType('walkup')
                  }}
                  placeholder="Search by phone, name, email, or member number..."
                />
              )}
            </div>

            {/* Player Details Form */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-muted-foreground">
                  Player Details
                </label>
                {playerName && (
                  <button
                    onClick={handleClearForm}
                    className="text-sm text-muted-foreground hover:text-muted-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Player name"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Member ID & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Member ID
                  </label>
                  <input
                    type="text"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Player Type
                  </label>
                  <div className="flex gap-1">
                    {(['member', 'guest', 'dependent', 'walkup'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setPlayerType(type)}
                        className={cn(
                          'flex-1 py-2 text-xs font-medium rounded-md border transition-colors capitalize',
                          playerType === type
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'hover:border-border'
                        )}
                      >
                        {type === 'walkup' ? 'Walk-up' : type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Handicap */}
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Handicap
                </label>
                <input
                  type="number"
                  value={handicap}
                  onChange={(e) => setHandicap(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any notes about this player..."
                  rows={2}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>

            {/* Preview */}
            {playerName && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-700 font-medium mb-1">
                  Ready to add:
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{playerName}</span>
                  <PlayerTypeBadge type={playerType} />
                  {handicap && (
                    <span className="text-sm text-muted-foreground">
                      HCP: {handicap}
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}
