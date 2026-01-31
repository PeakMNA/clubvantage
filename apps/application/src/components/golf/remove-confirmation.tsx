'use client'

import { useEffect, useState } from 'react'

interface RemoveConfirmationProps {
  onConfirm: () => void
  onCancel: () => void
  autoCloseMs?: number
}

export function RemoveConfirmation({
  onConfirm,
  onCancel,
  autoCloseMs = 3000,
}: RemoveConfirmationProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / autoCloseMs) * 100)
      setProgress(remaining)

      if (remaining === 0) {
        clearInterval(interval)
        onCancel()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [autoCloseMs, onCancel])

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Remove item?</span>
      <button
        type="button"
        onClick={onConfirm}
        className="px-2 py-0.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded font-medium"
      >
        Yes
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-2 py-0.5 text-muted-foreground hover:bg-muted rounded"
      >
        No
      </button>
      <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-muted-foreground/30 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
