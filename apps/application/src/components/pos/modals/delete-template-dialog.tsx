'use client'

import { useState, useCallback } from 'react'
import { cn, Button } from '@clubvantage/ui'
import { AlertTriangle, X, Loader2, Layout } from 'lucide-react'

export interface DeleteTemplateDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  templateName: string
  outletCount?: number
  className?: string
}

/**
 * DeleteTemplateDialog
 *
 * A confirmation dialog for deleting POS templates.
 * Shows warnings about outlets using the template.
 */
export function DeleteTemplateDialog({
  isOpen,
  onClose,
  onConfirm,
  templateName,
  outletCount = 0,
  className,
}: DeleteTemplateDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = useCallback(async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setIsDeleting(false)
    }
  }, [onConfirm, onClose])

  const handleClose = useCallback(() => {
    if (!isDeleting) {
      onClose()
    }
  }, [isDeleting, onClose])

  const canDelete = outletCount === 0

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-gradient-to-br from-stone-900/60 to-stone-950/80 backdrop-blur-sm"
        onClick={handleClose}
        style={{ animation: 'fadeIn 0.15s ease-out' }}
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-2xl',
          'ring-1 ring-black/5',
          className
        )}
        style={{ animation: 'scaleIn 0.2s ease-out' }}
      >
        {/* Danger accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-red-400 via-red-500 to-rose-500" />

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-stone-900">Delete Template?</h3>
              <p className="mt-1 text-sm text-stone-500">
                You are about to delete <span className="font-medium text-stone-700">{templateName}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Warning/Info Box */}
          {!canDelete ? (
            <div className="mt-5 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200/50">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                  <Layout className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-800">Template in use</p>
                  <p className="mt-1 text-sm text-amber-700">
                    This template is currently assigned to{' '}
                    <span className="font-semibold">{outletCount} outlet{outletCount !== 1 ? 's' : ''}</span>.
                    You must unassign or reassign these outlets before deleting this template.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-stone-50 p-4 ring-1 ring-stone-200/50">
              <p className="text-sm text-stone-600">
                This action cannot be undone. The template and all its configuration will be permanently removed.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-stone-100 bg-stone-50/50 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="min-w-[90px]"
          >
            Cancel
          </Button>
          {canDelete ? (
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="min-w-[100px] bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          ) : (
            <Button
              type="button"
              disabled
              className="min-w-[100px] cursor-not-allowed bg-stone-200 text-stone-500"
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  )
}
