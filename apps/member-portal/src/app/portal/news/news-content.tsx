'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@clubvantage/ui'
import { Pin, Newspaper } from 'lucide-react'

interface AnnouncementData {
  id: string
  title: string
  body: string
  imageUrl: string | null
  category: string
  isPinned: boolean
  publishedAt: Date
}

const CATEGORIES = ['All', 'GENERAL', 'GOLF', 'DINING', 'SOCIAL', 'MAINTENANCE']

const CATEGORY_LABELS: Record<string, string> = {
  All: 'All',
  GENERAL: 'General',
  GOLF: 'Golf',
  DINING: 'Dining',
  SOCIAL: 'Social',
  MAINTENANCE: 'Maintenance',
}

export function NewsContent({ announcements }: { announcements: AnnouncementData[] }) {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? announcements
    : announcements.filter((a) => a.category === activeCategory)

  return (
    <div className="px-5 py-6 pb-36">
      <h1 className="text-[22px] font-semibold text-stone-900 mb-5">News & Updates</h1>

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

      {/* Announcements */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <Link
            key={item.id}
            href={`/portal/news/${item.id}`}
            className="block rounded-xl border border-stone-100 p-4 active:opacity-70 transition-opacity"
          >
            <div className="flex items-start gap-3">
              {item.imageUrl ? (
                <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-stone-100">
                  <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-stone-50 flex items-center justify-center">
                  <Newspaper className="h-5 w-5 text-stone-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {item.isPinned && (
                    <Pin className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                  )}
                  <p className="text-[15px] font-medium text-stone-900 line-clamp-1">
                    {item.title}
                  </p>
                </div>
                <p className="text-sm text-stone-500 line-clamp-2 mt-0.5">
                  {item.body}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-medium text-stone-500 bg-stone-50 px-1.5 py-0.5 rounded">
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </span>
                  <span className="text-xs text-stone-400">
                    {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Newspaper className="h-10 w-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm">No news in this category</p>
          </div>
        )}
      </div>
    </div>
  )
}
