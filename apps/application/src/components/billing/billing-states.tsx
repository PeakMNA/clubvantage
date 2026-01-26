'use client'

import { useState } from 'react'
import { cn } from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import {
  FileText,
  Wallet,
  Award,
  CheckCircle,
  Filter,
  AlertTriangle,
  X,
  RefreshCw,
} from 'lucide-react'

export type EmptyStateVariant = 'invoices' | 'receipts' | 'wht' | 'aging' | 'filtered'

interface EmptyStateConfig {
  icon: React.ReactNode
  title: string
  description: string
  buttonText?: string
}

const emptyStateConfigs: Record<EmptyStateVariant, EmptyStateConfig> = {
  invoices: {
    icon: <FileText className="h-16 w-16 text-muted-foreground" />,
    title: 'No invoices found',
    description: 'Get started by creating your first invoice for a member.',
    buttonText: 'Create Invoice',
  },
  receipts: {
    icon: <Wallet className="h-16 w-16 text-muted-foreground" />,
    title: 'No receipts found',
    description: 'Record member payments to track settlements.',
    buttonText: 'Record a Payment',
  },
  wht: {
    icon: <Award className="h-16 w-16 text-muted-foreground" />,
    title: 'No WHT certificates',
    description: 'WHT certificates will appear here when receipts include withholding tax.',
  },
  aging: {
    icon: <CheckCircle className="h-16 w-16 text-emerald-300" />,
    title: 'No overdue accounts',
    description: 'All members are current on their payments. Great job!',
  },
  filtered: {
    icon: <Filter className="h-16 w-16 text-muted-foreground" />,
    title: 'No results match your filters',
    description: 'Try adjusting your filter criteria to see more results.',
    buttonText: 'Clear Filters',
  },
}

interface BillingEmptyStateProps {
  /** Variant of empty state to display */
  variant: EmptyStateVariant
  /** Custom title (overrides default) */
  title?: string
  /** Custom description (overrides default) */
  description?: string
  /** Custom button text (overrides default) */
  buttonText?: string
  /** Callback when button is clicked */
  onAction?: () => void
  /** Additional class names */
  className?: string
}

export function BillingEmptyState({
  variant,
  title,
  description,
  buttonText,
  onAction,
  className,
}: BillingEmptyStateProps) {
  const config = emptyStateConfigs[variant]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16',
        className
      )}
    >
      <div className="mb-4 rounded-full bg-muted p-6">
        {config.icon}
      </div>
      <h3 className="mb-2 text-lg font-medium text-foreground">
        {title || config.title}
      </h3>
      <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
        {description || config.description}
      </p>
      {(buttonText || config.buttonText) && onAction && (
        <Button
          onClick={onAction}
          className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
        >
          {buttonText || config.buttonText}
        </Button>
      )}
    </div>
  )
}

interface BillingLoadingStateProps {
  /** Number of skeleton rows */
  rows?: number
  /** Show filter bar skeleton */
  showFilters?: boolean
  /** Show summary bar skeleton */
  showSummary?: boolean
  /** Additional class names */
  className?: string
}

export function BillingLoadingState({
  rows = 6,
  showFilters = true,
  showSummary = true,
  className,
}: BillingLoadingStateProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter bar skeleton */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-16 animate-pulse rounded-full bg-muted"
              />
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
            <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      )}

      {/* Summary bar skeleton */}
      {showSummary && (
        <div className="flex gap-2 rounded-xl border border-border bg-muted/50 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-1 flex-col items-center gap-2 border-r border-border last:border-r-0"
            >
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              <div className="h-6 w-20 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Header skeleton */}
        <div className="flex items-center gap-4 border-b border-border bg-muted/50 p-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-3 animate-pulse rounded bg-muted',
                i === 0 ? 'w-16' : i === 1 ? 'w-24' : i === 2 ? 'w-32' : 'w-20'
              )}
            />
          ))}
        </div>
        {/* Row skeletons */}
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border p-4 last:border-b-0"
          >
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="ml-auto h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

interface BillingErrorStateProps {
  /** Error message to display */
  message?: string
  /** Item type for default message */
  itemType?: string
  /** Whether the error can be dismissed */
  dismissible?: boolean
  /** Callback when retry is clicked */
  onRetry?: () => void
  /** Callback when dismiss is clicked */
  onDismiss?: () => void
  /** Additional class names */
  className?: string
}

export function BillingErrorState({
  message,
  itemType = 'items',
  dismissible = true,
  onRetry,
  onDismiss,
  className,
}: BillingErrorStateProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4',
        className
      )}
    >
      <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
      <span className="flex-1 text-sm text-red-800">
        {message || `Unable to load ${itemType}. Please try again.`}
      </span>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          <RefreshCw className="mr-1.5 h-4 w-4" />
          Try Again
        </Button>
      )}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="rounded p-1 text-red-500 hover:bg-red-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
