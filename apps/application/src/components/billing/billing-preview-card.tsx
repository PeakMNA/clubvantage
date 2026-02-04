'use client'

import { Loader2, Calendar, Receipt, Clock, TrendingUp, Info } from 'lucide-react'
import { cn } from '@clubvantage/ui'
import {
  useBillingPeriodPreview,
  type BillingPeriodPreview,
  type BillingLineItem,
} from '@/hooks/use-billing-settings'

interface BillingPreviewCardProps {
  /** Member ID to preview billing for */
  memberId?: string
  /** Optional preview data (if provided, memberId is ignored) */
  preview?: BillingPeriodPreview
  /** Additional class names */
  className?: string
  /** Whether to show the loading state */
  showLoading?: boolean
  /** Whether to show line item details */
  showLineItems?: boolean
  /** Title override */
  title?: string
}

/**
 * Displays a preview of the next billing period for a member.
 * Can be used with a memberId to fetch data, or with preview data directly.
 */
export function BillingPreviewCard({
  memberId,
  preview: externalPreview,
  className,
  showLoading = true,
  showLineItems = true,
  title = 'Next Billing Preview',
}: BillingPreviewCardProps) {
  const { preview: fetchedPreview, isLoading } = useBillingPeriodPreview(
    externalPreview ? undefined : memberId
  )

  const preview = externalPreview ?? fetchedPreview

  // Format date for display
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Format currency
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '-'
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading && showLoading) {
    return (
      <div
        className={cn(
          'rounded-xl border bg-card p-6 shadow-lg shadow-stone-200/30',
          className
        )}
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          <span className="ml-2 text-sm text-muted-foreground">Loading preview...</span>
        </div>
      </div>
    )
  }

  if (!preview) {
    return (
      <div
        className={cn(
          'rounded-xl border bg-card p-6 shadow-lg shadow-stone-200/30',
          className
        )}
      >
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Info className="h-4 w-4 mr-2" />
          <span className="text-sm">No billing preview available</span>
        </div>
      </div>
    )
  }

  const hasProration = preview.proratedAmount !== null && preview.proratedAmount !== preview.baseAmount

  return (
    <div
      className={cn(
        'rounded-xl border bg-gradient-to-br from-amber-50 to-white shadow-lg shadow-stone-200/30 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          {title}
        </h3>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Billing Period */}
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <Calendar className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">
              Billing Period
            </p>
            <p className="text-lg font-semibold text-stone-900 mt-0.5">
              {formatDate(preview.periodStart)} — {formatDate(preview.periodEnd)}
            </p>
          </div>
        </div>

        {/* Key Dates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 bg-stone-50 rounded-lg">
            <div className="flex items-center gap-2 text-stone-500">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Invoice Date
              </span>
            </div>
            <p className="text-base font-semibold text-stone-900 mt-1">
              {formatDate(preview.billingDate)}
            </p>
          </div>
          <div className="p-4 bg-stone-50 rounded-lg">
            <div className="flex items-center gap-2 text-stone-500">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Due Date
              </span>
            </div>
            <p className="text-base font-semibold text-stone-900 mt-1">
              {formatDate(preview.dueDate)}
            </p>
          </div>
        </div>

        {/* Line Items */}
        {showLineItems && preview.lineItems && preview.lineItems.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-stone-700">Line Items</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-stone-600">
                      Description
                    </th>
                    <th className="text-right px-4 py-2 font-medium text-stone-600 w-20">
                      Qty
                    </th>
                    <th className="text-right px-4 py-2 font-medium text-stone-600 w-28">
                      Amount
                    </th>
                    <th className="text-right px-4 py-2 font-medium text-stone-600 w-28">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {preview.lineItems.map((item, index) => (
                    <tr key={index} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-2 text-stone-900">{item.description}</td>
                      <td className="px-4 py-2 text-right text-stone-600">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2 text-right text-stone-600">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-stone-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Amount Summary */}
        <div className="pt-4 border-t space-y-3">
          {/* Base Amount */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-stone-600">Base Amount</span>
            <span className="text-base font-medium text-stone-900">
              {formatCurrency(preview.baseAmount)}
            </span>
          </div>

          {/* Proration (if applicable) */}
          {hasProration && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Prorated Adjustment
                </span>
                <span className="text-sm font-medium text-emerald-600">
                  {formatCurrency((preview.proratedAmount ?? 0) - preview.baseAmount)}
                </span>
              </div>
              {preview.prorationDetails && (
                <p className="text-xs text-muted-foreground bg-stone-50 rounded px-3 py-2">
                  {preview.prorationDetails}
                </p>
              )}
            </>
          )}

          {/* Total */}
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-base font-semibold text-stone-900">Total Due</span>
            <span className="text-xl font-bold text-amber-600">
              {formatCurrency(preview.proratedAmount ?? preview.baseAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact version of the billing preview for inline use
 */
export function BillingPreviewCompact({
  memberId,
  preview: externalPreview,
  className,
}: Pick<BillingPreviewCardProps, 'memberId' | 'preview' | 'className'>) {
  const { preview: fetchedPreview, isLoading } = useBillingPeriodPreview(
    externalPreview ? undefined : memberId
  )

  const preview = externalPreview ?? fetchedPreview

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '-'
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-xs">Loading...</span>
      </div>
    )
  }

  if (!preview) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-3 py-2 bg-amber-50 rounded-lg text-sm',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <Calendar className="h-3.5 w-3.5 text-amber-600" />
        <span className="text-amber-700">
          Next: {formatDate(preview.billingDate)}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Receipt className="h-3.5 w-3.5 text-amber-600" />
        <span className="font-medium text-amber-900">
          {formatCurrency(preview.proratedAmount ?? preview.baseAmount)}
        </span>
      </div>
    </div>
  )
}
