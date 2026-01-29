'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@clubvantage/ui'
import { X, AlertTriangle, Lock, Loader2 } from 'lucide-react'

// ============================================================================
// Cancel Booking Dialog
// ============================================================================

export interface CancelBookingDialogProps {
  isOpen: boolean
  isProcessing?: boolean
  playerNames: string[]
  teeTime: string
  courseName: string
  date: string
  onClose: () => void
  onConfirm: (data: { reason: string; notes?: string }) => void
}

const cancelReasons = [
  { value: '', label: 'Select a reason...' },
  { value: 'member_request', label: 'Member request' },
  { value: 'weather_conditions', label: 'Weather conditions' },
  { value: 'course_maintenance', label: 'Course maintenance' },
  { value: 'staff_cancellation', label: 'Staff cancellation' },
  { value: 'no_show_conversion', label: 'No show conversion' },
  { value: 'other', label: 'Other' },
]

export function CancelBookingDialog({
  isOpen,
  isProcessing = false,
  playerNames,
  teeTime,
  courseName,
  date,
  onClose,
  onConfirm,
}: CancelBookingDialogProps) {
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setReason('')
      setNotes('')
    }
  }, [isOpen])

  // Handle Escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isProcessing) {
        onClose()
      }
    },
    [onClose, isProcessing]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  const handleConfirm = () => {
    if (!reason) return
    onConfirm({
      reason,
      notes: notes.trim() || undefined,
    })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
        onClick={isProcessing ? undefined : onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl dark:shadow-black/40 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-0">
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Cancel Booking</h2>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors -mr-2 -mt-2 disabled:opacity-50"
            >
              <X className="h-5 w-5 text-stone-500 dark:text-stone-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Booking Details */}
            <div className="space-y-3">
              <div>
                <span className="text-sm text-stone-500 dark:text-stone-400">Players</span>
                <div className="mt-1">
                  {playerNames.map((name, index) => (
                    <div key={index} className="text-stone-900 dark:text-stone-100 font-medium">
                      {name}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-stone-500 dark:text-stone-400">Tee Time</span>
                  <div className="text-stone-900 dark:text-stone-100 font-medium">{teeTime}</div>
                </div>
                <div>
                  <span className="text-sm text-stone-500 dark:text-stone-400">Date</span>
                  <div className="text-stone-900 dark:text-stone-100 font-medium">{date}</div>
                </div>
              </div>
              <div>
                <span className="text-sm text-stone-500 dark:text-stone-400">Course</span>
                <div className="text-stone-900 dark:text-stone-100 font-medium">{courseName}</div>
              </div>
            </div>

            {/* Reason Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Cancellation Reason <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isProcessing}
                className={cn(
                  'w-full h-10 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  !reason ? 'text-stone-500 dark:text-stone-400' : 'text-stone-900 dark:text-stone-100'
                )}
              >
                {cancelReasons.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes Textarea */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Notes <span className="text-stone-400 dark:text-stone-500">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isProcessing}
                placeholder="Add any additional notes..."
                rows={3}
                className={cn(
                  'w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'placeholder:text-stone-400 dark:placeholder:text-stone-500'
                )}
              />
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                This action will cancel the booking and notify all players. This cannot be undone.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 pt-0">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                'border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Keep Booking
            </button>
            <button
              onClick={handleConfirm}
              disabled={!reason || isProcessing}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                'bg-red-600 text-white hover:bg-red-700',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center gap-2'
              )}
            >
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
              Cancel Booking
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ============================================================================
// Remove Player Dialog
// ============================================================================

export interface RemovePlayerDialogProps {
  isOpen: boolean
  isProcessing?: boolean
  playerName: string
  remainingPlayers: number
  onClose: () => void
  onConfirm: () => void
}

export function RemovePlayerDialog({
  isOpen,
  isProcessing = false,
  playerName,
  remainingPlayers,
  onClose,
  onConfirm,
}: RemovePlayerDialogProps) {
  // Handle Escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isProcessing) {
        onClose()
      }
    },
    [onClose, isProcessing]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
        onClick={isProcessing ? undefined : onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl dark:shadow-black/40 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-0">
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Remove Player</h2>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors -mr-2 -mt-2 disabled:opacity-50"
            >
              <X className="h-5 w-5 text-stone-500 dark:text-stone-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <p className="text-stone-600 dark:text-stone-400">
              Are you sure you want to remove{' '}
              <span className="font-semibold text-stone-900 dark:text-stone-100">{playerName}</span> from this booking?
            </p>

            <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium">
                {remainingPlayers}
              </span>
              <span>
                {remainingPlayers === 1 ? 'player' : 'players'} will remain in this booking
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 pt-0">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                'border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Keep Player
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                'bg-red-600 text-white hover:bg-red-700',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center gap-2'
              )}
            >
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
              Remove
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ============================================================================
// Release Block Dialog
// ============================================================================

export interface ReleaseBlockDialogProps {
  isOpen: boolean
  isProcessing?: boolean
  blockReason: string
  blockTimeRange: string
  createdBy: string
  createdAt: string
  onClose: () => void
  onConfirm: () => void
}

export function ReleaseBlockDialog({
  isOpen,
  isProcessing = false,
  blockReason,
  blockTimeRange,
  createdBy,
  createdAt,
  onClose,
  onConfirm,
}: ReleaseBlockDialogProps) {
  // Handle Escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isProcessing) {
        onClose()
      }
    },
    [onClose, isProcessing]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
        onClick={isProcessing ? undefined : onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl dark:shadow-black/40 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-stone-100 dark:bg-stone-800">
                <Lock className="h-5 w-5 text-stone-600 dark:text-stone-400" />
              </div>
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Release Block</h2>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors -mr-2 -mt-2 disabled:opacity-50"
            >
              <X className="h-5 w-5 text-stone-500 dark:text-stone-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <p className="text-stone-600 dark:text-stone-400">
              Are you sure you want to release this block? The time slots will become available for booking.
            </p>

            {/* Block Details */}
            <div className="space-y-3 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
              <div>
                <span className="text-sm text-stone-500 dark:text-stone-400">Block Reason</span>
                <div className="text-stone-900 dark:text-stone-100 font-medium">{blockReason}</div>
              </div>
              <div>
                <span className="text-sm text-stone-500 dark:text-stone-400">Time Range</span>
                <div className="text-stone-900 dark:text-stone-100 font-medium">{blockTimeRange}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-stone-500 dark:text-stone-400">Created By</span>
                  <div className="text-stone-900 dark:text-stone-100 font-medium">{createdBy}</div>
                </div>
                <div>
                  <span className="text-sm text-stone-500 dark:text-stone-400">Created At</span>
                  <div className="text-stone-900 dark:text-stone-100 font-medium">{createdAt}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 pt-0">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                'border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Keep Block
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                'bg-emerald-600 text-white hover:bg-emerald-700',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center gap-2'
              )}
            >
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
              Release
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
