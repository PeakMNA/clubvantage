'use client'

import { cn } from '@clubvantage/ui'
import { CheckCircle, AlertTriangle } from 'lucide-react'

export interface SettlementSummaryData {
  /** Cash/transfer payment amount */
  cashAmount: number
  /** WHT certificate amount (optional) */
  whtAmount?: number
  /** Total amount allocated to invoices */
  allocatedAmount: number
  /** Status change information */
  statusChange?: {
    /** Type of status change */
    type: 'reinstatement' | 'still-suspended'
    /** Outstanding amount for still-suspended case */
    outstandingAmount?: number
  }
}

interface SettlementSummaryProps {
  /** Settlement calculation data */
  data: SettlementSummaryData
  /** Additional class names */
  className?: string
}

function formatCurrency(amount: number | undefined | null): string {
  const value = amount ?? 0
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function SettlementSummary({ data, className }: SettlementSummaryProps) {
  const cashAmount = data.cashAmount ?? 0
  const whtAmount = data.whtAmount ?? 0
  const totalSettlement = cashAmount + whtAmount
  const allocatedAmount = data.allocatedAmount ?? 0
  const remainder = totalSettlement - allocatedAmount

  const hasWht = whtAmount > 0
  const isShortfall = remainder < 0
  const hasRemainder = remainder > 0

  return (
    <div
      className={cn(
        'rounded-xl border border bg-card p-4 shadow-lg shadow-stone-200/30',
        // Sticky positioning for desktop, will need parent container setup for mobile
        'sticky bottom-4',
        className
      )}
    >
      {/* Payment Section */}
      <div className="space-y-2">
        {/* Cash/Transfer row */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Cash/Transfer</span>
          <span className="text-sm font-medium text-foreground">
            {formatCurrency(cashAmount)}
          </span>
        </div>

        {/* WHT Certificate row - only if WHT > 0 */}
        {hasWht && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">WHT Certificate</span>
            <span className="text-sm font-medium text-foreground">
              {formatCurrency(whtAmount)}
            </span>
          </div>
        )}

        {/* Divider */}
        <hr className="border" />

        {/* Total Settlement row */}
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-foreground">
            Total Settlement
          </span>
          <span className="text-lg font-bold text-foreground">
            {formatCurrency(totalSettlement)}
          </span>
        </div>
      </div>

      {/* Divider between sections */}
      <hr className="my-4 border" />

      {/* Allocation Section */}
      <div className="space-y-2">
        {/* Allocated to Invoices row */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Allocated to Invoices</span>
          <span className="text-sm font-medium text-foreground">
            {formatCurrency(allocatedAmount)}
          </span>
        </div>

        {/* Remainder to Credit OR Shortfall row */}
        {isShortfall ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-600">Shortfall</span>
            <span className="text-sm font-medium text-red-600">
              {formatCurrency(Math.abs(remainder))}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Remainder to Credit</span>
            <span
              className={cn(
                'text-sm font-medium',
                hasRemainder ? 'text-emerald-600' : 'text-foreground'
              )}
            >
              {formatCurrency(remainder)}
            </span>
          </div>
        )}
      </div>

      {/* Status Change Alert Banner */}
      {data.statusChange && (
        <div className="mt-4">
          {data.statusChange.type === 'reinstatement' ? (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span className="text-sm text-emerald-800">
                Member will be reinstated (Current status)
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <span className="text-sm text-red-800">
                Member remains suspended.{' '}
                {data.statusChange.outstandingAmount !== undefined &&
                  `${formatCurrency(data.statusChange.outstandingAmount)} outstanding in 91+ bucket`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
