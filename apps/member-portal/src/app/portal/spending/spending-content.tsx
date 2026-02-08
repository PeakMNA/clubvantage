'use client'

import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, TrendingUp, Receipt } from 'lucide-react'

interface SpendingSummary {
  totalSpent: number
  categories: { name: string; total: number }[]
  months: { month: string; total: number }[]
  recentItems: {
    id: string
    description: string
    amount: number
    category: string
    date: Date
  }[]
  year: number
}

const CATEGORY_COLORS = [
  'bg-amber-500',
  'bg-emerald-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-indigo-500',
]

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function SpendingContent({ summary }: { summary: SpendingSummary }) {
  const router = useRouter()
  const maxMonthly = Math.max(...summary.months.map((m) => m.total), 1)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-stone-100">
        <div className="flex items-center justify-between px-5 py-3 pt-safe">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-50 -ml-1"
          >
            <ArrowLeft className="h-5 w-5 text-stone-700" />
          </button>
          <h1 className="text-base font-semibold text-stone-900">Spending</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-5 py-6 space-y-8 pb-36">
        {/* Total Spent */}
        <div className="rounded-2xl p-5 card-glass shadow-lg shadow-stone-200/30 text-center">
          <p className="text-xs text-stone-500 font-medium">Total Spent in {summary.year}</p>
          <p className="text-3xl font-bold text-stone-900 mt-1 tracking-tight">
            ฿{summary.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>

        {/* Category Breakdown */}
        {summary.categories.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-stone-900 mb-4">By Category</h2>
            <div className="space-y-3">
              {summary.categories.map((cat, i) => {
                const pct = summary.totalSpent > 0 ? (cat.total / summary.totalSpent) * 100 : 0
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`} />
                        <span className="text-sm font-medium text-stone-700">{cat.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-stone-900">
                        ฿{cat.total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Monthly Trend */}
        {summary.months.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-stone-900 mb-4">Monthly Trend</h2>
            <div className="flex items-end gap-2 h-32">
              {summary.months.map((m) => {
                const pct = (m.total / maxMonthly) * 100
                const monthIndex = parseInt(m.month.split('-')[1]!, 10) - 1
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-stone-500">
                      ฿{(m.total / 1000).toFixed(0)}k
                    </span>
                    <div className="w-full flex items-end" style={{ height: '80px' }}>
                      <div
                        className="w-full bg-amber-500 rounded-t-md transition-all duration-500"
                        style={{ height: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-stone-500">
                      {MONTH_NAMES[monthIndex]}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Recent Transactions */}
        {summary.recentItems.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-stone-900 mb-4">Recent Charges</h2>
            <div className="space-y-2">
              {summary.recentItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-stone-100"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-50 flex-shrink-0">
                    <Receipt className="h-5 w-5 text-stone-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-stone-900 line-clamp-1">
                      {item.description}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {item.category} &middot; {format(new Date(item.date), 'MMM d')}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-stone-900 flex-shrink-0">
                    ฿{item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {summary.categories.length === 0 && (
          <div className="text-center py-16">
            <TrendingUp className="h-10 w-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm">No spending data for {summary.year}</p>
          </div>
        )}
      </div>
    </div>
  )
}
