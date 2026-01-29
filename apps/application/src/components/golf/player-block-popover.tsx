'use client'

import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@clubvantage/ui/primitives/popover'
import { Button } from '@clubvantage/ui/primitives/button'
import { Edit, User, Trash2, X } from 'lucide-react'
import { PlayerTypeBadge, type PlayerType } from './player-type-badge'
import { PlayerBlock, type PlayerBlockStatus, type PlayerBlockType } from './player-block'
import { cn } from '@clubvantage/ui'

interface PlayerInfo {
  id: string
  name: string
  type: PlayerType
  memberId?: string
}

interface PlayerBlockPopoverProps {
  player: PlayerInfo
  blockStatus: PlayerBlockStatus
  blockType: PlayerBlockType
  onEdit: () => void
  onViewMember?: () => void
  onRemove: () => void
  disabled?: boolean
  children?: React.ReactNode
}

export function PlayerBlockPopover({
  player,
  blockStatus,
  blockType,
  onEdit,
  onViewMember,
  onRemove,
  disabled = false,
  children,
}: PlayerBlockPopoverProps) {
  const [open, setOpen] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)

  const handleEdit = () => {
    setOpen(false)
    onEdit()
  }

  const handleViewMember = () => {
    setOpen(false)
    onViewMember?.()
  }

  const handleRemove = () => {
    if (showRemoveConfirm) {
      setOpen(false)
      setShowRemoveConfirm(false)
      onRemove()
    } else {
      setShowRemoveConfirm(true)
    }
  }

  const handleCancel = () => {
    setShowRemoveConfirm(false)
  }

  const canViewMember = player.type === 'member' || player.type === 'dependent'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        {children || (
          <div>
            <PlayerBlock
              status={blockStatus}
              playerType={blockType}
              onClick={() => setOpen(true)}
            />
          </div>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-0"
        align="start"
        sideOffset={4}
      >
        {showRemoveConfirm ? (
          <div className="p-3">
            <p className="text-sm text-stone-600 mb-3">
              Remove <span className="font-medium text-stone-900">{player.name}</span> from this booking?
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="flex-1"
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between p-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <PlayerTypeBadge type={player.type} size="sm" />
                <div>
                  <p className="font-medium text-stone-900 text-sm">{player.name}</p>
                  {player.memberId && (
                    <p className="text-xs text-stone-500">{player.memberId}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-stone-100 rounded transition-colors"
              >
                <X className="h-4 w-4 text-stone-400" />
              </button>
            </div>

            {/* Actions */}
            <div className="p-2 space-y-1">
              <button
                onClick={handleEdit}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left',
                  'hover:bg-stone-100 transition-colors'
                )}
              >
                <Edit className="h-4 w-4 text-stone-500" />
                <span>Edit Booking</span>
              </button>

              {canViewMember && onViewMember && (
                <button
                  onClick={handleViewMember}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left',
                    'hover:bg-stone-100 transition-colors'
                  )}
                >
                  <User className="h-4 w-4 text-stone-500" />
                  <span>View Member</span>
                </button>
              )}

              <button
                onClick={handleRemove}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left',
                  'hover:bg-red-50 text-red-600 transition-colors'
                )}
              >
                <Trash2 className="h-4 w-4" />
                <span>Remove from Booking</span>
              </button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

// Wrapper component that combines PlayerBlock with Popover for booked slots
interface BookedPlayerBlockProps {
  position: number
  player: PlayerInfo
  onEdit: () => void
  onViewMember?: () => void
  onRemove: () => void
  isHighlighted?: boolean
  disabled?: boolean
}

export function BookedPlayerBlock({
  position,
  player,
  onEdit,
  onViewMember,
  onRemove,
  isHighlighted = false,
  disabled = false,
}: BookedPlayerBlockProps) {
  // Map PlayerType to PlayerBlockType
  const blockType: PlayerBlockType =
    player.type === 'member' ? 'M' :
    player.type === 'guest' ? 'G' :
    player.type === 'dependent' ? 'D' : 'W'

  return (
    <PlayerBlockPopover
      player={player}
      blockStatus="booked"
      blockType={blockType}
      onEdit={onEdit}
      onViewMember={onViewMember}
      onRemove={onRemove}
      disabled={disabled}
    >
      <PlayerBlock
        status="booked"
        playerType={blockType}
        isHighlighted={isHighlighted}
        asDiv
      />
    </PlayerBlockPopover>
  )
}
