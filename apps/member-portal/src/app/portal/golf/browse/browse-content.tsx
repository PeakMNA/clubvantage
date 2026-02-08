'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@clubvantage/ui'
import { ArrowLeft, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { format, addDays } from 'date-fns'

interface CourseData {
  id: string
  name: string
  holes: number
  par: number
  imageUrl: string | null
}

interface TimeSlotData {
  id: string
  time: string
  spotsBooked: number
  maxSpots: number
  price: number
  status: string
}

const generateDates = () =>
  Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i)
    return {
      key: format(date, 'yyyy-MM-dd'),
      day: format(date, 'EEE'),
      number: format(date, 'd'),
      isToday: i === 0,
    }
  })

export function BrowseContent({
  courses,
  initialSlots,
  initialDate,
}: {
  courses: CourseData[]
  initialSlots: TimeSlotData[]
  initialDate: string
}) {
  const dates = generateDates()
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [timeSlots, setTimeSlots] = useState(initialSlots)
  const selectedCourse = courses[0]

  // Group slots into morning/afternoon
  const morningSlots = timeSlots.filter((s) => {
    const hour = parseInt(s.time.split(':')[0] ?? '0')
    return hour < 12
  })
  const afternoonSlots = timeSlots.filter((s) => {
    const hour = parseInt(s.time.split(':')[0] ?? '0')
    return hour >= 12
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-100">
        <div className="flex items-center justify-between px-5 py-3">
          <Link
            href="/portal/golf"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-50 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-stone-600" />
          </Link>
          <h1 className="text-lg font-semibold text-stone-900">Book Tee Time</h1>
          <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-50 cursor-pointer">
            <SlidersHorizontal className="h-5 w-5 text-stone-600" />
          </button>
        </div>

        {/* Date Selector */}
        <div className="flex gap-2 px-5 pb-4 overflow-x-auto">
          {dates.map((d) => (
            <button
              key={d.key}
              onClick={() => setSelectedDate(d.key)}
              className={cn(
                'flex flex-col items-center min-w-[52px] py-2.5 px-3 rounded-xl transition-all',
                selectedDate === d.key
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-50'
              )}
            >
              <span className="text-[11px] font-medium">{d.day}</span>
              <span className="text-lg font-bold leading-tight">{d.number}</span>
              {d.isToday && (
                <div
                  className={cn(
                    'h-1 w-1 rounded-full mt-0.5',
                    selectedDate === d.key ? 'bg-white' : 'bg-stone-900'
                  )}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Course Hero */}
      <div className="relative h-44 overflow-hidden bg-stone-200">
        {selectedCourse?.imageUrl ? (
          <Image
            src={selectedCourse.imageUrl}
            alt={selectedCourse.name}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-200 to-stone-100">
            <span className="text-stone-400 text-sm">{selectedCourse?.name}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
      </div>

      <div className="px-5 py-4 space-y-6">
        {/* Course Selector */}
        {selectedCourse && (
          <button className="w-full flex items-center justify-between">
            <div>
              <p className="text-[15px] font-semibold text-stone-900">{selectedCourse.name}</p>
              <p className="text-sm text-stone-500">{selectedCourse.holes} Holes &middot; Par {selectedCourse.par}</p>
            </div>
            <ChevronDown className="h-5 w-5 text-stone-400" />
          </button>
        )}

        {/* Morning Slots */}
        {morningSlots.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
              Morning
            </p>
            <div className="divide-y divide-stone-100">
              {morningSlots.map((slot) => (
                <SlotCard key={slot.id} slot={slot} />
              ))}
            </div>
          </div>
        )}

        {/* Afternoon Slots */}
        {afternoonSlots.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
              Afternoon
            </p>
            <div className="divide-y divide-stone-100">
              {afternoonSlots.map((slot) => (
                <SlotCard key={slot.id} slot={slot} />
              ))}
            </div>
          </div>
        )}

        {timeSlots.length === 0 && (
          <div className="text-center py-12">
            <p className="text-stone-500">No tee times available for this date</p>
          </div>
        )}
      </div>
    </div>
  )
}

function SlotCard({ slot }: { slot: TimeSlotData }) {
  if (slot.status === 'BLOCKED') {
    return (
      <div className="flex items-center gap-4 py-4">
        <p className="text-[15px] font-semibold text-stone-300">{slot.time}</p>
        <p className="text-sm text-stone-300">Blocked</p>
      </div>
    )
  }

  const isFull = slot.spotsBooked >= slot.maxSpots
  const available = slot.maxSpots - slot.spotsBooked

  return (
    <div
      className={cn(
        'flex items-center gap-4 py-4',
        isFull && 'opacity-50'
      )}
    >
      {/* Time */}
      <p className={cn('text-[15px] font-semibold min-w-[80px]', isFull ? 'text-stone-400' : 'text-stone-900')}>
        {slot.time}
      </p>

      {/* Player Dots */}
      <div className="flex-1">
        <div className="flex gap-1.5 mb-1">
          {Array.from({ length: slot.maxSpots }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2.5 w-2.5 rounded-full',
                i < slot.spotsBooked
                  ? 'bg-stone-300'
                  : 'ring-1.5 ring-stone-900 ring-inset bg-transparent'
              )}
            />
          ))}
        </div>
        <p className="text-xs text-stone-500">
          {isFull ? 'Full' : `${available} of ${slot.maxSpots} spots`}
        </p>
      </div>

      {/* Price + Book */}
      <div className="text-right">
        {!isFull && (
          <>
            <p className="text-[15px] font-semibold text-stone-900">
              ฿{slot.price.toLocaleString()}
            </p>
            <Link
              href={`/portal/golf/book?time=${encodeURIComponent(slot.time)}`}
              className="inline-block mt-1 px-4 py-1.5 text-xs font-semibold rounded-full bg-stone-900 text-white transition-colors hover:bg-stone-800 cursor-pointer"
            >
              Book
            </Link>
          </>
        )}
        {isFull && (
          <p className="text-xs text-stone-400 font-medium">Full</p>
        )}
      </div>
    </div>
  )
}
