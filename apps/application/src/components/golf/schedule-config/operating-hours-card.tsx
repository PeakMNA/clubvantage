'use client'

import { cn } from '@clubvantage/ui'

type BookingMode = 'EIGHTEEN' | 'CROSS'

interface OperatingHoursCardProps {
  weekdayFirstTee: string
  weekdayLastTee: string
  weekdayBookingMode: BookingMode
  weekendFirstTee: string
  weekendLastTee: string
  weekendBookingMode: BookingMode
  onChange: (field: string, value: string) => void
  errors?: {
    weekday?: string
    weekend?: string
  }
}

const TIME_OPTIONS = generateTimeOptions()

function generateTimeOptions(): string[] {
  const options: string[] = []
  for (let hour = 5; hour <= 20; hour++) {
    for (let min = 0; min < 60; min += 15) {
      const h = hour.toString().padStart(2, '0')
      const m = min.toString().padStart(2, '0')
      options.push(`${h}:${m}`)
    }
  }
  return options
}

function formatTime(time: string): string {
  const parts = time.split(':')
  const hours = parts[0] ?? '00'
  const minutes = parts[1] ?? '00'
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${displayHour}:${minutes} ${ampm}`
}

function TimeSelect({
  value,
  onChange,
  label,
  id,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  id: string
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
      >
        {TIME_OPTIONS.map((time) => (
          <option key={time} value={time}>
            {formatTime(time)}
          </option>
        ))}
      </select>
    </div>
  )
}

function ModeSelect({
  value,
  onChange,
  label,
  id,
}: {
  value: BookingMode
  onChange: (value: BookingMode) => void
  label: string
  id: string
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as BookingMode)}
        className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
      >
        <option value="EIGHTEEN">18 (Single Start)</option>
        <option value="CROSS">Cross (Dual Start)</option>
      </select>
    </div>
  )
}

function DayScheduleCard({
  title,
  subtitle,
  firstTee,
  lastTee,
  bookingMode,
  onFirstTeeChange,
  onLastTeeChange,
  onBookingModeChange,
  error,
}: {
  title: string
  subtitle: string
  firstTee: string
  lastTee: string
  bookingMode: BookingMode
  onFirstTeeChange: (value: string) => void
  onLastTeeChange: (value: string) => void
  onBookingModeChange: (value: BookingMode) => void
  error?: string
}) {
  const idPrefix = title.toLowerCase().replace(/\s+/g, '-')

  return (
    <div
      className={cn(
        'bg-stone-50 rounded-lg p-4 space-y-4',
        error && 'ring-2 ring-red-500'
      )}
    >
      <div>
        <h5 className="text-sm font-semibold text-stone-900">{title}</h5>
        <p className="text-xs text-stone-500">{subtitle}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <TimeSelect
          id={`${idPrefix}-first-tee`}
          label="First tee"
          value={firstTee}
          onChange={onFirstTeeChange}
        />
        <TimeSelect
          id={`${idPrefix}-last-tee`}
          label="Last tee"
          value={lastTee}
          onChange={onLastTeeChange}
        />
        <ModeSelect
          id={`${idPrefix}-mode`}
          label="Mode"
          value={bookingMode}
          onChange={onBookingModeChange}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

export function OperatingHoursCard({
  weekdayFirstTee,
  weekdayLastTee,
  weekdayBookingMode,
  weekendFirstTee,
  weekendLastTee,
  weekendBookingMode,
  onChange,
  errors,
}: OperatingHoursCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-semibold text-stone-900">Operating Hours</h4>
        <div className="text-xs text-stone-500">
          <span className="font-medium">18</span> = Hole 1 start only &bull;{' '}
          <span className="font-medium">Cross</span> = Hole 1 + Hole 10 starts
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DayScheduleCard
          title="Weekday"
          subtitle="Mon - Fri"
          firstTee={weekdayFirstTee}
          lastTee={weekdayLastTee}
          bookingMode={weekdayBookingMode}
          onFirstTeeChange={(value) => onChange('weekdayFirstTee', value)}
          onLastTeeChange={(value) => onChange('weekdayLastTee', value)}
          onBookingModeChange={(value) => onChange('weekdayBookingMode', value)}
          error={errors?.weekday}
        />

        <DayScheduleCard
          title="Weekend"
          subtitle="Sat - Sun"
          firstTee={weekendFirstTee}
          lastTee={weekendLastTee}
          bookingMode={weekendBookingMode}
          onFirstTeeChange={(value) => onChange('weekendFirstTee', value)}
          onLastTeeChange={(value) => onChange('weekendLastTee', value)}
          onBookingModeChange={(value) => onChange('weekendBookingMode', value)}
          error={errors?.weekend}
        />
      </div>
    </div>
  )
}
