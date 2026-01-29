'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@clubvantage/ui'
import { X, Plus, Car, Users, ChevronDown, ChevronUp, FileText, Loader2, Check, Clock, Calendar } from 'lucide-react'
import { FlightStatusBadge, type FlightStatus } from './flight-status-badge'
import { PlayerCard } from './player-card'
import { BookingGroupsSection } from './booking-groups-section'
import type { Flight, Player, Cart, Caddy, RentalStatus } from './types'

interface FlightDetailPanelProps {
  flight: Flight | null
  isOpen: boolean
  isLoading?: boolean
  selectedGroupId?: 1 | 2
  onClose: () => void
  onCheckIn?: () => void
  onMarkOnCourse?: () => void
  onSettle?: () => void
  onMarkFinished?: () => void
  onCancelFlight?: () => void
  onViewReceipt?: () => void
  onOverridePenalty?: () => void
  onAddPlayer?: () => void
  onViewPlayerProfile?: (player: Player) => void
  onRemovePlayer?: (player: Player) => void
  // Cart/Caddy assignment props (flight-level)
  availableCarts?: Cart[]
  availableCaddies?: Caddy[]
  onAssignCart?: (cartId: string) => void
  onAssignCaddy?: (caddyId: string) => void
  onUnassignCart?: () => void
  onUnassignCaddy?: () => void
  // Per-player rental status
  onPlayerCartStatusChange?: (player: Player, status: RentalStatus) => void
  onPlayerCaddyStatusChange?: (player: Player, status: RentalStatus) => void
}

function getActionButtons(
  status: FlightStatus,
  handlers: Pick<
    FlightDetailPanelProps,
    | 'onCheckIn'
    | 'onMarkOnCourse'
    | 'onSettle'
    | 'onMarkFinished'
    | 'onCancelFlight'
    | 'onViewReceipt'
    | 'onOverridePenalty'
  >
) {
  const primaryButtonClass = 'flex-1 py-3 px-4 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl font-medium shadow-lg shadow-slate-900/20 hover:shadow-xl transition-all duration-300 active:scale-[0.98]'
  const secondaryButtonClass = 'py-3 px-4 border border text-foreground rounded-xl font-medium hover:bg-muted transition-all duration-300 active:scale-[0.98]'
  const dangerButtonClass = 'py-3 px-4 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all duration-300 active:scale-[0.98]'

  switch (status) {
    case 'booked':
      return (
        <>
          <button onClick={handlers.onCheckIn} className={primaryButtonClass}>
            Check In
          </button>
          <button onClick={handlers.onCancelFlight} className={dangerButtonClass}>
            Cancel
          </button>
        </>
      )
    case 'checked-in':
      return (
        <>
          <button onClick={handlers.onSettle} className={primaryButtonClass}>
            Settle
          </button>
          <button onClick={handlers.onMarkOnCourse} className={secondaryButtonClass}>
            On Course
          </button>
        </>
      )
    case 'on-course':
      return (
        <>
          <button onClick={handlers.onSettle} className={primaryButtonClass}>
            Settle
          </button>
          <button onClick={handlers.onMarkFinished} className={secondaryButtonClass}>
            Finished
          </button>
        </>
      )
    case 'finished':
      return (
        <button onClick={handlers.onViewReceipt} className={secondaryButtonClass}>
          View Receipt
        </button>
      )
    case 'no-show':
      return (
        <>
          <button onClick={handlers.onOverridePenalty} className={secondaryButtonClass}>
            Override Penalty
          </button>
          <button className={secondaryButtonClass}>
            View Details
          </button>
        </>
      )
    default:
      return null
  }
}

export function FlightDetailPanel({
  flight,
  isOpen,
  isLoading,
  selectedGroupId,
  onClose,
  onCheckIn,
  onMarkOnCourse,
  onSettle,
  onMarkFinished,
  onCancelFlight,
  onViewReceipt,
  onOverridePenalty,
  onAddPlayer,
  onViewPlayerProfile,
  onRemovePlayer,
  availableCarts = [],
  availableCaddies = [],
  onAssignCart,
  onAssignCaddy,
  onUnassignCart,
  onUnassignCaddy,
  onPlayerCartStatusChange,
  onPlayerCaddyStatusChange,
}: FlightDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [notesExpanded, setNotesExpanded] = useState(false)
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)
  const [caddyDropdownOpen, setCaddyDropdownOpen] = useState(false)

  // Filter data by selected group if specified
  const filteredBookingGroups = selectedGroupId && flight?.bookingGroups
    ? flight.bookingGroups.filter(g => g.groupNumber === selectedGroupId)
    : flight?.bookingGroups

  const filteredPlayers = selectedGroupId && flight?.players
    ? flight.players.map(p => {
        if (!p) return p
        // Show player only if they belong to selected group
        if (p.groupId === selectedGroupId) return p
        // Also check if player is in the selected booking group's playerIds (fallback)
        const selectedGroup = flight.bookingGroups?.find(g => g.groupNumber === selectedGroupId)
        if (selectedGroup?.playerIds.includes(p.id)) return p
        // If no groups defined yet (single booking), show all players
        if (!flight.bookingGroups || flight.bookingGroups.length === 0) return p
        return null
      })
    : flight?.players

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  // Use filtered players if a group is selected, otherwise show all
  const displayPlayers = (selectedGroupId ? filteredPlayers : flight?.players)?.filter(Boolean) as Player[] || []
  const playerCount = displayPlayers.length

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          'fixed right-0 top-0 h-full w-full sm:w-[420px] bg-card shadow-2xl z-50 flex flex-col',
          'animate-in slide-in-from-right duration-300'
        )}
      >
        {/* Header */}
        <div className="relative border-b border-border bg-gradient-to-br from-muted to-card">
          {/* Decorative accent line */}
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-300" />

          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 shadow-inner">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">{flight?.time || '--'}</h2>
                  <div className="flex items-center gap-1.5 mt-0.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {flight?.date}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {flight && <FlightStatusBadge status={flight.status} />}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 sm:space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                <span className="text-sm text-muted-foreground">Loading flight details...</span>
              </div>
            </div>
          ) : flight ? (
            <>
              {/* Booking Groups Section - only show when viewing all groups (multiple groups exist) */}
              {!selectedGroupId && filteredBookingGroups && filteredBookingGroups.length > 1 && (
                <BookingGroupsSection
                  bookingGroups={filteredBookingGroups}
                  players={filteredPlayers || flight.players}
                />
              )}

              {/* Players Section */}
              <div className="relative overflow-hidden rounded-xl border border/60 bg-card/80 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent pointer-events-none" />

                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-violet-200/50 shadow-inner">
                        <Users className="h-4 w-4 text-violet-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Players
                      </h3>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {playerCount}/4
                    </span>
                  </div>

                  <div className="space-y-2">
                    {displayPlayers.map((player, index) => (
                      <PlayerCard
                        key={player.id}
                        player={player}
                        position={(index + 1) as 1 | 2 | 3 | 4}
                        onViewProfile={
                          player.type === 'member' || player.type === 'dependent'
                            ? () => onViewPlayerProfile?.(player)
                            : undefined
                        }
                        onRemove={() => onRemovePlayer?.(player)}
                        showRentalControls={!!(onPlayerCartStatusChange || onPlayerCaddyStatusChange)}
                        onCartStatusChange={(status) => onPlayerCartStatusChange?.(player, status)}
                        onCaddyStatusChange={(status) => onPlayerCaddyStatusChange?.(player, status)}
                      />
                    ))}
                    {/* Only show Add Player button when viewing all groups */}
                    {!selectedGroupId && playerCount < 4 && (
                      <button
                        onClick={onAddPlayer}
                        className="w-full py-3 border-2 border-dashed border rounded-xl text-sm font-medium text-muted-foreground hover:border-emerald-300 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 group"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed border-border group-hover:border-emerald-400 transition-colors">
                          <Plus className="h-3.5 w-3.5" />
                        </span>
                        Add Player
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Resources Section */}
              <div className="relative overflow-hidden rounded-xl border border/60 bg-card/80 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent pointer-events-none" />

                <div className="relative p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-muted to-muted/50 shadow-inner">
                      <Car className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Resources</h3>
                  </div>

                  <div className="space-y-3">
                    {/* Cart Assignment */}
                    <div className="relative">
                      <div className="flex items-center justify-between p-3 bg-muted/80 rounded-xl border border-border">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Cart</span>
                        </div>
                        <button
                          onClick={() => setCartDropdownOpen(!cartDropdownOpen)}
                          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
                        >
                          {flight.cartId ? (
                            <>
                              <span>Cart #{availableCarts.find(c => c.id === flight.cartId)?.number || flight.cartId}</span>
                              <ChevronDown className="h-3.5 w-3.5" />
                            </>
                          ) : (
                            <>
                              <span>Assign</span>
                              <ChevronDown className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                      {cartDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1 w-56 bg-card border border/60 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 z-10 py-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                          {flight.cartId && onUnassignCart && (
                            <>
                              <button
                                onClick={() => {
                                  onUnassignCart()
                                  setCartDropdownOpen(false)
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              >
                                Remove Cart
                              </button>
                              <div className="border-t border-border my-1" />
                            </>
                          )}
                          {availableCarts.length > 0 ? (
                            availableCarts.map((cart) => (
                              <button
                                key={cart.id}
                                onClick={() => {
                                  onAssignCart?.(cart.id)
                                  setCartDropdownOpen(false)
                                }}
                                className={cn(
                                  'w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center justify-between transition-colors',
                                  cart.id === flight.cartId && 'bg-emerald-50 dark:bg-emerald-500/20'
                                )}
                              >
                                <div>
                                  <span className="font-medium text-foreground">Cart #{cart.number}</span>
                                  <span className="text-muted-foreground ml-2">({cart.type})</span>
                                </div>
                                {cart.id === flight.cartId && <Check className="h-4 w-4 text-emerald-600" />}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                              No carts available
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Caddy Assignment */}
                    <div className="relative">
                      <div className="flex items-center justify-between p-3 bg-muted/80 rounded-xl border border-border">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Caddy</span>
                        </div>
                        <button
                          onClick={() => setCaddyDropdownOpen(!caddyDropdownOpen)}
                          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
                        >
                          {flight.caddyId ? (
                            <>
                              <span>{availableCaddies.find(c => c.id === flight.caddyId)?.name || 'Assigned'}</span>
                              <ChevronDown className="h-3.5 w-3.5" />
                            </>
                          ) : (
                            <>
                              <span>Assign</span>
                              <ChevronDown className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                      {caddyDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1 w-64 bg-card border border/60 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 z-10 py-1.5 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                          {flight.caddyId && onUnassignCaddy && (
                            <>
                              <button
                                onClick={() => {
                                  onUnassignCaddy()
                                  setCaddyDropdownOpen(false)
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              >
                                Remove Caddy
                              </button>
                              <div className="border-t border-border my-1" />
                            </>
                          )}
                          {availableCaddies.length > 0 ? (
                            availableCaddies.map((caddy) => (
                              <button
                                key={caddy.id}
                                onClick={() => {
                                  onAssignCaddy?.(caddy.id)
                                  setCaddyDropdownOpen(false)
                                }}
                                className={cn(
                                  'w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center justify-between transition-colors',
                                  caddy.id === flight.caddyId && 'bg-emerald-50 dark:bg-emerald-500/20'
                                )}
                              >
                                <div>
                                  <span className="font-medium text-foreground">{caddy.name}</span>
                                  <span className="text-muted-foreground ml-2 text-xs capitalize">({caddy.skillLevel})</span>
                                </div>
                                {caddy.id === flight.caddyId && <Check className="h-4 w-4 text-emerald-600" />}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                              No caddies available
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {flight.notes && (
                <div className="relative overflow-hidden rounded-xl border border/60 bg-card/80 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent pointer-events-none" />

                  <div className="relative">
                    <button
                      onClick={() => setNotesExpanded(!notesExpanded)}
                      className="flex items-center justify-between w-full p-4 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-amber-200/50 shadow-inner">
                          <FileText className="h-4 w-4 text-amber-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Notes</h3>
                      </div>
                      {notesExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    {notesExpanded && (
                      <div className="px-4 pb-4">
                        <p className="text-sm text-muted-foreground p-3 bg-muted/80 rounded-lg border border-border">
                          {flight.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        {flight && flight.status !== 'available' && flight.status !== 'cancelled' && flight.status !== 'blocked' && (
          <div className="border-t border-border p-4 sm:p-5 bg-muted/50 flex gap-3">
            {getActionButtons(flight.status, {
              onCheckIn,
              onMarkOnCourse,
              onSettle,
              onMarkFinished,
              onCancelFlight,
              onViewReceipt,
              onOverridePenalty,
            })}
          </div>
        )}
      </div>
    </>
  )
}
