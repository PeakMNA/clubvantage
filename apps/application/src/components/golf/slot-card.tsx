'use client'

import { useState } from 'react'
import { cn } from '@clubvantage/ui'
import { Check, ChevronDown, ChevronUp, DollarSign, ArrowRightLeft, AlertCircle, Trash2 } from 'lucide-react'
import { PlayerTypeBadge } from './player-type-badge'
import { CheckInStatusBadge } from './check-in-status-badge'
import { QuantityStepper } from './quantity-stepper'
import { RemoveConfirmation } from './remove-confirmation'
import type { BookingLineItemType, PaymentStatus } from '@clubvantage/api-client'
import type { PlayerType } from './player-type-badge'

// Slot cart data structure (matches GraphQL SlotCartType)
export interface SlotCartData {
  playerId: string
  playerName: string
  playerType: PlayerType
  memberId?: string
  memberNumber?: string
  lineItems: Array<{
    id: string
    type: string
    description: string
    baseAmount: number
    taxType: string
    taxRate: number
    taxAmount: number
    totalAmount: number
    quantity: number
    isPaid: boolean
    paidAt?: Date
    paymentMethod?: string
    isTransferred: boolean
    transferredFromPlayerName?: string
  }>
  transferredInItems: Array<{
    lineItemId: string
    description: string
    amount: number
    fromPlayerId: string
    fromPlayerName: string
  }>
  transferredOutItems: Array<{
    lineItemId: string
    description: string
    amount: number
    toPlayerId: string
    toPlayerName: string
  }>
  subtotal: number
  taxTotal: number
  grandTotal: number
  paidAmount: number
  balanceDue: number
  isCheckedIn: boolean
  checkedInAt?: Date
  isSettled: boolean
  isSuspended?: boolean
  suspensionReason?: string
}

interface SlotCardProps {
  slot: SlotCartData
  position: 1 | 2 | 3 | 4
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
  onTransferItem?: (lineItemId: string) => void
  onAddItem?: () => void
  onViewCart?: () => void
  onUpdateQuantity?: (lineItemId: string, quantity: number) => void
  onRemoveItem?: (lineItemId: string) => void
  onSelectItem?: (lineItemId: string, selected: boolean) => void
  selectedItemIds?: Set<string>
  className?: string
}

export function SlotCard({
  slot,
  position,
  isSelected = false,
  onSelect,
  onTransferItem,
  onAddItem,
  onViewCart,
  onUpdateQuantity,
  onRemoveItem,
  onSelectItem,
  selectedItemIds,
  className,
}: SlotCardProps) {
  // Expand by default if there are line items to show
  const [expanded, setExpanded] = useState(slot.lineItems.length > 0)
  // Track which item is showing remove confirmation
  const [removingItemId, setRemovingItemId] = useState<string | null>(null)

  // Get payment status for badge
  const getPaymentStatus = (): 'PREPAID' | 'PARTIAL' | 'UNPAID' | 'NO_CHARGES' => {
    if (slot.lineItems.length === 0) return 'NO_CHARGES'
    if (slot.isSettled) return 'PREPAID'
    if (slot.paidAmount > 0 && slot.balanceDue > 0) return 'PARTIAL'
    return 'UNPAID'
  }

  const paymentStatus = getPaymentStatus()

  // Derive status for styling
  const status = slot.isCheckedIn ? 'checked-in' : slot.isSettled ? 'settled' : 'unpaid'

  // Line item summary
  const itemSummary = slot.lineItems
    .slice(0, 3)
    .map(item => `${item.type}: $${item.totalAmount.toFixed(0)}`)
    .join(' · ')
  const remainingCount = slot.lineItems.length - 3

  return (
    <div
      className={cn(
        'relative border rounded-lg p-3 transition-all',
        isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary' : 'border-border bg-card',
        slot.isSuspended && 'border-red-300 bg-red-50 dark:bg-red-900/10',
        className
      )}
    >
      {/* Selection checkbox */}
      {onSelect && (
        <button
          type="button"
          onClick={() => onSelect(!isSelected)}
          className={cn(
            'absolute top-2 right-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
            isSelected
              ? 'border-primary bg-primary text-white'
              : 'border-muted-foreground/30 hover:border-primary/50'
          )}
        >
          {isSelected && <Check className="h-3 w-3" />}
        </button>
      )}

      {/* Header: Position + Player Info */}
      <div className="flex items-start gap-3">
        {/* Position indicator with status */}
        <div className="relative">
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold',
              status === 'checked-in'
                ? 'bg-emerald-500 text-white'
                : status === 'settled'
                  ? 'bg-blue-500 text-white'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            {position}
          </div>
          {slot.isCheckedIn && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-card">
              <Check className="h-2.5 w-2.5 text-white" />
            </div>
          )}
        </div>

        {/* Player info */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm truncate">{slot.playerName}</span>
            <PlayerTypeBadge type={slot.playerType} />
          </div>
          {slot.memberNumber && (
            <div className="text-xs text-muted-foreground mt-0.5">
              ID: {slot.memberNumber}
            </div>
          )}
          {slot.isSuspended && (
            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 mt-1">
              <AlertCircle className="h-3 w-3" />
              <span>{slot.suspensionReason || 'Account suspended'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cart Summary */}
      <div className="mt-3 pt-3 border-t border-border/50">
        {/* Collapsed summary */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex-1 min-w-0">
            <span className="text-xs text-muted-foreground truncate block">
              {itemSummary || 'No items'}
              {remainingCount > 0 && ` +${remainingCount} more`}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span className={cn(
              'font-semibold text-sm',
              slot.balanceDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
            )}>
              ${slot.grandTotal.toFixed(2)}
            </span>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 space-y-2">
            {/* Line items */}
            {slot.lineItems.map(item => {
              const isRemoving = removingItemId === item.id
              const isItemSelected = selectedItemIds?.has(item.id) ?? false
              const lineTotal = item.totalAmount * item.quantity
              const canModify = !item.isPaid && !item.isTransferred

              return (
                <div
                  key={item.id}
                  className={cn(
                    'flex flex-col gap-2 py-2 px-2 rounded text-sm',
                    item.isPaid
                      ? 'bg-emerald-50 dark:bg-emerald-500/10'
                      : item.isTransferred
                        ? 'bg-purple-50 dark:bg-purple-500/10'
                        : isItemSelected
                          ? 'bg-primary/10 ring-1 ring-primary'
                          : 'bg-muted/50'
                  )}
                >
                  {isRemoving ? (
                    <RemoveConfirmation
                      onConfirm={() => {
                        onRemoveItem?.(item.id)
                        setRemovingItemId(null)
                      }}
                      onCancel={() => setRemovingItemId(null)}
                    />
                  ) : (
                    <>
                      {/* Row 1: Checkbox, Description, Price */}
                      <div className="flex items-center gap-2">
                        {canModify && onSelectItem && (
                          <input
                            type="checkbox"
                            checked={isItemSelected}
                            onChange={(e) => onSelectItem(item.id, e.target.checked)}
                            className="h-4 w-4 rounded border-muted-foreground/30"
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="truncate">{item.description}</span>
                        </div>
                        <div className="text-right font-medium tabular-nums">
                          {item.quantity > 1 ? (
                            <span>
                              <span className="text-muted-foreground text-xs">฿{item.totalAmount.toFixed(0)} × {item.quantity} = </span>
                              ฿{lineTotal.toFixed(2)}
                            </span>
                          ) : (
                            <span>฿{lineTotal.toFixed(2)}</span>
                          )}
                        </div>
                      </div>

                      {/* Row 2: Quantity stepper + Badges + Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {canModify && onUpdateQuantity ? (
                            <QuantityStepper
                              value={item.quantity}
                              onChange={(qty) => {
                                if (qty < 1) {
                                  setRemovingItemId(item.id)
                                } else {
                                  onUpdateQuantity(item.id, qty)
                                }
                              }}
                              min={0}
                              max={99}
                            />
                          ) : (
                            <>
                              {item.isPaid && (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                  <Check className="h-3 w-3" />
                                  Paid
                                </span>
                              )}
                              {item.isTransferred && item.transferredFromPlayerName && (
                                <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-0.5">
                                  <ArrowRightLeft className="h-3 w-3" />
                                  from {item.transferredFromPlayerName}
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        {canModify && (
                          <div className="flex items-center gap-1">
                            {onTransferItem && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onTransferItem(item.id)
                                }}
                                className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                title="Transfer to another player"
                              >
                                <ArrowRightLeft className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {onRemoveItem && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setRemovingItemId(item.id)
                                }}
                                className="p-1 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}

            {/* Transferred out items */}
            {slot.transferredOutItems.length > 0 && (
              <div className="pt-2 border-t border-dashed border-border">
                <div className="text-xs text-muted-foreground mb-1">Transferred to others:</div>
                {slot.transferredOutItems.map(item => (
                  <div
                    key={item.lineItemId}
                    className="flex items-center justify-between py-1 px-2 text-sm text-muted-foreground line-through"
                  >
                    <span className="truncate">{item.description} → {item.toPlayerName}</span>
                    <span>${item.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            <div className="pt-2 border-t border-border space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${slot.subtotal.toFixed(2)}</span>
              </div>
              {slot.taxTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${slot.taxTotal.toFixed(2)}</span>
                </div>
              )}
              {slot.paidAmount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                  <span>Paid</span>
                  <span>-${slot.paidAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Balance Due</span>
                <span className={slot.balanceDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                  ${slot.balanceDue.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Add item button */}
            {onAddItem && !slot.isCheckedIn && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddItem()
                }}
                className="w-full flex items-center justify-center gap-1 py-2 text-sm text-primary hover:bg-primary/5 rounded border border-dashed border-primary/30 transition-colors mt-2"
              >
                <DollarSign className="h-4 w-4" />
                Add Charge
              </button>
            )}
          </div>
        )}
      </div>

      {/* Status badge - bottom right */}
      <div className="absolute bottom-2 right-2">
        <CheckInStatusBadge paymentStatus={paymentStatus} isCheckedIn={slot.isCheckedIn} />
      </div>
    </div>
  )
}
