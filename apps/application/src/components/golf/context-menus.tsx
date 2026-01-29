'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { cn } from '@clubvantage/ui'
import {
  Check,
  Scissors,
  ClipboardCopy,
  Pencil,
  Bell,
  X,
  Plus,
  Lock,
  Clipboard,
} from 'lucide-react'
import type { BookingStatus } from './types'

// Action types
export type BookingAction = 'check_in' | 'move' | 'copy' | 'edit' | 'resend_confirm' | 'cancel'
export type SlotAction = 'new_booking' | 'add_block' | 'paste'

// Menu item definition
interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  action?: BookingAction | SlotAction
  isDivider?: boolean
  isDestructive?: boolean
  hidden?: boolean
}

// Props interfaces
export interface BookingContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  bookingStatus: BookingStatus
  onClose: () => void
  onAction: (action: BookingAction) => void
}

export interface SlotContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  hasClipboard: boolean
  onClose: () => void
  onAction: (action: SlotAction) => void
}

// Calculate position to stay within viewport
function useMenuPosition(
  isOpen: boolean,
  position: { x: number; y: number },
  menuRef: React.RefObject<HTMLDivElement | null>
) {
  const [adjustedPosition, setAdjustedPosition] = useState(position)

  useEffect(() => {
    if (!isOpen || !menuRef.current) {
      setAdjustedPosition(position)
      return
    }

    const menu = menuRef.current
    const rect = menu.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let x = position.x
    let y = position.y

    // Adjust horizontal position if menu would overflow right edge
    if (x + rect.width > viewportWidth - 8) {
      x = viewportWidth - rect.width - 8
    }

    // Adjust vertical position if menu would overflow bottom edge
    if (y + rect.height > viewportHeight - 8) {
      y = viewportHeight - rect.height - 8
    }

    // Ensure menu doesn't go off left or top edge
    x = Math.max(8, x)
    y = Math.max(8, y)

    setAdjustedPosition({ x, y })
  }, [isOpen, position, menuRef])

  return adjustedPosition
}

// Base context menu component
interface BaseContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  items: MenuItem[]
  onClose: () => void
  onSelect: (action: string) => void
}

function BaseContextMenu({
  isOpen,
  position,
  items,
  onClose,
  onSelect,
}: BaseContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const adjustedPosition = useMenuPosition(isOpen, position, menuRef)

  // Filter out hidden items for focus navigation
  const visibleItems = items.filter((item) => !item.hidden && !item.isDivider)

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    // Use setTimeout to avoid closing immediately from the same click that opened the menu
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          onClose()
          break
        case 'ArrowDown':
          event.preventDefault()
          setFocusedIndex((prev) => {
            const next = prev + 1
            return next >= visibleItems.length ? 0 : next
          })
          break
        case 'ArrowUp':
          event.preventDefault()
          setFocusedIndex((prev) => {
            const next = prev - 1
            return next < 0 ? visibleItems.length - 1 : next
          })
          break
        case 'Enter':
          event.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < visibleItems.length) {
            const item = visibleItems[focusedIndex]
            if (item && item.action) {
              onSelect(item.action)
            }
          }
          break
      }
    },
    [isOpen, onClose, focusedIndex, visibleItems, onSelect]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Reset focus index when menu opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1)
    }
  }, [isOpen])

  if (!isOpen) return null

  // Track visible item index for focus
  let visibleIndex = -1

  return (
    <div
      ref={menuRef}
      className={cn(
        'fixed z-50 min-w-[180px] bg-white border border-stone-200 rounded-xl shadow-xl',
        'py-1 animate-in fade-in-0 zoom-in-95 duration-100'
      )}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
      role="menu"
      aria-orientation="vertical"
    >
      {items.map((item) => {
        if (item.hidden) return null

        if (item.isDivider) {
          return (
            <div
              key={item.id}
              className="border-t border-stone-200 my-1"
              role="separator"
            />
          )
        }

        visibleIndex++
        const currentIndex = visibleIndex
        const isFocused = focusedIndex === currentIndex

        return (
          <button
            key={item.id}
            className={cn(
              'w-full flex items-center py-2 px-3 text-sm text-left transition-colors',
              'focus:outline-none',
              item.isDestructive
                ? 'text-red-600 hover:bg-red-50'
                : 'text-stone-700 hover:bg-stone-100',
              isFocused && (item.isDestructive ? 'bg-red-50' : 'bg-stone-100')
            )}
            role="menuitem"
            onClick={() => item.action && onSelect(item.action)}
            onMouseEnter={() => setFocusedIndex(currentIndex)}
          >
            <span
              className={cn(
                'mr-2',
                item.isDestructive ? 'text-red-500' : 'text-stone-500'
              )}
            >
              {item.icon}
            </span>
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

// Booking Context Menu
export function BookingContextMenu({
  isOpen,
  position,
  bookingStatus,
  onClose,
  onAction,
}: BookingContextMenuProps) {
  // Determine if check-in should be shown based on booking status
  const canCheckIn = bookingStatus === 'booked'

  const items: MenuItem[] = [
    {
      id: 'check_in',
      label: 'Check In',
      icon: <Check className="h-4 w-4" />,
      action: 'check_in',
      hidden: !canCheckIn,
    },
    {
      id: 'divider_1',
      label: '',
      icon: null,
      isDivider: true,
      hidden: !canCheckIn,
    },
    {
      id: 'move',
      label: 'Move',
      icon: <Scissors className="h-4 w-4" />,
      action: 'move',
    },
    {
      id: 'copy',
      label: 'Copy',
      icon: <ClipboardCopy className="h-4 w-4" />,
      action: 'copy',
    },
    {
      id: 'divider_2',
      label: '',
      icon: null,
      isDivider: true,
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Pencil className="h-4 w-4" />,
      action: 'edit',
    },
    {
      id: 'resend_confirm',
      label: 'Resend Confirm',
      icon: <Bell className="h-4 w-4" />,
      action: 'resend_confirm',
    },
    {
      id: 'divider_3',
      label: '',
      icon: null,
      isDivider: true,
    },
    {
      id: 'cancel',
      label: 'Cancel',
      icon: <X className="h-4 w-4" />,
      action: 'cancel',
      isDestructive: true,
    },
  ]

  const handleSelect = (action: string) => {
    onAction(action as BookingAction)
    onClose()
  }

  return (
    <BaseContextMenu
      isOpen={isOpen}
      position={position}
      items={items}
      onClose={onClose}
      onSelect={handleSelect}
    />
  )
}

// Slot Context Menu
export function SlotContextMenu({
  isOpen,
  position,
  hasClipboard,
  onClose,
  onAction,
}: SlotContextMenuProps) {
  const items: MenuItem[] = [
    {
      id: 'new_booking',
      label: 'New Booking',
      icon: <Plus className="h-4 w-4" />,
      action: 'new_booking',
    },
    {
      id: 'add_block',
      label: 'Add Block',
      icon: <Lock className="h-4 w-4" />,
      action: 'add_block',
    },
    {
      id: 'divider_1',
      label: '',
      icon: null,
      isDivider: true,
      hidden: !hasClipboard,
    },
    {
      id: 'paste',
      label: 'Paste',
      icon: <Clipboard className="h-4 w-4" />,
      action: 'paste',
      hidden: !hasClipboard,
    },
  ]

  const handleSelect = (action: string) => {
    onAction(action as SlotAction)
    onClose()
  }

  return (
    <BaseContextMenu
      isOpen={isOpen}
      position={position}
      items={items}
      onClose={onClose}
      onSelect={handleSelect}
    />
  )
}
