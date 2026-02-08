'use client'

import { useState, useEffect } from 'react'
import { cn } from '@clubvantage/ui'
import { Zap, Bell, WifiOff, X } from 'lucide-react'

const benefits = [
  {
    icon: Zap,
    text: 'Instant access from your home screen',
  },
  {
    icon: Bell,
    text: 'Push notifications for bookings & updates',
  },
  {
    icon: WifiOff,
    text: 'Works offline \u2014 view your Member ID anytime',
  },
]

interface InstallPromptProps {
  isOpen: boolean
  onClose: () => void
  onInstall: () => void
}

export function InstallPrompt({ isOpen, onClose, onInstall }: InstallPromptProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Small delay for entrance animation
      requestAnimationFrame(() => setIsAnimating(true))
    } else {
      setIsAnimating(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl transition-transform duration-300 ease-out pb-safe',
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-stone-300" />
        </div>

        <div className="px-6 pb-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100"
          >
            <X className="h-5 w-5 text-stone-400" />
          </button>

          {/* Logo */}
          <div className="flex justify-center mb-4 mt-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/25">
              <span className="text-lg font-bold text-white">RC</span>
            </div>
          </div>

          {/* Title & Subtitle */}
          <h2 className="text-xl font-semibold text-stone-900 text-center">
            Add Royal Club to Home Screen
          </h2>
          <p className="text-sm text-stone-600 text-center mt-2 max-w-xs mx-auto">
            Get quick access to tee times, bookings, and your member ID
          </p>

          {/* Benefits */}
          <div className="space-y-4 mt-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div key={benefit.text} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 flex-shrink-0">
                    <Icon className="h-5 w-5 text-amber-600" />
                  </div>
                  <p className="text-sm text-stone-700">{benefit.text}</p>
                </div>
              )
            })}
          </div>

          {/* Buttons */}
          <div className="mt-8 space-y-3">
            <button
              onClick={onInstall}
              className={cn(
                'w-full h-[52px] rounded-xl font-semibold text-base transition-all',
                'bg-amber-500 text-white hover:bg-amber-600',
                'shadow-lg shadow-amber-500/25'
              )}
            >
              Add to Home Screen
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-sm font-medium text-stone-500"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
