import type { Metadata } from 'next'
import Link from 'next/link'
import { format } from 'date-fns'
import { cn } from '@clubvantage/ui'
import {
  ChevronRight,
  Download,
  Flag,
  CreditCard,
  FileText,
} from 'lucide-react'
import { getAccountBalance, getRecentTransactions, getStatements } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Statements | Member Portal',
}

export default async function StatementsPage() {
  const [balance, transactions, statements] = await Promise.all([
    getAccountBalance(),
    getRecentTransactions(),
    getStatements(),
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
          <button className="mt-5 px-5 py-2.5 rounded-xl bg-white text-stone-900 font-semibold text-sm">
            Pay Now
          </button>
        )}
      </div>

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

      {/* Monthly Statements */}
      <section>
        <h2 className="text-base font-semibold text-stone-900 mb-4">
          Monthly Statements
        </h2>
        <div className="divide-y divide-stone-100">
          {statements.map((statement) => {
            const label = format(statement.periodStart, 'MMMM yyyy')
            const isPaid = statement.closingBalance <= 0
            return (
              <Link
                key={statement.id}
                href={`/portal/statements/${statement.id}`}
                className="flex items-center justify-between py-4 first:pt-0 group active:opacity-70 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 flex-shrink-0">
                    <FileText className="h-5 w-5 text-stone-500" />
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-stone-900">{label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-sm text-stone-500">
                        ฿{statement.closingBalance.toLocaleString()}
                      </p>
                      {isPaid && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                          Paid
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-stone-300 group-hover:text-stone-500 transition-colors flex-shrink-0" />
              </Link>
            )
          })}
          {statements.length === 0 && (
            <p className="text-sm text-stone-400 py-8 text-center">No statements yet</p>
          )}
        </div>
      </section>
    </div>
  )
}
