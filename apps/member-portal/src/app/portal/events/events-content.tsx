'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { cn } from '@clubvantage/ui'
import { Calendar, MapPin, Users, Star } from 'lucide-react'

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
}

const CATEGORIES = ['All', 'GOLF', 'SOCIAL', 'DINING', 'FITNESS', 'KIDS']

const CATEGORY_LABELS: Record<string, string> = {
  All: 'All',
  GOLF: 'Golf',
  SOCIAL: 'Social',
  DINING: 'Dining',
  FITNESS: 'Fitness',
  KIDS: 'Kids',
}

export function EventsContent({ events }: { events: EventData[] }) {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? events
    : events.filter((e) => e.category === activeCategory)

  return (
    <div className="px-5 py-6 pb-36">
      <h1 className="text-[22px] font-semibold text-stone-900 mb-5">Events</h1>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto mb-6 -mx-5 px-5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              activeCategory === cat
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600'
            )}
          >
            {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Featured Events */}
      {activeCategory === 'All' && events.some((e) => e.isFeatured) && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-stone-900 mb-3 flex items-center gap-1.5">
            <Star className="h-4 w-4 text-amber-500" />
            Featured
          </h2>
          <div className="flex gap-4 overflow-x-auto -mx-5 px-5">
            {events.filter((e) => e.isFeatured).map((event) => (
              <Link
                key={event.id}
                href={`/portal/events/${event.id}`}
                className="flex-shrink-0 w-72 block group"
              >
                <div className="rounded-xl overflow-hidden bg-stone-100 h-40">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-stone-200 to-stone-100">
                      <Calendar className="h-8 w-8 text-stone-400" />
                    </div>
                  )}
                </div>
                <div className="mt-2.5">
                  <p className="text-[15px] font-semibold text-stone-900 line-clamp-1">
                    {event.title}
                  </p>
                  <p className="text-sm text-stone-500 mt-0.5">
                    {format(new Date(event.startDate), 'EEE, MMM d \u00b7 h:mm a')}
                  </p>
                  {event.price && (
                    <p className="text-sm font-semibold text-stone-900 mt-1">
                      ฿{event.price.toLocaleString()}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Events */}
      <section>
        {activeCategory === 'All' && (
          <h2 className="text-base font-semibold text-stone-900 mb-3">Upcoming</h2>
        )}
        <div className="space-y-4">
          {filtered.map((event) => (
            <Link
              key={event.id}
              href={`/portal/events/${event.id}`}
              className="flex gap-3 py-3 border-b border-stone-50 last:border-0 active:opacity-70 transition-opacity"
            >
              <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-stone-100">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-stone-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-stone-900 line-clamp-1">
                  {event.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Calendar className="h-3.5 w-3.5 text-stone-400" />
                  <p className="text-xs text-stone-500">
                    {format(new Date(event.startDate), 'EEE, MMM d \u00b7 h:mm a')}
                  </p>
                </div>
                {event.location && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-stone-400" />
                    <p className="text-xs text-stone-500">{event.location}</p>
                  </div>
                )}
                <div className="flex items-center gap-3 mt-1">
                  {event.price && (
                    <span className="text-xs font-semibold text-stone-900">
                      ฿{event.price.toLocaleString()}
                    </span>
                  )}
                  {event.spotsLeft !== null && (
                    <span className={cn(
                      'text-xs font-medium',
                      event.spotsLeft <= 5 ? 'text-amber-600' : 'text-stone-500'
                    )}>
                      <Users className="h-3 w-3 inline mr-0.5" />
                      {event.spotsLeft} spots left
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-10 w-10 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500 text-sm">No upcoming events</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
