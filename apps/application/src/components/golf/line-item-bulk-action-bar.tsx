'use client'

import { ArrowRightLeft, CreditCard, Trash2, CheckSquare, Square } from 'lucide-react'
import { cn } from '@clubvantage/ui'

interface LineItemBulkActionBarProps {
  selectedCount: number
  totalSelectableCount: number
  isAllSelected: boolean
  onSelectAll: () => void
  onDeselectAll: () => void
  onTransfer: () => void
  onPay: () => void
  onRemove: () => void
  disabled?: boolean
  className?: string
}

export function LineItemBulkActionBar({
  selectedCount,
  totalSelectableCount,
  isAllSelected,
  onSelectAll,
  onDeselectAll,
  onTransfer,
  onPay,
  onRemove,
  disabled = false,
  className,
}: LineItemBulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        'sticky bottom-0 bg-card border-t shadow-lg px-3 py-2 -mx-3 -mb-3 mt-3 flex items-center gap-3',
        className
      )}
    >
      {/* Select All / Deselect All */}
      <button
        type="button"
        onClick={isAllSelected ? onDeselectAll : onSelectAll}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {isAllSelected ? (
          <CheckSquare className="h-4 w-4" />
        ) : (
          <Square className="h-4 w-4" />
        )}
        {isAllSelected ? 'Deselect All' : 'Select All'}
      </button>

      {/* Selected count */}
      <span className="text-sm font-medium">
        {selectedCount} selected
      </span>

      <div className="flex-1" />

      {/* Transfer button */}
      <button
        type="button"
        onClick={onTransfer}
        disabled={disabled}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors',
          disabled
            ? 'text-muted-foreground bg-muted cursor-not-allowed'
            : 'text-primary hover:bg-primary/10'
        )}
      >
        <ArrowRightLeft className="h-4 w-4" />
        Transfer
      </button>

      {/* Pay button */}
      <button
        type="button"
        onClick={onPay}
        disabled={disabled}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors',
          disabled
            ? 'text-muted-foreground bg-muted cursor-not-allowed'
            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
        )}
      >
        <CreditCard className="h-4 w-4" />
        Pay
      </button>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors',
          disabled
            ? 'text-muted-foreground bg-muted cursor-not-allowed'
            : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
        )}
      >
        <Trash2 className="h-4 w-4" />
        Remove
      </button>
    </div>
  )
}
