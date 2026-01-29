'use client'

import { useState, useCallback, useMemo } from 'react'
import { cn } from '@clubvantage/ui'
import { Plus, ChevronRight, X, Trash2, CalendarOff, Sun, Gift, Wrench, RefreshCw } from 'lucide-react'
import type { SpecialDay, SpecialDayType, TimePeriod, BookingMode } from './types'
import type { LucideIcon } from 'lucide-react'
import { InlineTimePeriodEditor } from './inline-time-period-editor'

interface SpecialDayManagerProps {
  specialDays: SpecialDay[]
  onSpecialDaysChange: (specialDays: SpecialDay[]) => void
}

interface SpecialDayModalProps {
  specialDay: SpecialDay | null
  isOpen: boolean
  onClose: () => void
  onSave: (specialDay: SpecialDay) => void
  onDelete?: () => void
  isNew?: boolean
}

// Type configuration with icons and colors
const SPECIAL_DAY_TYPES: Record<SpecialDayType, {
  label: string
  icon: LucideIcon
  bgColor: string
  textColor: string
  description: string
}> = {
  WEEKEND: {
    label: 'Weekend Schedule',
    icon: Sun,
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    description: 'Uses weekend operating hours',
  },
  HOLIDAY: {
    label: 'Holiday',
    icon: Gift,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    description: 'Uses weekend hours + holiday pricing',
  },
  CLOSED: {
    label: 'Closed',
    icon: CalendarOff,
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    description: 'Course is closed',
  },
  CUSTOM: {
    label: 'Custom',
    icon: Wrench,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    description: 'Custom operating hours',
  },
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (startDate === endDate) {
    return startStr
  }

  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${startStr} - ${endStr}`
}

function SpecialDayCard({
  specialDay,
  onClick,
}: {
  specialDay: SpecialDay
  onClick: () => void
}) {
  const typeConfig = SPECIAL_DAY_TYPES[specialDay.type]
  const Icon = typeConfig.icon

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', typeConfig.bgColor)}>
          <Icon className={cn('h-5 w-5', typeConfig.textColor)} />
        </div>
        <div>
          <h5 className="font-medium text-stone-900">{specialDay.name}</h5>
          <p className="text-xs text-stone-500 flex items-center gap-2">
            {formatDateRange(specialDay.startDate, specialDay.endDate)}
            {specialDay.isRecurring && (
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Recurring
              </span>
            )}
            <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', typeConfig.bgColor, typeConfig.textColor)}>
              {typeConfig.label}
            </span>
          </p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-stone-400" />
    </button>
  )
}

// Default empty special day data
const getEmptySpecialDay = (): Partial<SpecialDay> => ({
  name: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  isRecurring: false,
  type: 'HOLIDAY',
  customFirstTee: null,
  customLastTee: null,
  customTimePeriods: false,
  timePeriods: [],
  bookingMode: null,
})

// Booking mode options for special days
const BOOKING_MODE_OPTIONS: { value: BookingMode | ''; label: string }[] = [
  { value: '', label: 'Use Default' },
  { value: 'EIGHTEEN', label: '18 (Single Start)' },
  { value: 'CROSS', label: 'Cross (Dual Start)' },
]

function SpecialDayModal({
  specialDay,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isNew,
}: SpecialDayModalProps) {
  const [formData, setFormData] = useState<Partial<SpecialDay>>(
    specialDay || getEmptySpecialDay()
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const handleSave = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be on or after start date'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave(formData as SpecialDay)
    onClose()
  }

  const selectedType = formData.type || 'HOLIDAY'
  const showCustomHours = selectedType === 'CUSTOM'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h3 className="text-lg font-semibold">
            {isNew ? 'Add Special Day' : 'Edit Special Day'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Christmas Day, New Year's"
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500',
                errors.name && 'border-red-500'
              )}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Date Range */}
          <div className="bg-stone-50 rounded-lg p-3">
            <label className="block text-xs font-medium text-stone-500 uppercase mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg text-sm',
                    errors.startDate && 'border-red-500'
                  )}
                />
                {errors.startDate && <p className="text-xs text-red-600 mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg text-sm',
                    errors.endDate && 'border-red-500'
                  )}
                />
                {errors.endDate && <p className="text-xs text-red-600 mt-1">{errors.endDate}</p>}
              </div>
            </div>

            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isRecurring ?? false}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-stone-600">Recurring every year</span>
            </label>
          </div>

          {/* Type Selection */}
          <div className="bg-stone-50 rounded-lg p-3">
            <label className="block text-xs font-medium text-stone-500 uppercase mb-2">
              Day Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(SPECIAL_DAY_TYPES) as SpecialDayType[]).map((type) => {
                const config = SPECIAL_DAY_TYPES[type]
                const Icon = config.icon
                const isSelected = formData.type === type

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left',
                      isSelected
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-stone-200 hover:border-stone-300'
                    )}
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.bgColor)}>
                      <Icon className={cn('h-4 w-4', config.textColor)} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{config.label}</p>
                      <p className="text-[10px] text-stone-500">{config.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom Hours (only for CUSTOM type) */}
          {showCustomHours && (
            <div className="bg-stone-50 rounded-lg p-3">
              <label className="block text-xs font-medium text-stone-500 uppercase mb-2">
                Custom Operating Hours
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-500 mb-1">First Tee</label>
                  <input
                    type="time"
                    value={formData.customFirstTee || ''}
                    onChange={(e) => setFormData({ ...formData, customFirstTee: e.target.value || null })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Last Tee</label>
                  <input
                    type="time"
                    value={formData.customLastTee || ''}
                    onChange={(e) => setFormData({ ...formData, customLastTee: e.target.value || null })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.customTimePeriods ?? false}
                  onChange={(e) => setFormData({ ...formData, customTimePeriods: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-stone-600">Use custom time periods</span>
              </label>

              {formData.customTimePeriods && (
                <InlineTimePeriodEditor
                  periods={formData.timePeriods || []}
                  onPeriodsChange={(periods) => setFormData({ ...formData, timePeriods: periods })}
                  label="Custom Time Periods"
                />
              )}

              {/* Booking Mode Override */}
              <div className="pt-2 border-t border-stone-200">
                <label className="block text-xs text-stone-500 mb-1">Tee Sheet Mode</label>
                <select
                  value={formData.bookingMode || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    bookingMode: e.target.value ? (e.target.value as BookingMode) : null
                  })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  {BOOKING_MODE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-stone-400 mt-1">
                  Override tee sheet display mode for this day
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t bg-stone-50 rounded-b-2xl sticky bottom-0">
          {onDelete && !isNew ? (
            <button
              onClick={onDelete}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="h-4 w-4" />
              Delete
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

export function SpecialDayManager({
  specialDays,
  onSpecialDaysChange,
}: SpecialDayManagerProps) {
  const [selectedDay, setSelectedDay] = useState<SpecialDay | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNewDay, setIsNewDay] = useState(false)

  // Sort by date
  const sortedDays = useMemo(() => {
    return [...specialDays].sort((a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )
  }, [specialDays])

  const handleEditDay = useCallback((day: SpecialDay) => {
    setSelectedDay(day)
    setIsNewDay(false)
    setIsModalOpen(true)
  }, [])

  const handleAddDay = useCallback(() => {
    setSelectedDay(null)
    setIsNewDay(true)
    setIsModalOpen(true)
  }, [])

  const handleSaveDay = useCallback((updatedDay: SpecialDay) => {
    if (isNewDay) {
      const newDay: SpecialDay = {
        ...updatedDay,
        id: `special-${Date.now()}`,
        timePeriods: updatedDay.timePeriods || [],
      }
      onSpecialDaysChange([...specialDays, newDay])
    } else {
      onSpecialDaysChange(
        specialDays.map((d) => (d.id === updatedDay.id ? updatedDay : d))
      )
    }
  }, [isNewDay, specialDays, onSpecialDaysChange])

  const handleDeleteDay = useCallback(() => {
    if (selectedDay) {
      onSpecialDaysChange(specialDays.filter((d) => d.id !== selectedDay.id))
    }
    setIsModalOpen(false)
  }, [selectedDay, specialDays, onSpecialDaysChange])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-base font-semibold text-stone-900">Special Days</h4>
          <p className="text-xs text-stone-500 mt-0.5">
            Holidays, closures, and custom schedule days
          </p>
        </div>
        <button
          onClick={handleAddDay}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg"
        >
          <Plus className="h-4 w-4" />
          Add Special Day
        </button>
      </div>

      {sortedDays.length === 0 ? (
        <div className="text-center py-8 text-stone-500">
          <CalendarOff className="h-8 w-8 mx-auto mb-2 text-stone-400" />
          <p className="text-sm">No special days configured</p>
          <p className="text-xs mt-1">Add holidays, closures, or custom schedule days</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedDays.map((day) => (
            <SpecialDayCard
              key={day.id}
              specialDay={day}
              onClick={() => handleEditDay(day)}
            />
          ))}
        </div>
      )}

      <SpecialDayModal
        specialDay={selectedDay}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveDay}
        onDelete={handleDeleteDay}
        isNew={isNewDay}
      />
    </div>
  )
}
