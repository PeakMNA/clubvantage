'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { format } from 'date-fns'
import { cn } from '@clubvantage/ui'
import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  Share2,
  FileText,
  ArrowRight,
} from 'lucide-react'

interface StatementTransaction {
  date: string
  description: string
  reference?: string
  debit?: number
  credit?: number
  balance?: number
  category?: string
}

interface StatementData {
  id: string
  statementNumber: string | null
  periodStart: Date
  periodEnd: Date
  dueDate: Date
  openingBalance: number
  totalDebits: number
  totalCredits: number
  closingBalance: number
  agingCurrent: number
  aging1to30: number
  aging31to60: number
  aging61to90: number
  aging90Plus: number
  transactionCount: number
  transactions: StatementTransaction[]
  pdfUrl: string | null
  memberName: string | null
  memberDisplayId: string | null
  membershipType: string | null
  accountNumber: string
  cycleMode: string
  isPartialPeriod: boolean
}

function AgingBar({ label, amount, total }: { label: string; amount: number; total: number }) {
  const pct = total > 0 ? (amount / total) * 100 : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-stone-500 dark:text-stone-400">{label}</span>
        <span className="font-medium text-stone-900 dark:text-stone-100">฿{amount.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-stone-400 dark:bg-stone-500 rounded-full transition-all"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  )
}

export function StatementDetailContent({ statement }: { statement: StatementData }) {
  const router = useRouter()
  const pathname = usePathname()

  const periodLabel = format(new Date(statement.periodStart), 'MMMM yyyy')

  const handleShare = useCallback(async () => {
    const pdfUrl = `${window.location.origin}/api/statements/${statement.id}/pdf`
    const shareData = {
      title: `Statement ${statement.statementNumber ?? periodLabel}`,
      text: `Statement for ${format(new Date(statement.periodStart), 'MMM d')} – ${format(new Date(statement.periodEnd), 'MMM d, yyyy')}`,
      url: pdfUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled or error — ignore
      }
    } else {
      // Fallback: copy PDF URL to clipboard
      await navigator.clipboard.writeText(pdfUrl)
    }
  }, [statement, periodLabel])
  const isPaid = statement.closingBalance <= 0
  const totalAging =
    statement.agingCurrent +
    statement.aging1to30 +
    statement.aging31to60 +
    statement.aging61to90 +
    statement.aging90Plus
  const hasAging = totalAging > 0

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-stone-950/95 backdrop-blur-sm border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center justify-between px-5 py-3 pt-safe">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-50 dark:hover:bg-stone-800 -ml-1"
          >
            <ArrowLeft className="h-5 w-5 text-stone-700 dark:text-stone-300" />
          </button>
          <h1 className="text-base font-semibold text-stone-900 dark:text-stone-100">Statement</h1>
          <div className="flex gap-1">
            <a
              href={`/api/statements/${statement.id}/pdf`}
              download
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-50 dark:hover:bg-stone-800"
            >
              <Download className="h-5 w-5 text-stone-500 dark:text-stone-400" />
            </a>
            <button
              onClick={handleShare}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-50 dark:hover:bg-stone-800"
            >
              <Share2 className="h-5 w-5 text-stone-500 dark:text-stone-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 pb-36">
        {/* Statement Header Card */}
        <div className="py-6 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-900 dark:bg-stone-800 flex-shrink-0">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">{periodLabel}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {format(new Date(statement.periodStart), 'MMM d')} – {format(new Date(statement.periodEnd), 'MMM d, yyyy')}
                </p>
                {statement.isPartialPeriod && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                    Partial Period
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {statement.statementNumber && (
                  <span className="text-xs text-stone-400 dark:text-stone-500 font-mono">
                    #{statement.statementNumber}
                  </span>
                )}
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                  {statement.cycleMode === 'MEMBER_CYCLE' ? 'Member Cycle' : 'Club Cycle'}
                </span>
              </div>
            </div>
            <span
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold mt-1',
                isPaid
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
              )}
            >
              {isPaid ? 'Paid' : 'Due'}
            </span>
          </div>
        </div>

        {/* Member Info */}
        {statement.memberName && (
          <div className="py-4 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500 dark:text-stone-400">Member</span>
              <span className="text-stone-900 dark:text-stone-100 font-medium">{statement.memberName}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-stone-500 dark:text-stone-400">Member ID</span>
              <span className="text-stone-900 dark:text-stone-100 font-mono">{statement.memberDisplayId}</span>
            </div>
            {statement.membershipType && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-stone-500 dark:text-stone-400">Membership</span>
                <span className="text-stone-900 dark:text-stone-100">{statement.membershipType}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-stone-500 dark:text-stone-400">Account</span>
              <span className="text-stone-900 dark:text-stone-100 font-mono">{statement.accountNumber}</span>
            </div>
          </div>
        )}

        {/* Balance Summary */}
        <div className="py-5 border-b border-stone-100 dark:border-stone-800">
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-4">Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-[15px]">
              <span className="text-stone-500 dark:text-stone-400">Opening Balance</span>
              <span className="text-stone-900 dark:text-stone-100">฿{statement.openingBalance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-stone-500 dark:text-stone-400">Charges</span>
              <span className="text-stone-900 dark:text-stone-100">฿{statement.totalDebits.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-stone-500 dark:text-stone-400">Payments & Credits</span>
              <span className="text-emerald-600 dark:text-emerald-400">-฿{statement.totalCredits.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
            <span className="text-base font-semibold text-stone-900 dark:text-stone-100">Closing Balance</span>
            <span className="text-base font-semibold text-stone-900 dark:text-stone-100">
              ฿{statement.closingBalance.toLocaleString()}
            </span>
          </div>
          {!isPaid && (
            <div className="flex justify-between text-sm mt-2">
              <span className="text-stone-500 dark:text-stone-400">Due by</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {format(new Date(statement.dueDate), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </div>

        {/* Aging Breakdown */}
        {hasAging && (
          <div className="py-5 border-b border-stone-100 dark:border-stone-800">
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-4">Aging</h3>
            <div className="space-y-3">
              <AgingBar label="Current" amount={statement.agingCurrent} total={totalAging} />
              <AgingBar label="1–30 days" amount={statement.aging1to30} total={totalAging} />
              <AgingBar label="31–60 days" amount={statement.aging31to60} total={totalAging} />
              <AgingBar label="61–90 days" amount={statement.aging61to90} total={totalAging} />
              <AgingBar label="90+ days" amount={statement.aging90Plus} total={totalAging} />
            </div>
          </div>
        )}

        {/* Transactions */}
        <div className="py-5 border-b border-stone-100 dark:border-stone-800">
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-4">
            Transactions ({statement.transactionCount})
          </h3>
          {statement.transactions.length > 0 ? (
            <div className="space-y-0 divide-y divide-stone-50 dark:divide-stone-800">
              {statement.transactions.map((tx, i) => {
                const isCredit = (tx.credit ?? 0) > 0
                const amount = isCredit ? tx.credit! : tx.debit ?? 0
                return (
                  <div key={i} className="flex items-start justify-between py-3 first:pt-0">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-[15px] text-stone-900 dark:text-stone-100 leading-snug">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-stone-400 dark:text-stone-500">
                          {tx.date}
                        </p>
                        {tx.reference && (
                          <p className="text-xs text-stone-400 dark:text-stone-500 font-mono">
                            {tx.reference}
                          </p>
                        )}
                        {tx.category && (
                          <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                            {tx.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <p
                      className={cn(
                        'text-[15px] font-medium flex-shrink-0',
                        isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-900 dark:text-stone-100'
                      )}
                    >
                      {isCredit ? '-' : ''}฿{amount.toLocaleString()}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-6">
              Transaction details not available for this statement
            </p>
          )}
        </div>

        {/* View Unbilled Activity Link */}
        <Link
          href="/portal/statements/unbilled"
          className="flex items-center justify-between py-4 border-b border-stone-100 dark:border-stone-800 group"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-stone-900 dark:text-stone-100">View Unbilled Activity</span>
          </div>
          <ArrowRight className="h-4 w-4 text-stone-300 dark:text-stone-600 group-hover:text-stone-500 transition-colors" />
        </Link>

        {/* Actions */}
        <div className="flex gap-3 pt-5">
          <a
            href={`/api/statements/${statement.id}/pdf`}
            download
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </a>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      {!isPaid && (
        <div className="fixed bottom-[100px] left-0 right-0 z-40 px-5 py-3 bg-white/95 dark:bg-stone-950/95 backdrop-blur-sm border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-stone-900 dark:text-stone-100">
                ฿{statement.closingBalance.toLocaleString()}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Due {format(new Date(statement.dueDate), 'MMM d')}
              </p>
            </div>
            <Link
              href="/portal/pay"
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900"
            >
              Pay Now
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
