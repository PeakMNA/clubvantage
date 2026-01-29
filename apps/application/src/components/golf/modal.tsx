'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { cn } from '@clubvantage/ui'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className={cn(
            'w-full bg-white rounded-2xl shadow-2xl shadow-stone-900/20 flex flex-col max-h-[85vh]',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            sizeClasses[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative border-b border-stone-100 bg-gradient-to-b from-stone-50 to-white px-6 pb-4 pt-5">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-stone-900">{title}</h2>
              {subtitle && (
                typeof subtitle === 'string'
                  ? <p className="mt-1.5 text-sm text-stone-500">{subtitle}</p>
                  : subtitle
              )}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex justify-end gap-3 border-t border-stone-100 bg-stone-50/50 px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
