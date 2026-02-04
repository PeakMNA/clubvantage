'use client'

import { cn } from '@clubvantage/ui'
import { CheckCircle, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react'

export interface SettlementSummaryData {
  /** Cash/transfer payment amount */
  cashAmount: number
  /** WHT certificate amount (optional) */
  whtAmount?: number
  /** Total amount allocated to invoices */
  allocatedAmount: number
  /** Credit to add (if overpayment) */
  creditToAdd?: number
  /** Number of invoices selected */
  invoiceCount?: number
  /** Account balance before payment */
  balanceBefore?: {
    outstanding: number
    credit: number
  }
  /** Account balance after payment (calculated) */
  balanceAfter?: {
    outstanding: number
    credit: number
  }
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
  const creditToAdd = data.creditToAdd ?? Math.max(0, totalSettlement - allocatedAmount)
  const remainder = totalSettlement - allocatedAmount

  const hasWht = whtAmount > 0
  const isShortfall = remainder < 0
  const hasCredit = creditToAdd > 0
  const hasBalanceInfo = data.balanceBefore || data.balanceAfter

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
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Payment
        </div>
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
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Allocation
        </div>
        {/* Invoices selected */}
        {data.invoiceCount !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Invoices selected</span>
            <span className="text-sm font-medium text-foreground">
              {data.invoiceCount}
            </span>
          </div>
        )}
        {/* Allocated to Invoices row */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Allocated to Invoices</span>
          <span className="text-sm font-medium text-foreground">
            {formatCurrency(allocatedAmount)}
          </span>
        </div>

        {/* Shortfall warning */}
        {isShortfall && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-600">Shortfall</span>
            <span className="text-sm font-medium text-red-600">
              {formatCurrency(Math.abs(remainder))}
            </span>
          </div>
        )}

        {/* Credit to add (overpayment) */}
        {hasCredit && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-emerald-600">Credit to add</span>
            <span className="text-sm font-medium text-emerald-600">
              +{formatCurrency(creditToAdd)}
            </span>
          </div>
        )}
      </div>

      {/* Account Balance Section - only if balance info provided */}
      {hasBalanceInfo && (
        <>
          <hr className="my-4 border" />
          <div className="space-y-2">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Account Balance
            </div>
            {/* Outstanding balance change */}
            {data.balanceBefore?.outstanding !== undefined && data.balanceAfter?.outstanding !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-emerald-600" />
                  Outstanding
                </span>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(data.balanceBefore.outstanding)}
                  <span className="text-muted-foreground mx-1">&rarr;</span>
                  <span className="text-emerald-600">{formatCurrency(data.balanceAfter.outstanding)}</span>
                </span>
              </div>
            )}
            {/* Credit balance change */}
            {data.balanceBefore?.credit !== undefined && data.balanceAfter?.credit !== undefined && hasCredit && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                  Credit
                </span>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(data.balanceBefore.credit)}
                  <span className="text-muted-foreground mx-1">&rarr;</span>
                  <span className="text-emerald-600">{formatCurrency(data.balanceAfter.credit)}</span>
                </span>
              </div>
            )}
          </div>
        </>
      )}

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
