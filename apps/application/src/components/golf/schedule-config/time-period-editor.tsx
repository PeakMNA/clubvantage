'use client'

import { useState } from 'react'
import { cn } from '@clubvantage/ui'
import { Plus, Star, X } from 'lucide-react'
import type { TimePeriod, ApplicableDays } from './types'

interface TimePeriodEditorProps {
  periods: TimePeriod[]
  operatingHoursEnd: string
  onPeriodsChange: (periods: TimePeriod[]) => void
}

interface TimePeriodModalProps {
  period: TimePeriod | null
  isOpen: boolean
  onClose: () => void
  onSave: (period: TimePeriod) => void
  onDelete?: () => void
  isNew?: boolean
}

const PERIOD_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'Early Bird': { bg: 'bg-stone-100', border: 'border-stone-200', text: 'text-stone-700' },
  'Prime AM': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800' },
  'Midday': { bg: 'bg-stone-50', border: 'border-stone-200', text: 'text-stone-700' },
  'Prime PM': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800' },
  'Twilight': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
}

function getColorForPeriod(period: TimePeriod) {
  if (period.name.toLowerCase().includes('twilight')) {
    return PERIOD_COLORS['Twilight']
  }
  if (period.isPrimeTime) {
    return PERIOD_COLORS['Prime AM']
  }
  return PERIOD_COLORS['Midday']
}

function formatTime(time: string): string {
  const parts = time.split(':')
  const hours = parts[0] ?? '00'
  const minutes = parts[1] ?? '00'
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${displayHour}:${minutes}`
}

function parseTimeToMinutes(time: string): number {
  const parts = time.split(':')
  const hours = parseInt(parts[0] ?? '0')
  const minutes = parseInt(parts[1] ?? '0')
  return hours * 60 + minutes
}

function TimePeriodBlock({
  period,
  endTime,
  onClick,
  totalMinutes,
}: {
  period: TimePeriod
  endTime: string
  onClick: () => void
  totalMinutes: number
}) {
  const colors = getColorForPeriod(period) ?? { bg: 'bg-stone-50', border: 'border-stone-200', text: 'text-stone-700' }
  const startMinutes = parseTimeToMinutes(period.startTime)
  const endMinutes = parseTimeToMinutes(endTime)
  const duration = endMinutes - startMinutes
  const widthPercent = Math.max((duration / totalMinutes) * 100, 10)

  return (
    <button
      onClick={onClick}
      style={{ width: `${widthPercent}%` }}
      className={cn(
        'flex flex-col items-center justify-center p-3 rounded-lg border transition-all min-w-[80px]',
        colors.bg,
        colors.border,
        'hover:shadow-md hover:scale-[1.02] cursor-pointer'
      )}
    >
      <span className={cn('text-xs font-semibold', colors.text)}>
        {period.name}
      </span>
      <span className="text-[10px] text-stone-500 mt-0.5">
        {formatTime(period.startTime)}-{formatTime(endTime)}
      </span>
      <span className="flex items-center gap-1 text-xs font-medium mt-1">
        {period.intervalMinutes} min
        {period.isPrimeTime && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
      </span>
    </button>
  )
}

function TimePeriodModal({
  period,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isNew,
}: TimePeriodModalProps) {
  const [formData, setFormData] = useState<Partial<TimePeriod>>(
    period || {
      name: '',
      startTime: '07:00',
      endTime: '11:00',
      intervalMinutes: 10,
      isPrimeTime: false,
      applicableDays: 'ALL',
      sortOrder: 0,
    }
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const handleSave = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required'
    }

    if (formData.intervalMinutes && (formData.intervalMinutes < 5 || formData.intervalMinutes > 20)) {
      newErrors.intervalMinutes = 'Interval must be between 5 and 20 minutes'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave(formData as TimePeriod)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            {isNew ? 'Add Time Period' : 'Edit Time Period'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Period Name
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Prime Morning"
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500',
                errors.name && 'border-red-500'
              )}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div className="bg-stone-50 rounded-lg p-3">
            <label className="block text-xs font-medium text-stone-500 uppercase mb-2">
              Time Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Start</label>
                <input
                  type="time"
                  value={formData.startTime || '07:00'}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">End</label>
                <input
                  type="time"
                  value={formData.endTime || ''}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value || null })}
                  placeholder="Operating close"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-3">
            <label className="block text-xs font-medium text-stone-500 uppercase mb-2">
              Interval
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={formData.intervalMinutes || 10}
                onChange={(e) => setFormData({ ...formData, intervalMinutes: parseInt(e.target.value) || 10 })}
                min={5}
                max={20}
                className={cn(
                  'w-20 px-3 py-2 border rounded-lg text-sm',
                  errors.intervalMinutes && 'border-red-500'
                )}
              />
              <span className="text-sm text-stone-500">minutes between tee times</span>
            </div>
            {errors.intervalMinutes && (
              <p className="text-xs text-red-600 mt-1">{errors.intervalMinutes}</p>
            )}
          </div>

          <div className="bg-stone-50 rounded-lg p-3 space-y-3">
            <label className="block text-xs font-medium text-stone-500 uppercase">
              Options
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPrimeTime || false}
                onChange={(e) => setFormData({ ...formData, isPrimeTime: e.target.checked })}
                className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm">Prime time (affects pricing rules)</span>
            </label>

            <div>
              <label className="block text-xs text-stone-500 mb-2">Applicable days</label>
              <div className="space-y-1">
                {(['ALL', 'WEEKDAY', 'WEEKEND'] as ApplicableDays[]).map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="applicableDays"
                      checked={formData.applicableDays === option}
                      onChange={() => setFormData({ ...formData, applicableDays: option })}
                      className="h-4 w-4 border-stone-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm">
                      {option === 'ALL' ? 'Both weekday and weekend' :
                       option === 'WEEKDAY' ? 'Weekdays only' : 'Weekends only'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t bg-stone-50 rounded-b-2xl">
          {onDelete && !isNew ? (
            <button
              onClick={onDelete}
              className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
            >
              Delete Period
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TimePeriodEditor({
  periods,
  operatingHoursEnd,
  onPeriodsChange,
}: TimePeriodEditorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNewPeriod, setIsNewPeriod] = useState(false)

  const sortedPeriods = [...periods].sort((a, b) => a.sortOrder - b.sortOrder)

  // Calculate total day minutes from first period start to last tee time
  const firstStart = sortedPeriods[0]?.startTime || '06:00'
  const startMinutes = parseTimeToMinutes(firstStart)
  const endMinutes = parseTimeToMinutes(operatingHoursEnd)
  const totalMinutes = endMinutes - startMinutes

  const getEndTime = (period: TimePeriod, index: number): string => {
    if (period.endTime) return period.endTime
    const nextPeriod = sortedPeriods[index + 1]
    if (nextPeriod) {
      return nextPeriod.startTime
    }
    return operatingHoursEnd
  }

  const handleEditPeriod = (period: TimePeriod) => {
    setSelectedPeriod(period)
    setIsNewPeriod(false)
    setIsModalOpen(true)
  }

  const handleAddPeriod = () => {
    setSelectedPeriod(null)
    setIsNewPeriod(true)
    setIsModalOpen(true)
  }

  const handleSavePeriod = (updatedPeriod: TimePeriod) => {
    if (isNewPeriod) {
      const newPeriod: TimePeriod = {
        ...updatedPeriod,
        id: `period-${Date.now()}`,
        sortOrder: periods.length,
      }
      onPeriodsChange([...periods, newPeriod])
    } else {
      onPeriodsChange(
        periods.map((p) => (p.id === updatedPeriod.id ? updatedPeriod : p))
      )
    }
  }

  const handleDeletePeriod = () => {
    if (selectedPeriod) {
      onPeriodsChange(periods.filter((p) => p.id !== selectedPeriod.id))
    }
    setIsModalOpen(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-semibold text-stone-900">Time Periods</h4>
        <button
          onClick={handleAddPeriod}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg"
        >
          <Plus className="h-4 w-4" />
          Add Period
        </button>
      </div>

      {/* Period blocks */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {sortedPeriods.map((period, index) => (
          <TimePeriodBlock
            key={period.id}
            period={period}
            endTime={getEndTime(period, index)}
            onClick={() => handleEditPeriod(period)}
            totalMinutes={totalMinutes}
          />
        ))}
      </div>

      {/* Timeline bar */}
      <div className="relative h-2 bg-stone-100 rounded-full mt-4">
        {sortedPeriods.map((period, index) => {
          const startMins = parseTimeToMinutes(period.startTime)
          const endTime = getEndTime(period, index)
          const endMins = parseTimeToMinutes(endTime)

          const leftPercent = ((startMins - startMinutes) / totalMinutes) * 100
          const widthPercent = ((endMins - startMins) / totalMinutes) * 100
          const colors = getColorForPeriod(period) ?? { bg: 'bg-stone-50', border: 'border-stone-200', text: 'text-stone-700' }

          return (
            <div
              key={period.id}
              className={cn('absolute h-2 rounded-full', colors.bg)}
              style={{
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
              }}
            />
          )
        })}
      </div>

      {/* Time markers */}
      <div className="flex justify-between mt-2 text-xs text-stone-500">
        <span>{formatTime(firstStart)}</span>
        <span>{formatTime(operatingHoursEnd)}</span>
      </div>

      <TimePeriodModal
        period={selectedPeriod}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePeriod}
        onDelete={handleDeletePeriod}
        isNew={isNewPeriod}
      />
    </div>
  )
}
