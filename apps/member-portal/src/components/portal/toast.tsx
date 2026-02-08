'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { cn } from '@clubvantage/ui'
import { Check, X, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-24 left-0 right-0 z-[60] flex flex-col items-center gap-2 px-5 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const icons = {
    success: <Check className="h-4 w-4 text-emerald-600" />,
    error: <X className="h-4 w-4 text-red-600" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-600" />,
  }

  const styles = {
    success: 'border-emerald-200 bg-emerald-50',
    error: 'border-red-200 bg-red-50',
    warning: 'border-amber-200 bg-amber-50',
  }

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg max-w-sm w-full',
        'animate-in',
        styles[toast.type]
      )}
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
        {icons[toast.type]}
      </div>
      <p className="text-sm font-medium text-stone-900 flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-full hover:bg-white/50 transition-colors cursor-pointer"
      >
        <X className="h-3.5 w-3.5 text-stone-400" />
      </button>
    </div>
  )
}
