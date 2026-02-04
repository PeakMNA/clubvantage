'use client'

import { useState } from 'react'
import { cn } from '@clubvantage/ui'
import { Trash2, ChevronDown, ChevronUp, Plus, ArrowRightLeft, Check } from 'lucide-react'
import type { BookingLineItemType, LineItemType, TaxType } from '@clubvantage/api-client'

export interface LineItemManagerProps {
  lineItems: BookingLineItemType[]
  onRemoveItem?: (lineItemId: string) => void
  onAddItem?: () => void
  onTransferItem?: (lineItemId: string) => void
  showAddButton?: boolean
  showTransferButton?: boolean
  isEditable?: boolean
  className?: string
}

const lineItemTypeLabels: Record<LineItemType, string> = {
  GREEN_FEE: 'Green Fee',
  CART: 'Cart',
  CADDY: 'Caddy',
  RENTAL: 'Rental',
  PROSHOP: 'Pro Shop',
}

const taxTypeLabels: Record<TaxType, string> = {
  ADD: '+tax',
  INCLUDE: 'incl.',
  NONE: '',
}

export function LineItemManager({
  lineItems,
  onRemoveItem,
  onAddItem,
  onTransferItem,
  showAddButton = false,
  showTransferButton = false,
  isEditable = false,
  className,
}: LineItemManagerProps) {
  const [expanded, setExpanded] = useState(false)

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.baseAmount, 0)
  const totalTax = lineItems.reduce((sum, item) => sum + item.taxAmount, 0)
  const grandTotal = lineItems.reduce((sum, item) => sum + item.totalAmount, 0)

  // Summary for collapsed view
  const itemSummary = lineItems
    .map((item) => `${lineItemTypeLabels[item.type]}: $${item.totalAmount.toFixed(2)}`)
    .join(' · ')

  return (
    <div className={cn('space-y-2', className)}>
      {/* Collapsed Summary - Click to expand/collapse */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left p-2 rounded-md hover:bg-muted/50 transition-colors"
      >
        <span className="text-sm text-muted-foreground truncate flex-1 mr-2">
          {itemSummary || 'No items'}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">${grandTotal.toFixed(2)}</span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="space-y-2 pl-2 border-l-2 border-muted">
          {lineItems.map((item) => {
            const isTransferred = (item as any).isTransferred
            const transferredFromPlayerName = (item as any).transferredFromPlayerName

            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center justify-between py-1 px-2 rounded',
                  item.isPaid
                    ? 'bg-emerald-50 dark:bg-emerald-500/10'
                    : isTransferred
                      ? 'bg-purple-50 dark:bg-purple-500/10'
                      : 'bg-muted/30'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {item.description}
                    </span>
                    {item.isPaid && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <Check className="h-3 w-3" />
                        Paid
                      </span>
                    )}
                    {isTransferred && transferredFromPlayerName && (
                      <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-0.5">
                        <ArrowRightLeft className="h-3 w-3" />
                        from {transferredFromPlayerName}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${item.baseAmount.toFixed(2)}
                    {item.taxType !== 'NONE' && (
                      <span className="ml-1">
                        ({item.taxRate}% {taxTypeLabels[item.taxType]})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">
                    ${item.totalAmount.toFixed(2)}
                  </span>
                  {showTransferButton && !item.isPaid && !isTransferred && onTransferItem && (
                    <button
                      type="button"
                      onClick={() => onTransferItem(item.id)}
                      className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                      title="Transfer to another player"
                    >
                      <ArrowRightLeft className="h-3 w-3" />
                    </button>
                  )}
                  {isEditable && !item.isPaid && onRemoveItem && (
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {/* Totals */}
          <div className="pt-2 border-t border-muted space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {totalTax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>${totalTax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Button - Always visible when editable (outside expanded section) */}
      {showAddButton && onAddItem && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onAddItem()
          }}
          className="w-full flex items-center justify-center gap-1 py-2 text-sm text-primary hover:bg-primary/5 rounded border border-dashed border-primary/30 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Charge
        </button>
      )}
    </div>
  )
}

// Compact version for player cards - matches design spec format
// Design: "Green Fee: $150 · Cart: $40"
export interface LineItemSummaryProps {
  lineItems: BookingLineItemType[]
  className?: string
}

export function LineItemSummary({ lineItems, className }: LineItemSummaryProps) {
  const total = lineItems.reduce((sum, item) => sum + item.totalAmount, 0)
  const paidAmount = lineItems
    .filter((item) => item.isPaid)
    .reduce((sum, item) => sum + item.totalAmount, 0)
  const balanceDue = total - paidAmount

  // Format as "Green Fee: $150 · Cart: $40" per design spec
  const summary = lineItems
    .slice(0, 3) // Show up to 3 items inline
    .map((item) => `${lineItemTypeLabels[item.type]}: $${item.totalAmount.toFixed(0)}`)
    .join(' · ')
  const remaining = lineItems.length > 3 ? ` +${lineItems.length - 3} more` : ''

  return (
    <div className={cn('text-xs text-muted-foreground', className)}>
      <span>{summary}{remaining}</span>
      {balanceDue > 0 && (
        <span className="ml-2 text-amber-600 dark:text-amber-400 font-medium">
          Due: ${balanceDue.toFixed(2)}
        </span>
      )}
    </div>
  )
}
