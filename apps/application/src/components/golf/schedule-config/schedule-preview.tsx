'use client'

import { useMemo, useState } from 'react'
import { cn } from '@clubvantage/ui'
import { Calendar, Star, Clock, Users, AlertTriangle } from 'lucide-react'
import {
  generateTeeTimeSlots,
  formatTime,
  isWeekend,
  type ScheduleConfig,
  type TeeTimeSlot,
  type SchedulePreviewData,
} from '@/lib/golf/schedule-utils'

// Types are now exported from ./types.ts which re-exports from @/lib/golf/schedule-utils

interface SchedulePreviewProps {
  config: ScheduleConfig
  selectedDate?: Date
  onDateChange?: (date: Date) => void
}

function QuickDateButton({
  label,
  onClick,
  isActive,
}: {
  label: string
  onClick: () => void
  isActive: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1 text-xs font-medium rounded-full transition-colors',
        isActive
          ? 'bg-amber-500 text-white'
          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
      )}
    >
      {label}
    </button>
  )
}

function TeeTimeSlotRow({ slot, showDivider }: { slot: TeeTimeSlot; showDivider: boolean }) {
  const bgColor = slot.isPrimeTime
    ? 'bg-amber-50'
    : slot.isTwilight
    ? 'bg-blue-50'
    : 'bg-stone-50'

  return (
    <>
      {showDivider && (
        <div className="flex items-center gap-2 py-1">
          <div className="flex-1 h-px bg-stone-300 border-dashed" />
          <span className="text-xs text-stone-500">{slot.periodName}</span>
          <div className="flex-1 h-px bg-stone-300 border-dashed" />
        </div>
      )}
      <div className={cn('flex items-center justify-between px-3 py-1.5 rounded', bgColor)}>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium text-stone-900">
            {formatTime(slot.time)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">
            {slot.interval} min
          </span>
          {slot.isPrimeTime && (
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
          )}
        </div>
      </div>
    </>
  )
}

export function SchedulePreview({
  config,
  selectedDate: initialDate,
  onDateChange,
}: SchedulePreviewProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date())

  const previewData = useMemo(() => {
    return generateTeeTimeSlots(config, selectedDate)
  }, [config, selectedDate])

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
    onDateChange?.(date)
  }

  const getNextSaturday = () => {
    const date = new Date()
    date.setDate(date.getDate() + ((6 - date.getDay() + 7) % 7 || 7))
    return date
  }

  const today = new Date()
  const isToday = selectedDate.toDateString() === today.toDateString()
  const isSaturday = selectedDate.toDateString() === getNextSaturday().toDateString()

  // Group slots by period for dividers
  let lastPeriodName = ''

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-stone-200">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-stone-500" />
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => handleDateChange(new Date(e.target.value))}
            className="text-lg font-semibold bg-transparent border-none focus:outline-none cursor-pointer"
          />
        </div>
        <p className="text-sm text-stone-500">
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })} &middot;{' '}
          {previewData.dayType === 'WEEKEND' ? 'Weekend' : 'Weekday'} schedule
        </p>

        {/* Quick dates */}
        <div className="flex gap-2 mt-3">
          <QuickDateButton
            label="Today"
            onClick={() => handleDateChange(new Date())}
            isActive={isToday}
          />
          <QuickDateButton
            label="Sat"
            onClick={() => handleDateChange(getNextSaturday())}
            isActive={isSaturday}
          />
        </div>
      </div>

      {/* Active season/special day indicator */}
      {(previewData.activeSeason || previewData.activeSpecialDay) && (
        <div className="px-4 py-2 bg-blue-50 border-b border-stone-200">
          {previewData.activeSpecialDay && (
            <div className="flex items-center gap-2 text-sm">
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                previewData.activeSpecialDay.type === 'CLOSED' ? 'bg-red-100 text-red-700' :
                previewData.activeSpecialDay.type === 'HOLIDAY' ? 'bg-purple-100 text-purple-700' :
                'bg-blue-100 text-blue-700'
              )}>
                {previewData.activeSpecialDay.type}
              </span>
              <span className="font-medium text-stone-700">{previewData.activeSpecialDay.name}</span>
            </div>
          )}
          {previewData.activeSeason && !previewData.activeSpecialDay && (
            <div className="flex items-center gap-2 text-sm">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                Season
              </span>
              <span className="font-medium text-stone-700">{previewData.activeSeason.name}</span>
            </div>
          )}
        </div>
      )}

      {/* Closed day notice */}
      {previewData.isClosed ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mb-3" />
          <p className="text-lg font-semibold text-stone-900">Course Closed</p>
          <p className="text-sm text-stone-500 mt-1">
            {previewData.activeSpecialDay?.name || 'This day is marked as closed'}
          </p>
        </div>
      ) : (
        <>
          {/* Active rules */}
          <div className="px-4 py-3 bg-stone-50 border-b border-stone-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">Operating</span>
              <span className="font-medium">
                {formatTime(previewData.operatingHours.firstTee)} -{' '}
                {formatTime(previewData.operatingHours.lastTee)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-stone-500">Tee Mode</span>
              <span className={cn(
                'px-2 py-0.5 rounded text-xs font-medium',
                previewData.bookingMode === 'CROSS'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-stone-100 text-stone-600'
              )}>
                {previewData.bookingMode === 'CROSS' ? 'Cross (1 + 10)' : '18 (Hole 1)'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-stone-500">Twilight</span>
              <span className="font-medium">
                {formatTime(previewData.twilightTime)}
                {config.twilightMode === 'SUNSET' && (
                  <span className="text-xs text-stone-400 ml-1">(sunset)</span>
                )}
              </span>
            </div>
          </div>

          {/* Tee time slots */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 max-h-[400px]">
            {previewData.teeTimeSlots.map((slot, index) => {
              const showDivider = slot.periodName !== lastPeriodName
              lastPeriodName = slot.periodName
              return (
                <TeeTimeSlotRow
                  key={slot.time}
                  slot={slot}
                  showDivider={showDivider && index > 0}
                />
              )
            })}
          </div>
        </>
      )}

      {/* Summary */}
      <div className="p-4 border-t border-stone-200 bg-amber-50 rounded-b-xl">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <div>
              <p className="text-xs text-stone-500">Total Slots</p>
              <p className="font-semibold text-stone-900">
                {previewData.summary.totalSlots}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-amber-600" />
            <div>
              <p className="text-xs text-stone-500">Max Players</p>
              <p className="font-semibold text-stone-900">
                {previewData.summary.maxPlayers}
              </p>
            </div>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <div>
              <p className="text-xs text-stone-500">Prime Time</p>
              <p className="font-semibold text-stone-900">
                {previewData.summary.primeTimeSlots} slots ({previewData.summary.primeTimePercentage}%)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
