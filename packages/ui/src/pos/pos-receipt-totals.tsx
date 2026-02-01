'use client'

import { cn } from '../lib/utils'

export interface Discount {
  name: string
  amount: number // positive number, will be displayed as negative
}

export interface POSReceiptTotalsProps {
  subtotal: number
  discounts?: Discount[]
  tax: number
  total: number
  amountPaid?: number
  balanceDue?: number
  className?: string
}

// Helper to format currency with tabular alignment
function formatCurrency(amount: number, negative?: boolean): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount))

  return negative ? `-${formatted}` : formatted
}

export function POSReceiptTotals({
  subtotal,
  discounts = [],
  tax,
  total,
  amountPaid,
  balanceDue,
  className,
}: POSReceiptTotalsProps) {
  const totalDiscounts = discounts.reduce((sum, d) => sum + d.amount, 0)
  const hasPaymentInfo = amountPaid !== undefined || balanceDue !== undefined
  const hasBalance = balanceDue !== undefined && balanceDue > 0

  return (
    <div
      className={cn('space-y-2 text-sm', className)}
      role="region"
      aria-label="Receipt totals"
    >
      {/* Subtotal */}
      <div className="flex items-center justify-between">
        <span className="text-stone-600">Subtotal</span>
        <span className="font-mono text-stone-900 tabular-nums">
          {formatCurrency(subtotal)}
        </span>
      </div>

      {/* Discounts */}
      {discounts.map((discount, index) => (
        <div
          key={`${discount.name}-${index}`}
          className="flex items-center justify-between"
        >
          <span className="text-emerald-600">{discount.name}</span>
          <span className="font-mono text-emerald-600 tabular-nums">
            {formatCurrency(discount.amount, true)}
          </span>
        </div>
      ))}

      {/* Tax */}
      <div className="flex items-center justify-between">
        <span className="text-stone-600">Tax</span>
        <span className="font-mono text-stone-900 tabular-nums">
          {formatCurrency(tax)}
        </span>
      </div>

      {/* Divider */}
      <div
        className="border-t border-stone-300 my-2"
        role="separator"
        aria-hidden="true"
      />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-stone-900">Total</span>
        <span className="font-mono text-base font-bold text-stone-900 tabular-nums">
          {formatCurrency(total)}
        </span>
      </div>

      {/* Payment Section */}
      {hasPaymentInfo && (
        <>
          <div className="h-2" aria-hidden="true" />

          {amountPaid !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-stone-600">Amount Paid</span>
              <span className="font-mono text-stone-900 tabular-nums">
                {formatCurrency(amountPaid)}
              </span>
            </div>
          )}

          {balanceDue !== undefined && (
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  hasBalance ? 'font-medium text-amber-600' : 'text-stone-600'
                )}
              >
                Balance Due
              </span>
              <span
                className={cn(
                  'font-mono tabular-nums',
                  hasBalance
                    ? 'font-semibold text-amber-600'
                    : 'text-stone-900'
                )}
              >
                {formatCurrency(balanceDue)}
              </span>
            </div>
          )}
        </>
      )}

      {/* Savings Summary */}
      {totalDiscounts > 0 && (
        <div className="mt-3 pt-2 border-t border-dashed border-stone-200">
          <p className="text-xs text-center text-emerald-600">
            You saved {formatCurrency(totalDiscounts)} today!
          </p>
        </div>
      )}
    </div>
  )
}
