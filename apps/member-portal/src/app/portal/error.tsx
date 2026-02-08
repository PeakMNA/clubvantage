'use client'

import { AlertTriangle } from 'lucide-react'

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-4">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-lg font-semibold text-stone-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-stone-500 text-center mb-6 max-w-xs">
        We couldn&apos;t load this page. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-xl text-sm font-semibold bg-stone-900 text-white"
      >
        Try Again
      </button>
    </div>
  )
}
