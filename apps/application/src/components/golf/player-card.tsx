'use client'

import { cn } from '@clubvantage/ui'
import { MoreVertical, User, X, Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { PlayerTypeBadge } from './player-type-badge'
import type { Player } from './types'

interface PlayerCardProps {
  player: Player
  position: 1 | 2 | 3 | 4
  onViewProfile?: () => void
  onRemove?: () => void
  onChangePosition?: () => void
}

export function PlayerCard({
  player,
  position,
  onViewProfile,
  onRemove,
  onChangePosition,
}: PlayerCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
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
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          {player.memberId && <span>ID: {player.memberId}</span>}
          {player.handicap !== undefined && <span>HCP: {player.handicap}</span>}
        </div>
      </div>

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
