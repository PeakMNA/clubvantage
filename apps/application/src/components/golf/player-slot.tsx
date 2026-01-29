'use client'

import { useState } from 'react'
import { cn } from '@clubvantage/ui'
import { X, Plus, User, Users, Car, ShoppingBag, ChevronDown } from 'lucide-react'
import { PlayerTypeBadge, type PlayerType } from './player-type-badge'
import { CaddyPicker, type CaddyPickerCaddy } from './caddy-picker'
import type { Cart } from './types'

type CaddyValue = 'NONE' | 'REQUEST' | string
type CartValue = 'NONE' | 'REQUEST'
type RentalValue = 'NONE' | 'REQUEST'

interface Player {
  id: string
  name: string
  type: PlayerType
  memberId?: string
}

interface PlayerSlotProps {
  position: number // 1-4
  player: Player | null

  // Per-player options
  caddyValue: CaddyValue
  cartValue: CartValue
  rentalValue: RentalValue

  // Callbacks
  onCaddyChange: (value: CaddyValue) => void
  onCartChange: (value: CartValue) => void
  onRentalChange: (value: RentalValue) => void
  onAddPlayer: () => void
  onRemovePlayer: () => void

  // Data
  availableCaddies: CaddyPickerCaddy[]

  // Cart assignment (NEW)
  availableCarts?: Cart[]
  assignedCartId?: string | null
  onCartAssign?: (cartId: string | null) => void

  // Club policy
  cartPolicy: 'OPTIONAL' | 'REQUIRED'
  rentalPolicy: 'OPTIONAL' | 'REQUIRED'

  // State
  state: 'filled' | 'empty' | 'available'
  disabled?: boolean
  isHighlighted?: boolean
  className?: string
}

function formatCaddyDisplay(value: CaddyValue, caddies: CaddyPickerCaddy[]): string | null {
  if (value === 'NONE') return null
  if (value === 'REQUEST') return 'Requested'
  const caddy = caddies.find((c) => c.id === value)
  if (caddy) {
    return `#${caddy.caddyNumber} ${caddy.firstName}`
  }
  return null
}

// Unified option button component
function OptionButton({
  icon: Icon,
  label,
  value,
  activeValue,
  onClick,
  disabled,
  colorScheme,
}: {
  icon: React.ElementType
  label: string
  value: string
  activeValue: string
  onClick: () => void
  disabled?: boolean
  colorScheme: 'blue' | 'emerald' | 'amber'
}) {
  const isActive = value === activeValue
  const colors = {
    blue: {
      active: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-700',
      inactive: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700',
      icon: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
    },
    emerald: {
      active: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-700',
      inactive: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700',
      icon: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    },
    amber: {
      active: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-700',
      inactive: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700',
      icon: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
    },
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
        isActive ? colors[colorScheme].active : colors[colorScheme].inactive,
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className={cn('flex h-6 w-6 items-center justify-center rounded-md', colors[colorScheme].icon)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span>{label}</span>
    </button>
  )
}

// Cart assignment dropdown (appears when cart is requested)
function CartAssignmentDropdown({
  availableCarts,
  assignedCartId,
  onAssign,
  disabled,
}: {
  availableCarts: Cart[]
  assignedCartId: string | null
  onAssign: (cartId: string | null) => void
  disabled?: boolean
}) {
  return (
    <div className="relative">
      <select
        value={assignedCartId || ''}
        onChange={(e) => onAssign(e.target.value || null)}
        disabled={disabled}
        className={cn(
          'h-9 pl-3 pr-8 rounded-lg border text-sm font-medium appearance-none cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          assignedCartId
            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
            : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-label="Assign cart"
      >
        <option value="" className="dark:bg-stone-800">Not assigned</option>
        {availableCarts.length === 0 ? (
          <option disabled className="dark:bg-stone-800">No carts available</option>
        ) : (
          availableCarts.map((cart) => (
            <option key={cart.id} value={cart.id} className="dark:bg-stone-800">
              Cart #{cart.number} ({cart.type})
            </option>
          ))
        )}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500 pointer-events-none" />
    </div>
  )
}

// Cart selector with dropdown
function CartSelector({
  value,
  onChange,
  policy,
  disabled,
  availableCarts,
  assignedCartId,
  onCartAssign,
}: {
  value: CartValue
  onChange: (value: CartValue) => void
  policy: 'OPTIONAL' | 'REQUIRED'
  disabled?: boolean
  availableCarts?: Cart[]
  assignedCartId?: string | null
  onCartAssign?: (cartId: string | null) => void
}) {
  const isRequired = policy === 'REQUIRED'
  const isActive = value === 'REQUEST' || isRequired
  const showAssignment = isActive && availableCarts && onCartAssign

  if (isRequired) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 ring-1 ring-blue-200">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100">
            <Car className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span>Cart Required</span>
        </div>
        {showAssignment && (
          <CartAssignmentDropdown
            availableCarts={availableCarts}
            assignedCartId={assignedCartId ?? null}
            onAssign={onCartAssign}
            disabled={disabled}
          />
        )}
      </div>
    )
  }

  const handleToggle = () => {
    if (value === 'REQUEST') {
      // Turning cart OFF - also clear assignment
      onChange('NONE')
      if (onCartAssign) {
        onCartAssign(null)
      }
    } else {
      onChange('REQUEST')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
          isActive
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-700'
            : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-700 dark:hover:text-stone-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className={cn(
          'flex h-6 w-6 items-center justify-center rounded-md transition-colors',
          isActive ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-stone-200 dark:bg-stone-700'
        )}>
          <Car className={cn('h-3.5 w-3.5', isActive ? 'text-blue-600 dark:text-blue-400' : 'text-stone-500 dark:text-stone-400')} />
        </div>
        <span>{isActive ? 'Cart' : 'Walking'}</span>
      </button>
      {showAssignment && (
        <CartAssignmentDropdown
          availableCarts={availableCarts}
          assignedCartId={assignedCartId ?? null}
          onAssign={onCartAssign}
          disabled={disabled}
        />
      )}
    </div>
  )
}

// Rental selector
function RentalSelector({
  value,
  onChange,
  policy,
  disabled,
}: {
  value: RentalValue
  onChange: (value: RentalValue) => void
  policy: 'OPTIONAL' | 'REQUIRED'
  disabled?: boolean
}) {
  const isRequired = policy === 'REQUIRED'
  const isActive = value === 'REQUEST' || isRequired

  if (isRequired) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 ring-1 ring-amber-200">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100">
          <ShoppingBag className="h-3.5 w-3.5 text-amber-600" />
        </div>
        <span>Rental Required</span>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onChange(value === 'REQUEST' ? 'NONE' : 'REQUEST')}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
        isActive
          ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-700'
          : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-700 dark:hover:text-stone-200',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className={cn(
        'flex h-6 w-6 items-center justify-center rounded-md transition-colors',
        isActive ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-stone-200 dark:bg-stone-700'
      )}>
        <ShoppingBag className={cn('h-3.5 w-3.5', isActive ? 'text-amber-600 dark:text-amber-400' : 'text-stone-500 dark:text-stone-400')} />
      </div>
      <span>{isActive ? 'Rental' : 'No Rental'}</span>
    </button>
  )
}

// Caddy selector with inline picker
function CaddySelector({
  value,
  onChange,
  availableCaddies,
  disabled,
}: {
  value: CaddyValue
  onChange: (value: CaddyValue) => void
  availableCaddies: CaddyPickerCaddy[]
  disabled?: boolean
}) {
  const isActive = value !== 'NONE'
  const displayText = formatCaddyDisplay(value, availableCaddies) || 'No Caddy'

  return (
    <CaddyPicker
      value={value}
      onChange={onChange}
      availableCaddies={availableCaddies}
      disabled={disabled}
      className="flex-1"
      triggerClassName={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all w-full justify-start',
        isActive
          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-700'
          : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-700 dark:hover:text-stone-200',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    />
  )
}

export function PlayerSlot({
  position,
  player,
  caddyValue,
  cartValue,
  rentalValue,
  onCaddyChange,
  onCartChange,
  onRentalChange,
  onAddPlayer,
  onRemovePlayer,
  availableCaddies,
  availableCarts,
  assignedCartId,
  onCartAssign,
  cartPolicy,
  rentalPolicy,
  state,
  disabled = false,
  isHighlighted = false,
  className,
}: PlayerSlotProps) {
  // Available state (grayed out, not in booking)
  if (state === 'available') {
    return (
      <div
        className={cn(
          'rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 p-4',
          isHighlighted && 'ring-2 ring-amber-400 ring-offset-2',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800 text-sm font-semibold text-stone-400 dark:text-stone-500">
            {position}
          </div>
          <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500">
            <User className="h-4 w-4" />
            <span className="text-sm">Available</span>
          </div>
        </div>
      </div>
    )
  }

  // Empty state (in booking, can add player)
  if (state === 'empty') {
    return (
      <div
        className={cn(
          'group rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800/50 p-4 transition-all',
          'hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20',
          disabled && 'opacity-50 pointer-events-none',
          isHighlighted && 'ring-2 ring-amber-400 ring-offset-2 border-amber-400 bg-amber-50/30 dark:bg-amber-900/20',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-700 text-sm font-semibold text-stone-500 dark:text-stone-400 transition-colors group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
            {position}
          </div>
          <button
            type="button"
            onClick={onAddPlayer}
            disabled={disabled}
            className="flex flex-1 items-center gap-2 text-stone-500 dark:text-stone-400 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Add Player</span>
          </button>
        </div>
      </div>
    )
  }

  // Filled state - card with two rows
  return (
    <div
      className={cn(
        'group rounded-xl border bg-gradient-to-b from-white to-stone-50/50 dark:from-stone-800 dark:to-stone-800/50 p-4 transition-all',
        'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 hover:shadow-sm',
        disabled && 'opacity-50',
        isHighlighted && 'ring-2 ring-amber-400 ring-offset-2',
        className
      )}
    >
      {/* Player Header Row */}
      <div className="flex items-center gap-3">
        {/* Position Number */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-700 text-sm font-semibold text-stone-600 dark:text-stone-300">
          {position}
        </div>

        {/* Name & Badge */}
        <div className="flex flex-1 items-center gap-2.5 min-w-0">
          <span className="font-medium text-stone-900 dark:text-stone-100 truncate">{player?.name}</span>
          {player && <PlayerTypeBadge type={player.type} size="sm" />}
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={onRemovePlayer}
          disabled={disabled}
          className="rounded-md p-1.5 text-stone-400 dark:text-stone-500 opacity-0 transition-all hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 group-hover:opacity-100"
          aria-label={`Remove ${player?.name}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Options Row */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-stone-100 dark:border-stone-700 pt-3">
        {/* Caddy */}
        <CaddySelector
          value={caddyValue}
          onChange={onCaddyChange}
          availableCaddies={availableCaddies}
          disabled={disabled}
        />

        {/* Cart */}
        <CartSelector
          value={cartValue}
          onChange={onCartChange}
          policy={cartPolicy}
          disabled={disabled}
          availableCarts={availableCarts}
          assignedCartId={assignedCartId}
          onCartAssign={onCartAssign}
        />

        {/* Rental */}
        <RentalSelector
          value={rentalValue}
          onChange={onRentalChange}
          policy={rentalPolicy}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

export type {
  PlayerSlotProps,
  Player as PlayerSlotPlayer,
  CaddyValue,
  CartValue,
  RentalValue,
}
