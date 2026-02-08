'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@clubvantage/ui'
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus, Check } from 'lucide-react'
import { getAvailableSlots, createBookingAction } from './actions'

interface FacilityData {
  id: string
  name: string
  code: string
  category: string
  description: string | null
  imageUrl: string | null
  capacity: number | null
  amenities: string[]
  memberRate: number
  guestRate: number
  bookingDuration: number
  maxAdvanceDays: number
  operatingHours: Record<string, { open: string; close: string }>
  resources: { id: string; name: string }[]
}

interface TimeSlotResult {
  time: string
  available: boolean
}

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days: { day: number; isToday: boolean; isPast: boolean }[] = []

  // Empty cells for days before the 1st
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: 0, isToday: false, isPast: true })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    days.push({
      day: d,
      isToday: date.getTime() === today.getTime(),
      isPast: date < today,
    })
  }

  return days
}

function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function CalendarContent({ facility }: { facility: FacilityData }) {
  const router = useRouter()
  const now = new Date()

  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [duration, setDuration] = useState(1)
  const [timeSlots, setTimeSlots] = useState<TimeSlotResult[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [booking, setBooking] = useState(false)
  const [bookingResult, setBookingResult] = useState<{ success: boolean; bookingId?: string; error?: string } | null>(null)

  const maxDuration = Math.min(4, Math.floor(facility.bookingDuration > 0 ? 240 / facility.bookingDuration : 4))
  const pricePerHour = facility.memberRate
  const totalPrice = pricePerHour * duration

  const calendarDays = getCalendarDays(currentYear, currentMonth)

  // Limit to maxAdvanceDays from today
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + facility.maxAdvanceDays)

  const loadSlots = useCallback(async (day: number) => {
    setLoadingSlots(true)
    setSelectedTime(null)
    const dateStr = formatDateStr(currentYear, currentMonth, day)
    const slots = await getAvailableSlots(facility.id, dateStr)
    setTimeSlots(slots)
    setLoadingSlots(false)
  }, [currentYear, currentMonth, facility.id])

  useEffect(() => {
    if (selectedDay) {
      loadSlots(selectedDay)
    }
  }, [selectedDay, loadSlots])

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDay(null)
    setTimeSlots([])
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDay(null)
    setTimeSlots([])
  }

  const isDaySelectable = (day: number) => {
    if (day === 0) return false
    const date = new Date(currentYear, currentMonth, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today && date <= maxDate
  }

  const handleBook = async () => {
    if (!selectedDay || !selectedTime) return
    setBooking(true)
    setBookingResult(null)
    const dateStr = formatDateStr(currentYear, currentMonth, selectedDay)
    const result = await createBookingAction({
      facilityId: facility.id,
      date: dateStr,
      time: selectedTime,
      durationHours: duration,
    })
    setBookingResult(result)
    setBooking(false)

    if (result.success && result.bookingId) {
      router.push(`/portal/bookings/${result.bookingId}`)
    }
  }

  // Check if prev month nav should be disabled
  const isPrevDisabled = currentYear === now.getFullYear() && currentMonth <= now.getMonth()

  return (
    <div className="min-h-screen bg-white pb-36">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-100">
        <div className="flex items-center gap-4 px-5 py-3 pt-safe">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-50"
          >
            <ArrowLeft className="h-5 w-5 text-stone-600" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-stone-900">{facility.name}</h1>
            <p className="text-xs text-stone-500">Select date and time</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-6">
        {/* Facility Mini Card */}
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
            {facility.imageUrl ? (
              <img src={facility.imageUrl} alt={facility.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-stone-400 text-xs">
                {facility.code}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-stone-900">{facility.name}</p>
            <p className="text-sm text-stone-500">
              {facility.category}
              {facility.resources.length > 1 && ` \u00b7 ${facility.resources.length} courts`}
            </p>
          </div>
          <p className="text-[15px] font-semibold text-stone-900">
            \u0e3f{pricePerHour.toLocaleString()}/hr
          </p>
        </div>

        {/* Calendar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              disabled={isPrevDisabled}
              className={cn('p-1', isPrevDisabled && 'opacity-30')}
            >
              <ChevronLeft className="h-5 w-5 text-stone-400" />
            </button>
            <p className="text-sm font-semibold text-stone-900">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </p>
            <button onClick={handleNextMonth} className="p-1">
              <ChevronRight className="h-5 w-5 text-stone-400" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map((d, i) => (
              <div key={i} className="text-center text-xs text-stone-400 font-medium py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((d, i) => {
              if (d.day === 0) {
                return <div key={`empty-${i}`} />
              }
              const selectable = isDaySelectable(d.day)
              return (
                <button
                  key={d.day}
                  onClick={() => selectable && setSelectedDay(d.day)}
                  disabled={!selectable}
                  className={cn(
                    'relative flex flex-col items-center justify-center h-10 rounded-full text-sm transition-all',
                    selectedDay === d.day
                      ? 'bg-stone-900 text-white font-semibold'
                      : d.isToday
                        ? 'ring-2 ring-stone-900 text-stone-900 font-semibold'
                        : selectable
                          ? 'text-stone-900 hover:bg-stone-50'
                          : 'text-stone-300'
                  )}
                >
                  {d.day}
                </button>
              )
            })}
          </div>
        </div>

        {/* Time Slots */}
        {selectedDay && (
          <div>
            <p className="text-base font-semibold text-stone-900 mb-3">Available Times</p>
            {loadingSlots ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />
              </div>
            ) : timeSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && setSelectedTime(slot.time)}
                    disabled={!slot.available}
                    className={cn(
                      'py-3 rounded-xl text-sm font-medium transition-all',
                      selectedTime === slot.time
                        ? 'bg-stone-900 text-white'
                        : slot.available
                          ? 'bg-stone-50 text-stone-900 hover:bg-stone-100'
                          : 'bg-stone-50 text-stone-300 line-through'
                    )}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-400 text-center py-6">
                No available times for this date
              </p>
            )}
          </div>
        )}

        {/* Duration Selector */}
        {selectedTime && (
          <div>
            <p className="text-base font-semibold text-stone-900 mb-3">Duration</p>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setDuration(Math.max(1, duration - 1))}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
                  duration > 1
                    ? 'border-stone-900 text-stone-900 hover:bg-stone-50'
                    : 'border-stone-200 text-stone-300'
                )}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-semibold text-stone-900 min-w-[80px] text-center">
                {duration} hour{duration > 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setDuration(Math.min(maxDuration, duration + 1))}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
                  duration < maxDuration
                    ? 'border-stone-900 text-stone-900 hover:bg-stone-50'
                    : 'border-stone-200 text-stone-300'
                )}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Booking Error */}
        {bookingResult && !bookingResult.success && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {bookingResult.error}
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-24 left-0 right-0 z-40 bg-white border-t border-stone-200 px-5 py-4 mb-safe">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-stone-900">
              \u0e3f{totalPrice.toLocaleString()}
            </p>
            <p className="text-xs text-stone-500 underline">
              {duration} hour{duration > 1 ? 's' : ''}
            </p>
          </div>
          <button
            disabled={!selectedTime || booking}
            onClick={handleBook}
            className={cn(
              'px-8 py-3 rounded-xl font-semibold text-sm transition-all',
              selectedTime && !booking
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'
            )}
          >
            {booking ? 'Booking...' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
