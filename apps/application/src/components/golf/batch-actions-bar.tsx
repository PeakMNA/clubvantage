'use client'

import { cn } from '@clubvantage/ui'
import { X, CreditCard, CheckCircle, Users, DollarSign } from 'lucide-react'
import type { SlotCartData } from './slot-card'

interface BatchActionsBarProps {
  selectedSlots: SlotCartData[]
  onClearSelection: () => void
  onSelectAll: () => void
  onPaySelected: () => void
  onCheckInSelected: () => void
  totalSlots: number
  paymentMethods?: Array<{ id: string; name: string; icon: string }>
  className?: string
}

export function BatchActionsBar({
  selectedSlots,
  onClearSelection,
  onSelectAll,
  onPaySelected,
  onCheckInSelected,
  totalSlots,
  className,
}: BatchActionsBarProps) {
  // Calculate totals for selected slots
  const totalBalance = selectedSlots.reduce((sum, slot) => sum + slot.balanceDue, 0)
  const totalPaid = selectedSlots.reduce((sum, slot) => sum + slot.paidAmount, 0)
  const allSettled = selectedSlots.every(slot => slot.balanceDue <= 0)
  const allCheckedIn = selectedSlots.every(slot => slot.isCheckedIn)
  const canCheckIn = allSettled && !allCheckedIn && selectedSlots.length > 0
  const hasSuspended = selectedSlots.some(slot => slot.isSuspended)

  if (selectedSlots.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg animate-in slide-in-from-bottom-4 duration-200',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Selection info */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClearSelection}
              className="p-1.5 hover:bg-muted rounded-full transition-colors"
              title="Clear selection"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-primary font-medium">
                <Users className="h-4 w-4" />
                <span>{selectedSlots.length} selected</span>
              </div>
              {selectedSlots.length < totalSlots && (
                <button
                  type="button"
                  onClick={onSelectAll}
                  className="text-sm text-primary hover:underline"
                >
                  Select all
                </button>
              )}
            </div>

            {/* Suspended warning */}
            {hasSuspended && (
              <div className="flex items-center gap-1 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded">
                <span>Includes suspended member</span>
              </div>
            )}
          </div>

          {/* Center: Totals */}
          <div className="flex items-center gap-6">
            {totalPaid > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground">Paid:</span>
                <span className="ml-1 font-medium text-emerald-600 dark:text-emerald-400">
                  ${totalPaid.toFixed(2)}
                </span>
              </div>
            )}
            <div className="text-sm">
              <span className="text-muted-foreground">Balance Due:</span>
              <span className={cn(
                'ml-1 font-semibold',
                totalBalance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
              )}>
                ${totalBalance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Pay Selected button */}
            {totalBalance > 0 && (
              <button
                type="button"
                onClick={onPaySelected}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                Pay ${totalBalance.toFixed(2)}
              </button>
            )}

            {/* Check In button */}
            <button
              type="button"
              onClick={onCheckInSelected}
              disabled={!canCheckIn}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                canCheckIn
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
              title={
                !canCheckIn
                  ? allCheckedIn
                    ? 'Already checked in'
                    : 'Settle balance first'
                  : 'Check in selected players'
              }
            >
              <CheckCircle className="h-4 w-4" />
              Check In
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Compact version for inline display in panels
export function BatchTotalsSummary({
  selectedSlots,
  className,
}: {
  selectedSlots: SlotCartData[]
  className?: string
}) {
  const totalBalance = selectedSlots.reduce((sum, slot) => sum + slot.balanceDue, 0)
  const totalPaid = selectedSlots.reduce((sum, slot) => sum + slot.paidAmount, 0)
  const grandTotal = selectedSlots.reduce((sum, slot) => sum + slot.grandTotal, 0)

  return (
    <div className={cn('flex items-center gap-4 text-sm', className)}>
      <div className="flex items-center gap-1">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span>{selectedSlots.length} players</span>
      </div>
      <div className="flex items-center gap-1">
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        <span>${grandTotal.toFixed(2)}</span>
      </div>
      {totalPaid > 0 && (
        <span className="text-emerald-600 dark:text-emerald-400">
          -${totalPaid.toFixed(2)} paid
        </span>
      )}
      <span className={cn(
        'font-semibold',
        totalBalance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
      )}>
        ${totalBalance.toFixed(2)} due
      </span>
    </div>
  )
}
