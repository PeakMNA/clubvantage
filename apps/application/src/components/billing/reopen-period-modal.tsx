'use client'

import { useState } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@clubvantage/ui'

export interface ReopenPeriodModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  periodLabel: string
  onSubmit: (reason: string) => Promise<void>
  isSubmitting: boolean
}

export function ReopenPeriodModal({
  open,
  onOpenChange,
  periodLabel,
  onSubmit,
  isSubmitting,
}: ReopenPeriodModalProps) {
  const [reason, setReason] = useState('')

  if (!open) return null

  const handleSubmit = async () => {
    if (!reason.trim()) return
    await onSubmit(reason.trim())
    setReason('')
    onOpenChange(false)
  }

  const handleClose = () => {
    setReason('')
    onOpenChange(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-stone-900 rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Reopen Period
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {periodLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Reopening a period unlocks it for additional transactions. Existing statements will not be deleted.
            </p>
          </div>

          <div>
            <label
              htmlFor="reopen-reason"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
            >
              Reason for reopening <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reopen-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g., Late invoice adjustment, payment correction..."
              className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-700 flex justify-end gap-3">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Reopen Period
          </Button>
        </div>
      </div>
    </div>
  )
}
