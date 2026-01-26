'use client'

import { AlertCircle, RefreshCw, BarChart3 } from 'lucide-react'
import { cn } from '@clubvantage/ui'

interface ChartWrapperProps {
  title?: string
  actions?: React.ReactNode
  children: React.ReactNode
  state?: 'loading' | 'empty' | 'error' | 'success'
  onRetry?: () => void
  emptyMessage?: string
  className?: string
  minHeight?: number
}

function ChartSkeleton({ minHeight }: { minHeight: number }) {
  return (
    <div className="animate-pulse" style={{ minHeight }}>
      <div className="flex h-full items-end justify-around gap-2 p-4">
        {[60, 80, 45, 90, 70, 55, 85].map((height, i) => (
          <div
            key={i}
            className="w-8 rounded-t bg-stone-200"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BarChart3 className="mb-3 h-12 w-12 text-stone-300" />
      <p className="text-sm font-medium text-stone-600">No data to display</p>
      <p className="text-xs text-stone-400">{message}</p>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="mb-3 h-12 w-12 text-red-400" />
      <p className="text-sm font-medium text-stone-600">Failed to load chart</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      )}
    </div>
  )
}

export function ChartWrapper({
  title,
  actions,
  children,
  state = 'success',
  onRetry,
  emptyMessage = 'Adjust filters or date range',
  className,
  minHeight = 300,
}: ChartWrapperProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-stone-200 bg-white shadow-sm',
        className
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          {title && <h3 className="text-lg font-semibold text-stone-900">{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className="p-4" style={{ minHeight }}>
        {state === 'loading' && <ChartSkeleton minHeight={minHeight - 32} />}
        {state === 'empty' && <EmptyState message={emptyMessage} />}
        {state === 'error' && <ErrorState onRetry={onRetry} />}
        {state === 'success' && children}
      </div>
    </div>
  )
}
