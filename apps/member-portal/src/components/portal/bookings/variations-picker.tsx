'use client'

import { cn, Badge } from '@clubvantage/ui'
import { Check, Clock, Plus, Minus } from 'lucide-react'
import type { ServiceVariation } from '@/lib/types'

export interface VariationsPickerProps {
  variations: ServiceVariation[]
  selectedVariationIds: string[]
  onToggleVariation?: (variationId: string) => void
  multiSelect?: boolean
  className?: string
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDuration(minutes: number): string {
  if (minutes === 0) return ''
  if (minutes < 60) {
    return `+${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `+${hours} hr`
  }
  return `+${hours} hr ${remainingMinutes} min`
}

/**
 * VariationsPicker (PRT-18)
 *
 * Allows members to select service variations/add-ons.
 */
export function VariationsPicker({
  variations,
  selectedVariationIds,
  onToggleVariation,
  multiSelect = true,
  className,
}: VariationsPickerProps) {
  if (variations.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-sm font-medium text-foreground">
        {multiSelect ? 'Add-ons' : 'Select Option'}
      </h4>
      <div className="space-y-2">
        {variations.map((variation) => {
          const isSelected = selectedVariationIds.includes(variation.id)

          return (
            <button
              key={variation.id}
              type="button"
              onClick={() => onToggleVariation?.(variation.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
                isSelected
                  ? 'border-amber-400 bg-amber-50 dark:border-amber-500 dark:bg-amber-500/10'
                  : 'border-border bg-card hover:border-amber-300 dark:hover:border-amber-500/50'
              )}
            >
              {/* Checkbox/Radio indicator */}
              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded',
                  multiSelect ? 'rounded' : 'rounded-full',
                  isSelected
                    ? 'bg-amber-500 text-white'
                    : 'border border-border bg-card'
                )}
              >
                {isSelected && <Check className="h-3 w-3" />}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isSelected
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-foreground'
                    )}
                  >
                    {variation.name}
                  </p>
                  {variation.isPopular && (
                    <Badge className="bg-emerald-100 text-[10px] text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                      Popular
                    </Badge>
                  )}
                </div>
                {variation.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {variation.description}
                  </p>
                )}
                {variation.additionalDuration && variation.additionalDuration > 0 && (
                  <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(variation.additionalDuration)}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="shrink-0 text-right">
                {variation.additionalPrice > 0 ? (
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      isSelected
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-foreground'
                    )}
                  >
                    +{formatCurrency(variation.additionalPrice)}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    Free
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
