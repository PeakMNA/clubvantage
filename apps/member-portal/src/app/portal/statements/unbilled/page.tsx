import type { Metadata } from 'next'
import Link from 'next/link'
import { format } from 'date-fns'
import { cn } from '@clubvantage/ui'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { getUnbilledActivity } from '@/lib/data'
import { UnbilledCategoryList } from './unbilled-content'

export const metadata: Metadata = {
  title: 'Unbilled Activity | Member Portal',
}

export default async function UnbilledActivityPage() {
  const activity = await getUnbilledActivity()

  return (
    <div className="px-5 py-6 pb-36 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/portal/statements"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 active:bg-stone-200 dark:active:bg-stone-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-stone-600 dark:text-stone-400" />
        </Link>
        <div>
          <h1 className="text-[22px] font-semibold text-stone-900 dark:text-stone-100">Unbilled Activity</h1>
          {activity.sinceDate && (
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Since last close: {format(activity.sinceDate, 'MMM d, yyyy')}
            </p>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      {activity.categories.length > 0 ? (
        <UnbilledCategoryList categories={activity.categories} />
      ) : (
        <div className="rounded-xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 text-center">
          <p className="text-sm text-stone-400 dark:text-stone-500">No unbilled charges</p>
        </div>
      )}

      {/* Payments Received */}
      {activity.payments.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-3">Payments Received</h2>
          <div className="rounded-xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 divide-y divide-stone-100 dark:divide-stone-800">
            {activity.payments.map((payment) => (
              <div key={payment.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/20 flex-shrink-0">
                  <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                    {payment.description}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{format(payment.date, 'MMM d')}</p>
                </div>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  -฿{payment.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Net Unbilled Total */}
      <div className="rounded-xl border-2 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">Net Unbilled</p>
          <p
            className={cn(
              'text-xl font-bold tracking-tight',
              activity.netUnbilled > 0 ? 'text-stone-900 dark:text-stone-100' : 'text-emerald-600 dark:text-emerald-400'
            )}
          >
            ฿{activity.netUnbilled.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Pay Now CTA */}
      {activity.netUnbilled > 0 && (
        <Link
          href="/portal/pay"
          className="block w-full rounded-xl bg-amber-600 px-5 py-3.5 text-center text-sm font-semibold text-white active:bg-amber-700 transition-colors"
        >
          Pay Now
        </Link>
      )}
    </div>
  )
}
