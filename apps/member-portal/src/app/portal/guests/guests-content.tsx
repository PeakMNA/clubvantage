'use client'

import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Users,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
} from 'lucide-react'

interface GuestEntry {
  id: string
  name: string
  email: string | null
  phone: string | null
  venue: string | null
  visitDate: Date | null
  createdAt: Date
}

interface GuestStats {
  totalGuests: number
  thisMonthGuests: number
}

export function GuestsContent({
  guests,
  stats,
}: {
  guests: GuestEntry[]
  stats: GuestStats
}) {
  const router = useRouter()

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
          <h1 className="text-base font-semibold text-stone-900">Guests</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-5 py-6 pb-36">
        {/* Intro */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-900 flex-shrink-0">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Guest History</h2>
            <p className="text-sm text-stone-500">Guests you&apos;ve brought to the club</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="rounded-xl bg-stone-50 p-4">
            <p className="text-2xl font-bold text-stone-900">{stats.totalGuests}</p>
            <p className="text-xs text-stone-500 mt-0.5">Total Guests</p>
          </div>
          <div className="rounded-xl bg-stone-50 p-4">
            <p className="text-2xl font-bold text-stone-900">{stats.thisMonthGuests}</p>
            <p className="text-xs text-stone-500 mt-0.5">This Month</p>
          </div>
        </div>

        {/* Guest List */}
        {guests.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-12 w-12 text-stone-200 mx-auto mb-3" />
            <p className="text-sm text-stone-400">No guests yet</p>
            <p className="text-xs text-stone-400 mt-1">
              Guests are automatically tracked when you book with them
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {guests.map((guest) => (
              <div
                key={guest.id}
                className="rounded-xl border border-stone-100 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 flex-shrink-0">
                    <User className="h-5 w-5 text-stone-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-stone-900">
                      {guest.name}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                      {guest.email && (
                        <span className="flex items-center gap-1 text-xs text-stone-500">
                          <Mail className="h-3 w-3" />
                          {guest.email}
                        </span>
                      )}
                      {guest.phone && (
                        <span className="flex items-center gap-1 text-xs text-stone-500">
                          <Phone className="h-3 w-3" />
                          {guest.phone}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      {guest.venue && (
                        <span className="flex items-center gap-1 text-xs text-stone-400">
                          <MapPin className="h-3 w-3" />
                          {guest.venue}
                        </span>
                      )}
                      {guest.visitDate && (
                        <span className="flex items-center gap-1 text-xs text-stone-400">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(guest.visitDate), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Policy Note */}
        <div className="mt-8 rounded-xl bg-stone-50 p-4">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Guest Policy
          </p>
          <p className="text-sm text-stone-600">
            Members may bring up to 3 guests per visit. Guest fees vary by facility.
            Please register guests when making your booking.
          </p>
        </div>
      </div>
    </div>
  )
}
