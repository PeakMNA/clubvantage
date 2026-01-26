'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@clubvantage/ui'
import {
  Car,
  Users,
  AlertTriangle,
  MoreHorizontal,
  UserCheck,
  UserX,
  Mail,
  Edit,
  ArrowRightLeft,
  Trash2,
  Plus,
  Link2
} from 'lucide-react'
import { FlightStatusBadge, type FlightStatus } from './flight-status-badge'
import { PlayerTypeBadge } from './player-type-badge'
import type { Flight, Player } from './types'

interface TeeSheetRowProps {
  flight: Flight
  onRowClick?: (flight: Flight) => void
  onBookSlot?: (flight: Flight, position: number) => void
  onPlayerClick?: (flight: Flight, groupId?: 1 | 2) => void
  onCheckIn?: (flight: Flight) => void
  onNoShow?: (flight: Flight) => void
  onResendConfirmation?: (flight: Flight) => void
  onEditFlight?: (flight: Flight) => void
  onMoveFlight?: (flight: Flight) => void
  onCancelFlight?: (flight: Flight) => void
}

interface PlayerCellProps {
  player: Player | null
  position: number
  onBookClick?: () => void
  onPlayerClick?: (groupId?: 1 | 2) => void
  isBlocked?: boolean
  groupId?: 1 | 2
}

function getGroupIndicatorColor(groupId: 1 | 2): string {
  return groupId === 1 ? 'bg-blue-500' : 'bg-purple-500'
}

function PlayerCell({ player, position, onBookClick, onPlayerClick, isBlocked, groupId }: PlayerCellProps) {
  if (isBlocked) {
    return (
      <div className="flex items-center justify-center text-muted-foreground text-sm">
        Blocked
      </div>
    )
  }

  if (!player) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation()
          onBookClick?.()
        }}
        className="flex items-center justify-center w-full h-full text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors group"
      >
        <span className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-dashed border-emerald-300 group-hover:border-emerald-400 transition-colors">
            <Plus className="h-3 w-3" />
          </span>
          Book
        </span>
      </button>
    )
  }

  const effectiveGroupId = groupId ?? player.groupId

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onPlayerClick?.(effectiveGroupId)
      }}
      className="relative flex flex-col py-1 w-full text-left hover:bg-muted/50 rounded transition-colors"
    >
      {/* Group indicator bar */}
      {effectiveGroupId && (
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-1 rounded-sm',
            getGroupIndicatorColor(effectiveGroupId)
          )}
        />
      )}
      <div className={cn(effectiveGroupId && 'pl-2')}>
        <span className="font-medium text-sm text-foreground truncate max-w-[120px] block">
          {player.name}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <PlayerTypeBadge type={player.type} />
          {player.handicap !== undefined && (
            <span className="text-xs text-muted-foreground">({player.handicap})</span>
          )}
        </div>
      </div>
    </button>
  )
}

interface RowActionsMenuProps {
  flight: Flight
  onCheckIn?: () => void
  onNoShow?: () => void
  onResendConfirmation?: () => void
  onEditFlight?: () => void
  onMoveFlight?: () => void
  onCancelFlight?: () => void
  onAddPlayer?: () => void
}

function RowActionsMenu({
  flight,
  onCheckIn,
  onNoShow,
  onResendConfirmation,
  onEditFlight,
  onMoveFlight,
  onCancelFlight,
  onAddPlayer
}: RowActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const hasPlayers = flight.players.some(Boolean)
  const isBlocked = flight.status === 'blocked'
  const isCheckedIn = flight.status === 'checked-in'
  const isNoShow = flight.status === 'no-show'
  const hasEmptySlot = flight.players.some(p => p === null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (isBlocked) return null

  const menuItems = [
    // Add Player - only if there's an empty slot
    hasEmptySlot && {
      label: 'Add Player',
      icon: Plus,
      onClick: onAddPlayer,
      show: true
    },
    // Check-in - only for booked flights that aren't already checked in
    {
      label: 'Check In',
      icon: UserCheck,
      onClick: onCheckIn,
      show: hasPlayers && !isCheckedIn && !isNoShow,
      className: 'text-emerald-600 hover:bg-emerald-50'
    },
    // No-show - only for booked flights that haven't checked in
    {
      label: 'Mark No-Show',
      icon: UserX,
      onClick: onNoShow,
      show: hasPlayers && !isCheckedIn && !isNoShow,
      className: 'text-red-600 hover:bg-red-50'
    },
    // Separator
    hasPlayers && { separator: true },
    // Edit
    {
      label: 'Edit Booking',
      icon: Edit,
      onClick: onEditFlight,
      show: hasPlayers
    },
    // Move
    {
      label: 'Move Tee Time',
      icon: ArrowRightLeft,
      onClick: onMoveFlight,
      show: hasPlayers
    },
    // Resend confirmation
    {
      label: 'Resend Confirmation',
      icon: Mail,
      onClick: onResendConfirmation,
      show: hasPlayers
    },
    // Separator
    hasPlayers && { separator: true },
    // Cancel
    {
      label: 'Cancel Booking',
      icon: Trash2,
      onClick: onCancelFlight,
      show: hasPlayers,
      className: 'text-red-600 hover:bg-red-50'
    }
  ].filter(Boolean) as Array<{
    label?: string
    icon?: typeof UserCheck
    onClick?: () => void
    show?: boolean
    className?: string
    separator?: boolean
  }>

  const visibleItems = menuItems.filter(item => item.separator || item.show)

  if (visibleItems.length === 0) return null

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className={cn(
          'p-1.5 rounded-lg transition-all duration-200',
          isOpen
            ? 'bg-muted text-foreground'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        )}
        aria-label="Row actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-card rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border/60 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          {visibleItems.map((item, index) => {
            if (item.separator) {
              return <div key={index} className="border-t border-border my-1" />
            }

            const Icon = item.icon!
            return (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  item.onClick?.()
                  setIsOpen(false)
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
                  item.className || 'text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function TeeSheetRow({
  flight,
  onRowClick,
  onBookSlot,
  onPlayerClick,
  onCheckIn,
  onNoShow,
  onResendConfirmation,
  onEditFlight,
  onMoveFlight,
  onCancelFlight
}: TeeSheetRowProps) {
  const isBlocked = flight.status === 'blocked'
  const isNoShow = flight.status === 'no-show'
  const filledSlots = flight.players.filter(Boolean).length
  const isPartial = filledSlots > 0 && filledSlots < 4 && !isBlocked
  const hasLinkedSlot = !!flight.linkedSlot
  const is18HoleBooking = hasLinkedSlot

  // Find first empty slot for quick add
  const firstEmptySlot = flight.players.findIndex(p => p === null)

  return (
    <tr
      onClick={() => !isBlocked && onRowClick?.(flight)}
      className={cn(
        'transition-all duration-200',
        isBlocked && 'bg-muted/80 cursor-not-allowed',
        isNoShow && 'bg-red-50/50',
        !isBlocked && 'hover:bg-muted/80 cursor-pointer',
        isPartial && !is18HoleBooking && 'border-l-4 border-l-amber-400',
        is18HoleBooking && 'border-l-4 border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/5'
      )}
    >
      {/* Time Column */}
      <td className="px-4 py-3 font-bold text-sm text-foreground whitespace-nowrap w-20 tracking-tight">
        {flight.time}
      </td>

      {/* Player Columns */}
      {([0, 1, 2, 3] as const).map((position) => (
        <td key={position} className="px-3 py-2 min-w-[140px]">
          <PlayerCell
            player={flight.players[position] ?? null}
            position={position}
            onBookClick={() => onBookSlot?.(flight, position)}
            onPlayerClick={(groupId) => onPlayerClick?.(flight, groupId)}
            isBlocked={isBlocked}
          />
        </td>
      ))}

      {/* Status Column */}
      <td className="px-4 py-3 w-28">
        <div className="flex items-center gap-2">
          <FlightStatusBadge status={flight.status} />
          {isPartial && (
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/20 px-1.5 py-0.5 rounded">
              {filledSlots}/4
            </span>
          )}
        </div>
      </td>

      {/* Resources Column */}
      <td className="px-4 py-3 w-20">
        <div className="flex items-center gap-2.5 text-muted-foreground">
          {/* 18-Hole Link Indicator */}
          {is18HoleBooking && flight.linkedSlot && (
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20"
              title={`18-hole booking - ${flight.nineHole === 'front9' ? 'Front 9' : 'Back 9'} start, linked to ${flight.linkedSlot.projectedTime}`}
            >
              <Link2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">18</span>
            </div>
          )}
          {flight.carts && flight.carts > 0 && (
            <div className="flex items-center gap-1" title={`${flight.carts} cart(s) assigned`}>
              <Car className="h-4 w-4" />
              <span className="text-xs font-medium">{flight.carts}</span>
            </div>
          )}
          {flight.caddies && flight.caddies > 0 && (
            <div className="flex items-center gap-1" title={`${flight.caddies} caddy/caddies assigned`}>
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">{flight.caddies}</span>
            </div>
          )}
          {isBlocked && flight.blockedReason && (
            <div title={flight.blockedReason}>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
          )}
        </div>
      </td>

      {/* Actions Column */}
      <td className="px-2 py-3 w-12" onClick={(e) => e.stopPropagation()}>
        <RowActionsMenu
          flight={flight}
          onCheckIn={() => onCheckIn?.(flight)}
          onNoShow={() => onNoShow?.(flight)}
          onResendConfirmation={() => onResendConfirmation?.(flight)}
          onEditFlight={() => onEditFlight?.(flight)}
          onMoveFlight={() => onMoveFlight?.(flight)}
          onCancelFlight={() => onCancelFlight?.(flight)}
          onAddPlayer={() => firstEmptySlot !== -1 && onBookSlot?.(flight, firstEmptySlot)}
        />
      </td>
    </tr>
  )
}
