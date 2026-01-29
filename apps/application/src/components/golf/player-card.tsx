'use client'

import { cn } from '@clubvantage/ui'
import { MoreVertical, User, X, Check, Car, Users, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { PlayerTypeBadge } from './player-type-badge'
import type { Player, RentalStatus } from './types'

const RENTAL_STATUS_OPTIONS: { value: RentalStatus; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'requested', label: 'Requested' },
  { value: 'paid', label: 'Paid' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'returned', label: 'Returned' },
]

function getRentalStatusColor(status: RentalStatus | undefined): string {
  switch (status) {
    case 'requested':
      return 'text-amber-600 bg-amber-50 dark:bg-amber-500/20 dark:text-amber-400'
    case 'paid':
      return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/20 dark:text-emerald-400'
    case 'assigned':
      return 'text-blue-600 bg-blue-50 dark:bg-blue-500/20 dark:text-blue-400'
    case 'returned':
      return 'text-purple-600 bg-purple-50 dark:bg-purple-500/20 dark:text-purple-400'
    default:
      return 'text-muted-foreground bg-muted'
  }
}

interface PlayerCardProps {
  player: Player
  position: 1 | 2 | 3 | 4
  onViewProfile?: () => void
  onRemove?: () => void
  onChangePosition?: () => void
  onCartStatusChange?: (status: RentalStatus) => void
  onCaddyStatusChange?: (status: RentalStatus) => void
  showRentalControls?: boolean
}

export function PlayerCard({
  player,
  position,
  onViewProfile,
  onRemove,
  onChangePosition,
  onCartStatusChange,
  onCaddyStatusChange,
  showRentalControls = false,
}: PlayerCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)
  const [caddyDropdownOpen, setCaddyDropdownOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const cartDropdownRef = useRef<HTMLDivElement>(null)
  const caddyDropdownRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target as Node)) {
        setCartDropdownOpen(false)
      }
      if (caddyDropdownRef.current && !caddyDropdownRef.current.contains(event.target as Node)) {
        setCaddyDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isMember = player.type === 'member' || player.type === 'dependent'

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 border rounded-lg hover:bg-muted transition-colors">
      {/* Position Indicator */}
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-card border-2 border-border flex items-center justify-center text-sm font-bold text-muted-foreground">
          {position}
        </div>
        {player.checkedIn && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
            <Check className="h-2.5 w-2.5 text-white" />
          </div>
        )}
        {player.noShow && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <X className="h-2.5 w-2.5 text-white" />
          </div>
        )}
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{player.name}</span>
          <PlayerTypeBadge type={player.type} />
          {/* Rental indicators (read-only view) */}
          {!showRentalControls && (player.cartStatus && player.cartStatus !== 'none' || player.caddyStatus && player.caddyStatus !== 'none') && (
            <div className="flex items-center gap-1 ml-1">
              {player.cartStatus && player.cartStatus !== 'none' && (
                <span
                  title={`Cart: ${player.cartStatus}${player.cartSharedWith ? ` (shared with P${player.cartSharedWith})` : ''}`}
                  className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', getRentalStatusColor(player.cartStatus))}
                >
                  <Car className="h-3 w-3 inline mr-0.5" />
                  {player.cartStatus.charAt(0).toUpperCase()}
                </span>
              )}
              {player.caddyStatus && player.caddyStatus !== 'none' && (
                <span
                  title={`Caddy: ${player.caddyStatus}`}
                  className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', getRentalStatusColor(player.caddyStatus))}
                >
                  <Users className="h-3 w-3 inline mr-0.5" />
                  {player.caddyStatus.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          {player.memberId && <span>ID: {player.memberId}</span>}
          {player.handicap !== undefined && <span>HCP: {player.handicap}</span>}
        </div>
      </div>

      {/* Rental Status Dropdowns */}
      {showRentalControls && (
        <div className="flex items-center gap-2">
          {/* Cart Status Dropdown */}
          <div className="relative" ref={cartDropdownRef}>
            <button
              onClick={() => {
                setCartDropdownOpen(!cartDropdownOpen)
                setCaddyDropdownOpen(false)
              }}
              className={cn(
                'flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all',
                getRentalStatusColor(player.cartStatus)
              )}
            >
              <Car className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{player.cartStatus ? player.cartStatus.charAt(0).toUpperCase() + player.cartStatus.slice(1) : 'None'}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {cartDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-32 bg-card border rounded-lg shadow-lg z-20 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                {RENTAL_STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onCartStatusChange?.(option.value)
                      setCartDropdownOpen(false)
                    }}
                    className={cn(
                      'w-full px-3 py-1.5 text-left text-xs hover:bg-muted flex items-center justify-between',
                      player.cartStatus === option.value && 'bg-muted'
                    )}
                  >
                    {option.label}
                    {player.cartStatus === option.value && <Check className="h-3 w-3 text-emerald-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Caddy Status Dropdown */}
          <div className="relative" ref={caddyDropdownRef}>
            <button
              onClick={() => {
                setCaddyDropdownOpen(!caddyDropdownOpen)
                setCartDropdownOpen(false)
              }}
              className={cn(
                'flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all',
                getRentalStatusColor(player.caddyStatus)
              )}
            >
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{player.caddyStatus ? player.caddyStatus.charAt(0).toUpperCase() + player.caddyStatus.slice(1) : 'None'}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {caddyDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-32 bg-card border rounded-lg shadow-lg z-20 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                {RENTAL_STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onCaddyStatusChange?.(option.value)
                      setCaddyDropdownOpen(false)
                    }}
                    className={cn(
                      'w-full px-3 py-1.5 text-left text-xs hover:bg-muted flex items-center justify-between',
                      player.caddyStatus === option.value && 'bg-muted'
                    )}
                  >
                    {option.label}
                    {player.caddyStatus === option.value && <Check className="h-3 w-3 text-emerald-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1.5 hover:bg-muted rounded transition-colors"
        >
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-card rounded-md shadow-lg border z-10">
            {isMember && onViewProfile && (
              <button
                onClick={() => {
                  onViewProfile()
                  setMenuOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                View Member Profile
              </button>
            )}
            {onChangePosition && (
              <button
                onClick={() => {
                  onChangePosition()
                  setMenuOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-muted/50"
              >
                Change Position
              </button>
            )}
            {onRemove && (
              <button
                onClick={() => {
                  onRemove()
                  setMenuOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-muted/50 text-red-600"
              >
                Remove Player
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
