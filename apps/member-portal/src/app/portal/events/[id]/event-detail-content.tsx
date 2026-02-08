'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { cn } from '@clubvantage/ui'
import { ArrowLeft, Calendar, Clock, MapPin, Users, Share2 } from 'lucide-react'
import { registerForEvent, unregisterFromEvent } from '../actions'

interface EventData {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  category: string
  location: string | null
  startDate: Date
  endDate: Date
  capacity: number | null
  price: number | null
  isFeatured: boolean
  registeredCount: number
  spotsLeft: number | null
  isRegistered: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  GOLF: 'Golf',
  SOCIAL: 'Social',
  DINING: 'Dining',
  FITNESS: 'Fitness',
  KIDS: 'Kids',
}

export function EventDetailContent({ event }: { event: EventData }) {
  const router = useRouter()
  const [registered, setRegistered] = useState(event.isRegistered)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  const sameDay = startDate.toDateString() === endDate.toDateString()

  const handleRegister = async () => {
    setLoading(true)
    setError(null)
    const result = await registerForEvent(event.id)
    if (result.success) {
      setRegistered(true)
    } else {
      setError(result.error ?? 'Failed to register')
    }
    setLoading(false)
  }

  const handleUnregister = async () => {
    setLoading(true)
    setError(null)
    const result = await unregisterFromEvent(event.id)
    if (result.success) {
      setRegistered(false)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white pb-36">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-stone-100">
        <div className="flex items-center justify-between px-5 py-3 pt-safe">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-50 -ml-1"
          >
            <ArrowLeft className="h-5 w-5 text-stone-700" />
          </button>
          <h1 className="text-base font-semibold text-stone-900">Event</h1>
          <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-50">
            <Share2 className="h-5 w-5 text-stone-500" />
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="h-48 bg-stone-100">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-stone-200 to-stone-100">
            <Calendar className="h-12 w-12 text-stone-300" />
          </div>
        )}
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* Title & Category */}
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 mb-2">
            {CATEGORY_LABELS[event.category] ?? event.category}
          </span>
          <h2 className="text-xl font-semibold text-stone-900">{event.title}</h2>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-stone-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[15px] text-stone-900">
                {format(startDate, 'EEEE, MMMM d, yyyy')}
              </p>
              {!sameDay && (
                <p className="text-sm text-stone-500">
                  to {format(endDate, 'EEEE, MMMM d, yyyy')}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-stone-400 mt-0.5 flex-shrink-0" />
            <p className="text-[15px] text-stone-900">
              {format(startDate, 'h:mm a')} – {format(endDate, 'h:mm a')}
            </p>
          </div>

          {event.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-stone-400 mt-0.5 flex-shrink-0" />
              <p className="text-[15px] text-stone-900">{event.location}</p>
            </div>
          )}

          {event.capacity && (
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-stone-400 mt-0.5 flex-shrink-0" />
              <p className="text-[15px] text-stone-900">
                {event.registeredCount} / {event.capacity} registered
                {event.spotsLeft !== null && event.spotsLeft <= 10 && (
                  <span className="text-amber-600 ml-1">
                    ({event.spotsLeft} spots left)
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div className="pt-2 border-t border-stone-100">
            <h3 className="text-base font-semibold text-stone-900 mb-2">About</h3>
            <p className="text-[15px] text-stone-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Registered badge */}
        {registered && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700 flex items-center justify-between">
            <span>You are registered for this event</span>
            <button
              onClick={handleUnregister}
              disabled={loading}
              className="text-xs underline text-emerald-600"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {!registered && (
        <div className="fixed bottom-24 left-0 right-0 z-40 px-5 py-4 bg-white border-t border-stone-200 mb-safe">
          <div className="flex items-center justify-between">
            <div>
              {event.price ? (
                <>
                  <p className="text-base font-semibold text-stone-900">
                    \u0e3f{event.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-stone-500">per person</p>
                </>
              ) : (
                <p className="text-base font-semibold text-stone-900">Free</p>
              )}
            </div>
            <button
              onClick={handleRegister}
              disabled={loading || (event.spotsLeft !== null && event.spotsLeft <= 0)}
              className={cn(
                'px-8 py-3 rounded-xl font-semibold text-sm transition-all',
                event.spotsLeft !== null && event.spotsLeft <= 0
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-stone-900 text-white'
              )}
            >
              {loading ? 'Registering...' : event.spotsLeft !== null && event.spotsLeft <= 0 ? 'Full' : 'Register'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
