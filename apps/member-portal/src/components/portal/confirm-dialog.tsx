'use client'

import { cn } from '@clubvantage/ui'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm mx-4 mb-8 sm:mb-0 rounded-2xl bg-white shadow-2xl animate-in p-6">
        <div className="flex flex-col items-center text-center">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full mb-4',
              variant === 'danger' ? 'bg-red-50' : 'bg-amber-50'
            )}
          >
            <AlertTriangle
              className={cn(
                'h-6 w-6',
                variant === 'danger' ? 'text-red-600' : 'text-amber-600'
              )}
            />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 tracking-tight">{title}</h3>
          <p className="text-sm text-stone-500 mt-2">{description}</p>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer',
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-amber-600 hover:bg-amber-700'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
