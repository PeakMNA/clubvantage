'use client'

import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, Share2, Pin, Newspaper } from 'lucide-react'

interface AnnouncementData {
  id: string
  title: string
  body: string
  imageUrl: string | null
  category: string
  isPinned: boolean
  publishedAt: Date | null
}

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: 'General',
  GOLF: 'Golf',
  DINING: 'Dining',
  SOCIAL: 'Social',
  MAINTENANCE: 'Maintenance',
}

export function AnnouncementDetailContent({ announcement }: { announcement: AnnouncementData }) {
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
          <h1 className="text-base font-semibold text-stone-900">News</h1>
          <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-50">
            <Share2 className="h-5 w-5 text-stone-500" />
          </button>
        </div>
      </div>

      {/* Hero Image */}
      {announcement.imageUrl && (
        <div className="h-48 bg-stone-100">
          <img src={announcement.imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="px-5 py-6 space-y-4">
        {/* Category & Date */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600">
            {CATEGORY_LABELS[announcement.category] ?? announcement.category}
          </span>
          {announcement.isPinned && (
            <span className="flex items-center gap-1 text-xs text-amber-600">
              <Pin className="h-3 w-3" /> Pinned
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-stone-900">{announcement.title}</h2>

        {/* Date */}
        {announcement.publishedAt && (
          <p className="text-sm text-stone-500">
            {format(new Date(announcement.publishedAt), 'EEEE, MMMM d, yyyy')}
          </p>
        )}

        {/* Body */}
        <div className="pt-2 border-t border-stone-100">
          <p className="text-[15px] text-stone-700 leading-relaxed whitespace-pre-line">
            {announcement.body}
          </p>
        </div>
      </div>
    </div>
  )
}
