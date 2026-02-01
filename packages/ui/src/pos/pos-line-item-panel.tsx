'use client'

import * as React from 'react'
import { cn } from '../lib/utils'
import { Minus, Plus, Trash2, ChevronDown, ChevronUp, ShoppingCart } from 'lucide-react'

export interface LineItemDiscount {
  name: string
  amount: number
}

export interface LineItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
  discounts?: LineItemDiscount[]
}

export interface POSLineItemPanelProps {
  items: LineItem[]
  onQuantityChange?: (itemId: string, quantity: number) => void
  onRemoveItem?: (itemId: string) => void
  onItemClick?: (itemId: string) => void
  allowEditing?: boolean
  className?: string
}

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

interface LineItemRowProps {
  item: LineItem
  allowEditing: boolean
  onQuantityChange?: (itemId: string, quantity: number) => void
  onRemoveItem?: (itemId: string) => void
  onItemClick?: (itemId: string) => void
}

function LineItemRow({
  item,
  allowEditing,
  onQuantityChange,
  onRemoveItem,
  onItemClick,
}: LineItemRowProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)

  const hasNotes = item.notes && item.notes.trim().length > 0
  const hasDiscounts = item.discounts && item.discounts.length > 0
  const showDeleteButton = allowEditing && (isHovered || isFocused)

  const handleQuantityDecrease = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (item.quantity > 1) {
      onQuantityChange?.(item.id, item.quantity - 1)
    }
  }

  const handleQuantityIncrease = (e: React.MouseEvent) => {
    e.stopPropagation()
    onQuantityChange?.(item.id, item.quantity + 1)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRemoveItem?.(item.id)
  }

  const handleItemClick = () => {
    onItemClick?.(item.id)
  }

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <div
      className={cn(
        'border-b border-stone-200 last:border-b-0 transition-colors',
        onItemClick && 'cursor-pointer hover:bg-stone-50'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onClick={handleItemClick}
      role={onItemClick ? 'button' : undefined}
      tabIndex={onItemClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onItemClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleItemClick()
        }
      }}
    >
      <div className="p-3">
        {/* First row: Item name and line total */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className="font-medium text-stone-900 text-sm">
              {item.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-600">
              {formatCurrency(item.unitPrice)}
            </span>
            {/* Delete button - appears on hover/focus */}
            {showDeleteButton && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 rounded hover:bg-red-100 text-stone-400 hover:text-red-500 transition-colors"
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Second row: Quantity controls and pricing */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {allowEditing ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleQuantityDecrease}
                  disabled={item.quantity <= 1}
                  className={cn(
                    'h-6 w-6 rounded flex items-center justify-center transition-colors',
                    'bg-stone-200 hover:bg-stone-300 text-stone-700',
                    item.quantity <= 1 && 'opacity-50 cursor-not-allowed'
                  )}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center text-sm font-medium text-stone-700">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={handleQuantityIncrease}
                  className="h-6 w-6 rounded flex items-center justify-center bg-stone-200 hover:bg-stone-300 text-stone-700 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <span className="text-sm text-stone-600">
                Qty: {item.quantity}
              </span>
            )}
            <span className="text-sm text-stone-500">
              x {formatCurrency(item.unitPrice)}
            </span>
          </div>
          <span className="font-medium text-stone-900 text-sm">
            {formatCurrency(item.totalPrice)}
          </span>
        </div>

        {/* Discounts */}
        {hasDiscounts && (
          <div className="mt-2 pl-4 space-y-1">
            {item.discounts!.map((discount, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-emerald-600 flex items-center gap-1">
                  <span className="text-stone-400">&#x2514;</span>
                  {discount.name}
                </span>
                <span className="text-emerald-600 font-medium">
                  -{formatCurrency(discount.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Expandable notes section */}
        {hasNotes && (
          <div className="mt-2">
            <button
              type="button"
              onClick={handleToggleExpand}
              className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 transition-colors"
              aria-expanded={isExpanded}
              aria-controls={`notes-${item.id}`}
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              Notes
            </button>
            {isExpanded && (
              <div
                id={`notes-${item.id}`}
                className="mt-1 pl-4 text-xs text-stone-500 bg-stone-50 rounded p-2"
              >
                {item.notes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function POSLineItemPanel({
  items,
  onQuantityChange,
  onRemoveItem,
  onItemClick,
  allowEditing = true,
  className,
}: POSLineItemPanelProps) {
  if (items.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
        <div className="mb-4 rounded-full bg-stone-100 p-3 text-stone-400">
          <ShoppingCart className="h-6 w-6" />
        </div>
        <p className="text-sm text-stone-500">
          No items yet. Scan or search to add items.
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn('flex-1 overflow-y-auto', className)}
      role="list"
      aria-label="Line items"
    >
      {items.map((item) => (
        <LineItemRow
          key={item.id}
          item={item}
          allowEditing={allowEditing}
          onQuantityChange={onQuantityChange}
          onRemoveItem={onRemoveItem}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  )
}
