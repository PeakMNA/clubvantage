'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

interface SuspensionBannerProps {
  daysOverdue: number
}

export function SuspensionBanner({ daysOverdue }: SuspensionBannerProps) {
  return (
    <div className="bg-red-500 text-white px-4 py-3">
      <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Account Suspended</p>
            <p className="text-xs text-red-100">
              Your account is {daysOverdue} days overdue. Some features are restricted.
            </p>
          </div>
        </div>
        <Link
          href="/portal/statements"
          className="flex-shrink-0 px-4 py-1.5 bg-white text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
        >
          Pay Now
        </Link>
      </div>
    </div>
  )
}
