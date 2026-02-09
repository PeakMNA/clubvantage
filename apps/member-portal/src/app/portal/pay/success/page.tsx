import type { Metadata } from 'next'
import Link from 'next/link'
import { format } from 'date-fns'
import { CheckCircle2, Download, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Payment Successful | Member Portal',
}

export default function PaymentSuccessPage() {
  return (
    <div className="px-5 py-6 pb-36">
      <div className="flex flex-col items-center text-center py-12 space-y-6">
        {/* Success Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/20">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
        </div>

        {/* Message */}
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Payment Successful</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">
            Your payment has been processed successfully.
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            {format(new Date(), 'MMMM d, yyyy')}
          </p>
        </div>

        {/* Info */}
        <div className="rounded-xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 w-full max-w-sm text-left">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            A receipt has been sent to your email. Your account balance will be updated shortly.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <Link
            href="/portal/statements"
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white active:bg-amber-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Statements
          </Link>
        </div>
      </div>
    </div>
  )
}
