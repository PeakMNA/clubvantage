'use client'

import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  MessageSquare,
} from 'lucide-react'

interface ClubData {
  name: string
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
}

const OPERATING_HOURS = [
  { day: 'Monday – Friday', hours: '6:00 AM – 9:00 PM' },
  { day: 'Saturday', hours: '5:30 AM – 9:00 PM' },
  { day: 'Sunday', hours: '5:30 AM – 8:00 PM' },
  { day: 'Public Holidays', hours: '6:00 AM – 8:00 PM' },
]

export function ContactContent({ club }: { club: ClubData }) {
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
          <h1 className="text-base font-semibold text-stone-900">Contact Club</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-5 py-6 pb-36">
        {/* Club Name */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-900 flex-shrink-0">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900">{club.name}</h2>
            <p className="text-sm text-stone-500">We&apos;re here to help</p>
          </div>
        </div>

        {/* Contact Details */}
        <section className="mb-8">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">
            Contact Information
          </p>
          <div className="space-y-4">
            {club.phone && (
              <a
                href={`tel:${club.phone}`}
                className="flex items-center gap-3 py-3 border-b border-stone-50 active:opacity-70 transition-opacity"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 flex-shrink-0">
                  <Phone className="h-5 w-5 text-stone-500" />
                </div>
                <div>
                  <p className="text-[15px] font-medium text-stone-900">{club.phone}</p>
                  <p className="text-xs text-stone-500">Tap to call</p>
                </div>
              </a>
            )}

            {club.email && (
              <a
                href={`mailto:${club.email}`}
                className="flex items-center gap-3 py-3 border-b border-stone-50 active:opacity-70 transition-opacity"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 flex-shrink-0">
                  <Mail className="h-5 w-5 text-stone-500" />
                </div>
                <div>
                  <p className="text-[15px] font-medium text-stone-900">{club.email}</p>
                  <p className="text-xs text-stone-500">Tap to email</p>
                </div>
              </a>
            )}

            {club.website && (
              <a
                href={club.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-3 border-b border-stone-50 active:opacity-70 transition-opacity"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 flex-shrink-0">
                  <Globe className="h-5 w-5 text-stone-500" />
                </div>
                <div>
                  <p className="text-[15px] font-medium text-stone-900">{club.website}</p>
                  <p className="text-xs text-stone-500">Visit website</p>
                </div>
              </a>
            )}

            {club.address && (
              <div className="flex items-start gap-3 py-3 border-b border-stone-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 flex-shrink-0">
                  <MapPin className="h-5 w-5 text-stone-500" />
                </div>
                <div>
                  <p className="text-[15px] font-medium text-stone-900 whitespace-pre-line">{club.address}</p>
                  <p className="text-xs text-stone-500 mt-0.5">Club address</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Operating Hours */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-stone-500" />
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Operating Hours
            </p>
          </div>
          <div className="space-y-3">
            {OPERATING_HOURS.map((entry) => (
              <div key={entry.day} className="flex items-center justify-between">
                <span className="text-[15px] text-stone-900">{entry.day}</span>
                <span className="text-sm text-stone-500">{entry.hours}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {club.phone && (
            <a
              href={`tel:${club.phone}`}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-900 text-white text-sm font-semibold"
            >
              <Phone className="h-4 w-4" />
              Call Now
            </a>
          )}
          {club.email && (
            <a
              href={`mailto:${club.email}`}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-200 text-stone-700 text-sm font-medium"
            >
              <Mail className="h-4 w-4" />
              Send Email
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
