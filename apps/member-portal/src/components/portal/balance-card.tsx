'use client'

import Link from 'next/link'
import { cn } from '@clubvantage/ui'
import { Calendar, AlertCircle } from 'lucide-react'

interface BalanceCardProps {
  balance: number
  dueDate?: string
  isOverdue?: boolean
  isSuspended?: boolean
  variant?: 'full' | 'compact'
  onPayClick?: () => void
}

export function BalanceCard({
  balance,
  dueDate,
  isOverdue = false,
  isSuspended = false,
  variant = 'full',
  onPayClick,
}: BalanceCardProps) {
  const isZeroBalance = balance <= 0
  const formattedBalance = Math.abs(balance).toLocaleString()

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-4 md:p-6',
        'shadow-lg',
        isSuspended
          ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
          : isZeroBalance
          ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30'
          : 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30'
      )}
    >
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/5" />

      <div className="relative">
        {/* Overdue indicator */}
        {isOverdue && !isSuspended && (
          <div className="flex items-center gap-1.5 mb-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-semibold">Overdue</span>
          </div>
        )}

        {/* Balance */}
        <div className="mb-1">
          <span
            className={cn(
              'font-mono text-3xl md:text-4xl font-bold tracking-tight',
              isSuspended
                ? 'text-white'
                : isZeroBalance
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-stone-900 dark:text-stone-100'
            )}
          >
            ฿{formattedBalance}
          </span>
        </div>

        {/* Label */}
        <p
          className={cn(
            'text-sm',
            isSuspended
              ? 'text-red-100'
              : isZeroBalance
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-stone-500 dark:text-stone-400'
          )}
        >
          {isZeroBalance ? 'All Paid' : 'Balance Due'}
        </p>

        {/* Due Date */}
        {!isZeroBalance && dueDate && (
          <div
            className={cn(
              'flex items-center gap-1.5 mt-3 text-sm',
              isSuspended ? 'text-red-100' : 'text-stone-600 dark:text-stone-400'
            )}
          >
            <Calendar className="h-4 w-4" />
            <span>Due: {dueDate}</span>
          </div>
        )}

        {/* Pay Button */}
        {variant === 'full' && !isZeroBalance && (
          <button
            onClick={onPayClick}
            className={cn(
              'w-full mt-4 py-3 rounded-xl font-semibold text-sm transition-all',
              isSuspended
                ? 'bg-white text-red-600 hover:bg-red-50'
                : 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/25'
            )}
          >
            Pay Now
          </button>
        )}

        {/* Compact variant link */}
        {variant === 'compact' && !isZeroBalance && (
          <Link
            href="/portal/statements"
            className={cn(
              'inline-flex items-center mt-3 text-sm font-medium',
              'text-amber-600 hover:text-amber-700'
            )}
          >
            View Statement →
          </Link>
        )}
      </div>
    </div>
  )
}
