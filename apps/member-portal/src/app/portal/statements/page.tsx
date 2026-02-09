import type { Metadata } from 'next'
import Link from 'next/link'
import { format } from 'date-fns'
import { cn } from '@clubvantage/ui'
import {
  ChevronRight,
  CreditCard,
  Flag,
  FileText,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { getAccountBalance, getRecentTransactions, getStatements, getUnbilledActivity } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Statements | Member Portal',
}

function formatDateRange(start: Date, end: Date): string {
  const startStr = format(start, 'd MMM')
  const endStr = format(end, 'd MMM yyyy')
  return `${startStr} — ${endStr}`
}

function getStatementStatus(closingBalance: number, dueDate: Date | null) {
  if (closingBalance <= 0) {
    return { label: 'Paid', className: 'text-emerald-600 bg-emerald-50' }
  }
  if (dueDate && dueDate < new Date()) {
    return { label: 'Overdue', className: 'text-red-600 bg-red-50' }
  }
  return { label: 'Due', className: 'text-amber-600 bg-amber-50' }
}

export default async function StatementsPage() {
  const [balance, transactions, statements, unbilled] = await Promise.all([
    getAccountBalance(),
    getRecentTransactions(),
    getStatements(3),
    getUnbilledActivity(),
  ])

  return (
    <div className="px-5 py-6 pb-36 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold text-stone-900">Statements</h1>
      </div>

      {/* Balance Card */}
      <div className="rounded-2xl bg-stone-900 p-6 text-white">
        <p className="text-sm text-white/60">Outstanding Balance</p>
        <p className="text-4xl font-bold mt-1 tracking-tight">
          ฿{balance.balance.toLocaleString()}
        </p>
        {balance.dueDate && (
          <p className="text-sm text-white/50 mt-1">
            Due {format(balance.dueDate, 'MMM d, yyyy')}
          </p>
        )}
        {balance.balance > 0 && (
          <Link
            href="/portal/pay"
            className="mt-5 inline-block px-5 py-2.5 rounded-xl bg-white text-stone-900 font-semibold text-sm"
          >
            Pay Now
          </Link>
        )}
      </div>

      {/* Unbilled Activity Summary */}
      {unbilled.categories.length > 0 && (
        <Link
          href="/portal/statements/unbilled"
          className="block rounded-xl border border-amber-100 bg-amber-50/60 p-4 active:opacity-70 transition-opacity"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <p className="text-sm font-semibold text-amber-800">
                Current Activity
                {unbilled.sinceDate && (
                  <span className="font-normal text-amber-600"> (since {format(unbilled.sinceDate, 'd MMM')})</span>
                )}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-amber-700">
            {unbilled.categories.slice(0, 3).map((cat) => (
              <span key={cat.name}>
                {cat.name}: ฿{cat.subtotal.toLocaleString()}
              </span>
            ))}
            {unbilled.categories.length > 3 && (
              <span>+{unbilled.categories.length - 3} more</span>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between">
            <p className="text-xs font-medium text-amber-700">Net Unbilled</p>
            <p className="text-sm font-bold text-amber-800">
              ฿{unbilled.netUnbilled.toLocaleString()}
            </p>
          </div>
        </Link>
      )}

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-stone-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-stone-100">
          {transactions.map((tx) => {
            const isCredit = tx.amount > 0
            const Icon = isCredit ? CreditCard : Flag
            return (
              <div key={tx.id} className="flex items-center gap-3 py-4 first:pt-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 flex-shrink-0">
                  <Icon className="h-5 w-5 text-stone-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-stone-900 truncate">
                    {tx.description}
                  </p>
                  <p className="text-xs text-stone-500">
                    {format(tx.date, 'MMM d')}
                  </p>
                </div>
                <p
                  className={cn(
                    'text-[15px] font-semibold',
                    isCredit ? 'text-emerald-600' : 'text-stone-900'
                  )}
                >
                  {isCredit ? '+' : '-'}฿{Math.abs(tx.amount).toLocaleString()}
                </p>
              </div>
            )
          })}
          {transactions.length === 0 && (
            <p className="text-sm text-stone-400 py-8 text-center">No recent activity</p>
          )}
        </div>
      </section>

      {/* Closed Statements (3-Month Rolling) */}
      <section>
        <h2 className="text-base font-semibold text-stone-900 mb-4">
          Closed Statements
        </h2>
        <div className="space-y-3">
          {statements.map((statement) => {
            const status = getStatementStatus(statement.closingBalance, statement.dueDate)
            return (
              <Link
                key={statement.id}
                href={`/portal/statements/${statement.id}`}
                className="flex items-center gap-3 rounded-xl border border-stone-100 bg-white p-4 active:opacity-70 transition-opacity group"
              >
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0',
                  statement.closingBalance <= 0
                    ? 'bg-emerald-50'
                    : statement.dueDate && statement.dueDate < new Date()
                      ? 'bg-red-50'
                      : 'bg-amber-50'
                )}>
                  <FileText className={cn(
                    'h-5 w-5',
                    statement.closingBalance <= 0
                      ? 'text-emerald-600'
                      : statement.dueDate && statement.dueDate < new Date()
                        ? 'text-red-600'
                        : 'text-amber-600'
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-medium text-stone-900">
                      {formatDateRange(statement.periodStart, statement.periodEnd)}
                    </p>
                    <span className={cn(
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                      status.className
                    )}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {statement.statementNumber}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={cn(
                    'text-[15px] font-semibold',
                    statement.closingBalance > 0 ? 'text-stone-900' : 'text-emerald-600'
                  )}>
                    ฿{statement.closingBalance.toLocaleString()}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-stone-300 group-hover:text-stone-500 transition-colors flex-shrink-0" />
              </Link>
            )
          })}
          {statements.length === 0 && (
            <p className="text-sm text-stone-400 py-8 text-center">No statements yet</p>
          )}
        </div>

        {/* Archived Note */}
        {statements.length > 0 && (
          <div className="flex items-center gap-2 mt-4 px-2">
            <Clock className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
            <p className="text-xs text-stone-400">
              Showing 3 most recent statements. Older statements are archived.
            </p>
          </div>
        )}
      </section>

      {/* WHT Certificates */}
      <Link
        href="/portal/statements/wht"
        className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50 p-4 active:opacity-70 transition-opacity"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white flex-shrink-0">
          <FileText className="h-5 w-5 text-stone-600" />
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-medium text-stone-900">WHT Certificates</p>
          <p className="text-xs text-stone-500">Submit and track withholding tax certificates</p>
        </div>
        <ChevronRight className="h-5 w-5 text-stone-300 flex-shrink-0" />
      </Link>
    </div>
  )
}
