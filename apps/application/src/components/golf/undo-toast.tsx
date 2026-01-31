'use client'

import { useEffect, useState } from 'react'
import { cn } from '@clubvantage/ui'
import { Undo2, X } from 'lucide-react'

interface UndoToastProps {
  message: string
  onUndo: () => void
  onDismiss: () => void
  autoDismissMs?: number
  className?: string
}

export function UndoToast({
  message,
  onUndo,
  onDismiss,
  autoDismissMs = 5000,
  className,
}: UndoToastProps) {
  const [progress, setProgress] = useState(100)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / autoDismissMs) * 100)
      setProgress(remaining)

      if (remaining === 0) {
        clearInterval(interval)
        handleDismiss()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [autoDismissMs])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss()
    }, 200)
  }

  const handleUndo = () => {
    setIsExiting(true)
    setTimeout(() => {
      onUndo()
    }, 200)
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50',
        'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg',
        'bg-stone-900 dark:bg-stone-800 text-white',
        'transition-all duration-200',
        isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0',
        className
      )}
    >
      {/* Message */}
      <span className="text-sm">{message}</span>

      {/* Undo button */}
      <button
        type="button"
        onClick={handleUndo}
        className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium text-amber-400 hover:bg-white/10 rounded transition-colors"
      >
        <Undo2 className="h-4 w-4" />
        Undo
      </button>

      {/* Close button */}
      <button
        type="button"
        onClick={handleDismiss}
        className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-lg overflow-hidden">
        <div
          className="h-full bg-amber-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
