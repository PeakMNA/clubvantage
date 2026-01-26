'use client'

import { useState } from 'react'
import { cn } from '@clubvantage/ui'
import { Loader2, AlertCircle, Check, Star } from 'lucide-react'
import { Modal } from './modal'
import { PersonSearch } from './person-search'
import { FlightStatusBadge } from './flight-status-badge'
import { PlayerTypeBadge, type PlayerType } from './player-type-badge'
import type { Flight, Player, Cart, Caddy } from './types'

interface CheckInModalProps {
  isOpen: boolean
  onClose: () => void
  flight: Flight
  availableCarts: Cart[]
  availableCaddies: Caddy[]
  onComplete: (data: {
    checkedInPlayers: string[]
    assignedCarts: string[]
    assignedCaddies: string[]
    notes: string
  }) => Promise<void>
}

function SkillStars({ level }: { level: Caddy['skillLevel'] }) {
  const stars = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
  }
  return (
    <div className="flex">
      {Array.from({ length: 4 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3 w-3',
            i < stars[level] ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/50'
          )}
        />
      ))}
    </div>
  )
}

export function CheckInModal({
  isOpen,
  onClose,
  flight,
  availableCarts,
  availableCaddies,
  onComplete,
}: CheckInModalProps) {
  const players = flight.players.filter(Boolean) as Player[]

  const [checkedPlayers, setCheckedPlayers] = useState<Set<string>>(new Set())
  const [selectedCarts, setSelectedCarts] = useState<string[]>([])
  const [selectedCaddies, setSelectedCaddies] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasSuspendedMember = players.some((p) => false) // Would check suspension status

  const togglePlayer = (playerId: string) => {
    const newSet = new Set(checkedPlayers)
    if (newSet.has(playerId)) {
      newSet.delete(playerId)
    } else {
      newSet.add(playerId)
    }
    setCheckedPlayers(newSet)
  }

  const toggleAll = () => {
    if (checkedPlayers.size === players.length) {
      setCheckedPlayers(new Set())
    } else {
      setCheckedPlayers(new Set(players.map((p) => p.id)))
    }
  }

  const toggleCart = (cartId: string) => {
    setSelectedCarts((prev) =>
      prev.includes(cartId)
        ? prev.filter((id) => id !== cartId)
        : [...prev, cartId]
    )
  }

  const toggleCaddy = (caddyId: string) => {
    setSelectedCaddies((prev) =>
      prev.includes(caddyId)
        ? prev.filter((id) => id !== caddyId)
        : [...prev, caddyId]
    )
  }

  const handleComplete = async () => {
    if (checkedPlayers.size === 0) return

    setIsSubmitting(true)
    setError(null)

    try {
      await onComplete({
        checkedInPlayers: Array.from(checkedPlayers),
        assignedCarts: selectedCarts,
        assignedCaddies: selectedCaddies,
        notes,
      })
      onClose()
    } catch (err) {
      setError('Failed to complete check-in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const footer = (
    <>
      <button
        onClick={onClose}
        className="px-4 py-2 border border-border rounded-md font-medium hover:bg-muted/50 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={handleComplete}
        disabled={checkedPlayers.size === 0 || hasSuspendedMember || isSubmitting}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Complete Check-In
      </button>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Check In Flight"
      subtitle={flight.time}
      footer={footer}
      size="lg"
    >
      <div className="space-y-6">
        {/* Flight Info */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <div className="text-2xl font-bold">{flight.time}</div>
            <div className="text-sm text-muted-foreground">{flight.date}</div>
          </div>
          <FlightStatusBadge status={flight.status} />
        </div>

        {/* Error/Warning Banners */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {hasSuspendedMember && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">
              Cannot check in: One or more players have suspended accounts.
            </span>
          </div>
        )}

        {/* Player Verification */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-muted-foreground">
              Verify Players
            </label>
            <button
              onClick={toggleAll}
              className="text-sm text-primary hover:underline"
            >
              {checkedPlayers.size === players.length ? 'Uncheck All' : 'Toggle All'}
            </button>
          </div>
          <div className="space-y-2">
            {players.map((player) => (
              <label
                key={player.id}
                className={cn(
                  'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
                  checkedPlayers.has(player.id)
                    ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30'
                    : 'hover:bg-muted/50'
                )}
              >
                <input
                  type="checkbox"
                  checked={checkedPlayers.has(player.id)}
                  onChange={() => togglePlayer(player.id)}
                  className="h-5 w-5 rounded text-primary focus:ring-primary"
                />
                <span className="font-medium flex-1">{player.name}</span>
                <PlayerTypeBadge type={player.type} />
                {player.handicap !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    HCP: {player.handicap}
                  </span>
                )}
              </label>
            ))}
          </div>

          {/* Add Walk-up */}
          {players.length < 4 && (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground mb-2">
                Add walk-up to empty positions:
              </p>
              <PersonSearch
                onSelect={(person) => {
                  // Would add to flight
                }}
                onWalkup={() => {
                  // Would show walkup form
                }}
                placeholder="Search to add player..."
              />
            </div>
          )}
        </div>

        {/* Resource Assignment */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-3">
            Assign Resources
          </label>

          {/* Carts */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Carts</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableCarts.length === 0 ? (
                <p className="text-sm text-muted-foreground col-span-full">
                  No carts available
                </p>
              ) : (
                availableCarts.map((cart) => (
                  <button
                    key={cart.id}
                    onClick={() => toggleCart(cart.id)}
                    className={cn(
                      'p-3 text-left border rounded-lg transition-colors',
                      selectedCarts.includes(cart.id)
                        ? 'bg-primary/10 border-primary'
                        : 'hover:border-border'
                    )}
                  >
                    <div className="font-medium">Cart #{cart.number}</div>
                    <div className="text-sm text-muted-foreground">
                      {cart.type}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Caddies */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Caddies</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableCaddies.length === 0 ? (
                <p className="text-sm text-muted-foreground col-span-full">
                  No caddies available
                </p>
              ) : (
                availableCaddies.map((caddy) => (
                  <button
                    key={caddy.id}
                    onClick={() => toggleCaddy(caddy.id)}
                    className={cn(
                      'p-3 text-left border rounded-lg transition-colors',
                      selectedCaddies.includes(caddy.id)
                        ? 'bg-primary/10 border-primary'
                        : 'hover:border-border'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{caddy.name}</span>
                      <SkillStars level={caddy.skillLevel} />
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {caddy.skillLevel} • Available
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Check-in Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes for the starter..."
            rows={2}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
      </div>
    </Modal>
  )
}
