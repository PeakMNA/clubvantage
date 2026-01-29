'use client'

import { cn } from '@clubvantage/ui'

export type PlayerBlockStatus = 'available' | 'booked' | 'blocked'
export type PlayerBlockType = 'M' | 'G' | 'D' | 'W'

interface PlayerBlockProps {
  status: PlayerBlockStatus
  playerType?: PlayerBlockType
  onClick?: () => void
  isHighlighted?: boolean
  disabled?: boolean
  className?: string
  /** Render as div instead of button (use when wrapped by PopoverTrigger) */
  asDiv?: boolean
}

const statusStyles: Record<PlayerBlockStatus, string> = {
  available: 'bg-stone-100 hover:bg-stone-200 border-stone-200',
  booked: 'border-transparent',
  blocked: 'bg-gray-200 cursor-not-allowed',
}

const playerTypeStyles: Record<PlayerBlockType, string> = {
  M: 'bg-blue-500',
  G: 'bg-amber-500',
  D: 'bg-teal-500',
  W: 'bg-stone-400',
}

const playerTypeLabels: Record<PlayerBlockType, string> = {
  M: 'Member',
  G: 'Guest',
  D: 'Dependent',
  W: 'Walk-up',
}

export function PlayerBlock({
  status,
  playerType,
  onClick,
  isHighlighted = false,
  disabled = false,
  className,
  asDiv = false,
}: PlayerBlockProps) {
  const isClickable = status !== 'blocked' && !disabled && onClick

  const sharedProps = {
    title: status === 'booked' && playerType
      ? playerTypeLabels[playerType]
      : status === 'available'
        ? 'Available - Click to book'
        : 'Blocked',
    className: cn(
      'w-5 h-5 rounded-sm border text-[9px] font-semibold flex items-center justify-center',
      'transition-all duration-150',
      statusStyles[status],
      status === 'booked' && playerType && playerTypeStyles[playerType],
      status === 'booked' && 'text-white',
      status === 'blocked' && 'bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.05)_2px,rgba(0,0,0,0.05)_4px)]',
      isClickable && 'cursor-pointer',
      isHighlighted && 'ring-2 ring-amber-400 ring-offset-1',
      className
    ),
  }

  const content = status === 'booked' && playerType && playerType

  // Render as div when used inside a PopoverTrigger (to avoid button nesting)
  if (asDiv) {
    return (
      <div {...sharedProps}>
        {content}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={status === 'blocked' || disabled}
      {...sharedProps}
    >
      {content}
    </button>
  )
}

// Compact version for tight spaces
export function PlayerBlockCompact({
  status,
  playerType,
  onClick,
  isHighlighted = false,
  disabled = false,
  className,
}: PlayerBlockProps) {
  const isClickable = status !== 'blocked' && !disabled && onClick

  return (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={status === 'blocked' || disabled}
      title={
        status === 'booked' && playerType
          ? playerTypeLabels[playerType]
          : status === 'available'
            ? 'Available'
            : 'Blocked'
      }
      className={cn(
        'w-4 h-4 rounded-[2px] border text-[8px] font-bold flex items-center justify-center',
        'transition-all duration-100',
        statusStyles[status],
        status === 'booked' && playerType && playerTypeStyles[playerType],
        status === 'booked' && 'text-white',
        status === 'blocked' && 'bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.05)_2px,rgba(0,0,0,0.05)_4px)]',
        isClickable && 'cursor-pointer hover:scale-110',
        isHighlighted && 'ring-2 ring-amber-400 ring-offset-1',
        className
      )}
    >
      {status === 'booked' && playerType && playerType}
    </button>
  )
}

// Group of 4 player blocks for a flight
interface PlayerBlockGroupProps {
  positions: Array<{
    status: PlayerBlockStatus
    playerType?: PlayerBlockType
  }>
  onPositionClick?: (position: number) => void
  highlightedPosition?: number
  disabled?: boolean
  compact?: boolean
  className?: string
}

export function PlayerBlockGroup({
  positions,
  onPositionClick,
  highlightedPosition,
  disabled = false,
  compact = false,
  className,
}: PlayerBlockGroupProps) {
  const BlockComponent = compact ? PlayerBlockCompact : PlayerBlock

  // Ensure we always have 4 positions
  const normalizedPositions = Array.from({ length: 4 }, (_, i) =>
    positions[i] || { status: 'available' as const }
  )

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {normalizedPositions.map((pos, index) => (
        <BlockComponent
          key={index}
          status={pos.status}
          playerType={pos.playerType}
          onClick={onPositionClick ? () => onPositionClick(index) : undefined}
          isHighlighted={highlightedPosition === index}
          disabled={disabled}
        />
      ))}
    </div>
  )
}
