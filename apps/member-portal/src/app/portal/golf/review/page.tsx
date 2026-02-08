'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@clubvantage/ui'
import { ArrowLeft, Plus, Check } from 'lucide-react'

const players = [
  { id: '1', name: 'James Wilson', label: 'You', badge: 'M', confirmed: true },
  { id: '2', name: 'Sarah Wilson', label: null, badge: 'D', confirmed: true },
  { id: '3', name: 'Tom Guest', label: null, badge: 'G', confirmed: true },
]

const priceBreakdown = [
  { label: 'Green Fee (Member) \u00d7 1', amount: 2400 },
  { label: 'Green Fee (Dependent) \u00d7 1', amount: 1800 },
  { label: 'Guest Fee \u00d7 1', amount: 3200 },
  { label: 'Shared Golf Cart', amount: 800 },
]

export default function ReviewBookingPage() {
  const router = useRouter()
  const [cartEnabled, setCartEnabled] = useState(true)
  const [caddyEnabled, setCaddyEnabled] = useState(false)

  const total = priceBreakdown.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-100">
        <div className="flex items-center gap-4 px-5 py-3">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-50"
          >
            <ArrowLeft className="h-5 w-5 text-stone-600" />
          </button>
          <h1 className="text-lg font-semibold text-stone-900">Review Booking</h1>
        </div>
      </div>

      <div className="px-5 pb-40">
        {/* Booking Summary */}
        <div className="py-5 border-b border-stone-100 text-center">
          <p className="text-sm text-stone-500">Championship Course</p>
          <p className="text-3xl font-bold text-stone-900 mt-1">7:30 AM</p>
          <p className="text-sm text-stone-500 mt-1">Saturday, Feb 8, 2026</p>
        </div>

        {/* Players Section */}
        <div className="py-5 border-b border-stone-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-stone-900">
              Players (3 of 4)
            </h3>
            <button className="text-sm font-medium text-stone-500">
              + Add Player
            </button>
          </div>
          <div className="space-y-3">
            {players.map((player) => (
              <div key={player.id} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white">
                  <span className="text-sm font-semibold">
                    {player.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-medium text-stone-900">
                    {player.name}
                    {player.label && (
                      <span className="text-stone-500"> ({player.label})</span>
                    )}
                  </p>
                  <p className="text-xs text-stone-500">
                    {player.badge === 'M' ? 'Member' : player.badge === 'D' ? 'Dependent' : 'Guest'}
                  </p>
                </div>
                {player.confirmed && (
                  <Check className="h-5 w-5 text-emerald-500" />
                )}
              </div>
            ))}
            {/* Empty slot */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-stone-300">
                <Plus className="h-4 w-4 text-stone-400" />
              </div>
              <p className="text-[15px] text-stone-400">Add player</p>
            </div>
          </div>
        </div>

        {/* Cart & Caddy */}
        <div className="py-5 border-b border-stone-100">
          <h3 className="text-base font-semibold text-stone-900 mb-4">
            Cart & Caddy
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[15px] text-stone-900">Golf Cart</span>
                {cartEnabled && (
                  <p className="text-xs text-stone-500 mt-0.5">
                    Shared Cart &middot; ฿800
                  </p>
                )}
              </div>
              <button
                onClick={() => setCartEnabled(!cartEnabled)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors',
                  cartEnabled ? 'bg-stone-900' : 'bg-stone-300'
                )}
              >
                <div
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    cartEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-stone-900">Caddy</span>
              <button
                onClick={() => setCaddyEnabled(!caddyEnabled)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors',
                  caddyEnabled ? 'bg-stone-900' : 'bg-stone-300'
                )}
              >
                <div
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    caddyEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="py-5">
          <h3 className="text-base font-semibold text-stone-900 mb-3">Price details</h3>
          <div className="space-y-2.5">
            {priceBreakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-[15px]">
                <span className="text-stone-500">{item.label}</span>
                <span className="text-stone-900">
                  ฿{item.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
            <span className="text-base font-semibold text-stone-900">Total</span>
            <span className="text-base font-semibold text-stone-900">
              ฿{total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom CTA - Airbnb style */}
      <div className="fixed bottom-24 left-0 right-0 z-40 px-5 py-4 bg-white border-t border-stone-200 mb-safe">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-stone-900">
              ฿{total.toLocaleString()}
            </p>
            <p className="text-xs text-stone-500 underline">3 players</p>
          </div>
          <button
            className="px-8 py-3 rounded-xl font-semibold text-sm bg-stone-900 text-white"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  )
}
