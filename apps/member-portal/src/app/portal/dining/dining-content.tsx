'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import {
  ArrowLeft,
  UtensilsCrossed,
  Clock,
  Users,
  ChevronRight,
  CalendarDays,
  MapPin,
} from 'lucide-react'

interface DiningVenue {
  id: string
  name: string
  code: string
  description: string | null
  imageUrl: string | null
  capacity: number | null
  amenities: string[]
  bookingDuration: number
  maxAdvanceDays: number
  operatingHours: Record<string, { open: string; close: string }>
  tableCount: number
}

interface DiningReservation {
  id: string
  bookingNumber: string
  status: string
  startTime: Date
  endTime: Date
  guestCount: number
  tableName: string
  venueName: string
  venueImage: string | null
}

function getTodayHours(hours: Record<string, { open: string; close: string }>): string | null {
  const days: string[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const today = days[new Date().getDay()] as string
  const entry = hours[today]
  if (!entry) return null
  return `${entry.open} – ${entry.close}`
}

function formatAmenity(a: string): string {
  return a
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function DiningContent({
  venues,
  reservations,
}: {
  venues: DiningVenue[]
  reservations: DiningReservation[]
}) {
  const router = useRouter()
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-stone-100">
        <div className="flex items-center justify-between px-5 py-3 pt-safe">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-50 -ml-1"
          >
            <ArrowLeft className="h-5 w-5 text-stone-700" />
          </button>
          <h1 className="text-base font-semibold text-stone-900">Dining</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-5 py-6 pb-36">
        {/* Intro */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-900 flex-shrink-0">
            <UtensilsCrossed className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Club Dining</h2>
            <p className="text-sm text-stone-500">Reserve a table at our restaurants</p>
          </div>
        </div>

        {/* Upcoming Reservations */}
        {reservations.length > 0 && (
          <section className="mb-8">
            <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-3">
              Upcoming Reservations
            </h3>
            <div className="space-y-2">
              {reservations.map((r) => (
                <Link
                  key={r.id}
                  href={`/portal/bookings/${r.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-stone-100 active:opacity-70 transition-opacity"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 flex-shrink-0">
                    <UtensilsCrossed className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-stone-900">
                      {r.venueName}
                    </p>
                    <p className="text-sm text-stone-500 mt-0.5">
                      {format(new Date(r.startTime), 'EEE, MMM d')} &middot; {format(new Date(r.startTime), 'h:mm a')} &middot; {r.guestCount + 1} guests
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-stone-300 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Venues */}
        <section>
          <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-3">
            Restaurants
          </h3>
          {venues.length === 0 ? (
            <div className="text-center py-12">
              <UtensilsCrossed className="h-10 w-10 text-stone-200 mx-auto mb-3" />
              <p className="text-sm text-stone-400">No dining venues available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {venues.map((venue) => {
                const todayHours = getTodayHours(venue.operatingHours)
                const isExpanded = selectedVenue === venue.id

                return (
                  <div
                    key={venue.id}
                    className="rounded-2xl overflow-hidden border border-stone-100"
                  >
                    {/* Venue Image */}
                    <div className="relative h-44 bg-stone-100">
                      {venue.imageUrl ? (
                        <Image
                          src={venue.imageUrl}
                          alt={venue.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-200 to-stone-100">
                          <UtensilsCrossed className="h-10 w-10 text-stone-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className="text-white font-semibold text-lg">{venue.name}</h4>
                      </div>
                    </div>

                    {/* Venue Info */}
                    <div className="p-4">
                      {venue.description && (
                        <p className="text-sm text-stone-600 mb-3">{venue.description}</p>
                      )}

                      <div className="flex flex-wrap gap-3 text-xs text-stone-500 mb-4">
                        {todayHours && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Today: {todayHours}
                          </span>
                        )}
                        {venue.capacity && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {venue.capacity} seats
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {venue.tableCount} tables
                        </span>
                      </div>

                      {/* Amenities */}
                      {venue.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {venue.amenities.map((a) => (
                            <span
                              key={a}
                              className="text-[11px] font-medium text-stone-500 bg-stone-50 px-2 py-1 rounded-full"
                            >
                              {formatAmenity(a)}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Reserve Button */}
                      <Link
                        href={`/portal/book/calendar?facilityId=${venue.id}`}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-stone-900 text-white text-sm font-semibold active:opacity-80 transition-opacity"
                      >
                        <CalendarDays className="h-4 w-4" />
                        Reserve a Table
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
