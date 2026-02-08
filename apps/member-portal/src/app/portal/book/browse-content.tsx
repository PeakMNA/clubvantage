'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@clubvantage/ui'
import { Search, Heart } from 'lucide-react'

interface FacilityData {
  id: string
  name: string
  category: string
  description: string | null
  imageUrl: string | null
  capacity: number | null
  amenities: string[]
  memberRate: number
  guestRate: number
  bookingDuration: number | null
  resourceCount: number
}

export function BrowseContent({ facilities }: { facilities: FacilityData[] }) {
  const categories = ['All', ...new Set(facilities.map((f) => f.category))]
  const [activeCategory, setActiveCategory] = useState('All')

  const filteredFacilities =
    activeCategory === 'All'
      ? facilities
      : facilities.filter((f) => f.category === activeCategory)

  return (
    <div className="pb-36">
      {/* Search Bar */}
      <div className="px-5 pt-6 pb-2">
        <button className="w-full flex items-center gap-3 px-5 py-3.5 rounded-full bg-white shadow-md shadow-stone-200/50 border border-stone-100">
          <Search className="h-5 w-5 text-stone-900" />
          <div className="text-left">
            <p className="text-sm font-medium text-stone-900">Search facilities</p>
            <p className="text-xs text-stone-500">Tennis, pool, dining, events...</p>
          </div>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-6 overflow-x-auto px-5 mt-4 border-b border-stone-100">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'pb-3 text-sm font-medium whitespace-nowrap transition-all relative',
              activeCategory === cat
                ? 'text-stone-900'
                : 'text-stone-500'
            )}
          >
            {cat}
            {activeCategory === cat && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Facility Cards */}
      <div className="px-5 pt-5 space-y-8">
        {filteredFacilities.map((facility) => (
          <Link
            key={facility.id}
            href={`/portal/book/calendar?facilityId=${facility.id}`}
            className="block group cursor-pointer"
          >
            {/* Hero Image */}
            <div className="relative rounded-xl overflow-hidden bg-stone-100" style={{ aspectRatio: '4/3' }}>
              {facility.imageUrl ? (
                <Image
                  src={facility.imageUrl}
                  alt={facility.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-stone-400 text-sm">{facility.name}</span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                className="absolute top-3 right-3 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              >
                <Heart className="h-6 w-6 text-white drop-shadow-md transition-transform duration-200 hover:scale-110" strokeWidth={2} />
              </button>
            </div>

            {/* Content */}
            <div className="mt-3">
              <div className="flex items-start justify-between">
                <h3 className="text-[15px] font-semibold text-stone-900">
                  {facility.name}
                </h3>
              </div>
              <p className="text-sm text-stone-500 mt-0.5">{facility.category}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-sm text-stone-500">
                  {facility.resourceCount} {facility.resourceCount === 1 ? 'space' : 'spaces'} available
                </span>
              </div>
              <p className="mt-1.5">
                <span className="text-[15px] font-semibold text-stone-900">
                  ฿{facility.memberRate.toLocaleString()}
                </span>
                <span className="text-sm text-stone-500">
                  {' '}/ {facility.bookingDuration ? `${facility.bookingDuration} min` : 'session'}
                </span>
              </p>
              {facility.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {facility.amenities.slice(0, 3).map((a) => (
                    <span key={a} className="px-2 py-0.5 text-xs text-stone-500 bg-stone-50 rounded-full">
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}

        {filteredFacilities.length === 0 && (
          <div className="text-center py-16">
            <p className="text-stone-500">No facilities in this category</p>
          </div>
        )}
      </div>
    </div>
  )
}
