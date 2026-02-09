'use client'

import { useState, useCallback, useMemo, useRef, useEffect, memo } from 'react'
import { cn } from '@clubvantage/ui'
import { ChevronDown, X, Calendar, Check } from 'lucide-react'
import type { BookingStatus, BookingFilters } from './types'

interface BookingsFiltersProps {
  filters: {
    dateRange: { start: string; end: string } | null
    statuses: BookingStatus[]
    courseId: string | null
  }
  courses: Array<{ id: string; name: string }>
  onFilterChange: (filters: BookingFilters) => void
  onClear: () => void
}

// Date range presets
type DatePreset = 'today' | 'this-week' | 'this-month' | 'custom'

const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: 'BOOKED', label: 'Booked' },
  { value: 'CHECKED_IN', label: 'Checked In' },
  { value: 'STARTED', label: 'On Course' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' },
]

// Helper to format date as "Jan 28"
function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Get date range for preset
function getDateRangeForPreset(preset: DatePreset): { start: string; end: string } | null {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  switch (preset) {
    case 'today':
      return {
        start: today.toISOString().split('T')[0]!,
        end: today.toISOString().split('T')[0]!,
      }
    case 'this-week': {
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      return {
        start: startOfWeek.toISOString().split('T')[0]!,
        end: endOfWeek.toISOString().split('T')[0]!,
      }
    }
    case 'this-month': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return {
        start: startOfMonth.toISOString().split('T')[0]!,
        end: endOfMonth.toISOString().split('T')[0]!,
      }
    }
    case 'custom':
      return null
  }
}

// Dropdown wrapper component
interface DropdownProps {
  trigger: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  children: React.ReactNode
  align?: 'left' | 'right'
}

function Dropdown({ trigger, isOpen, onToggle, onClose, children, align = 'left' }: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors',
          isOpen
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
            : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700'
        )}
      >
        {trigger}
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-1 z-50 min-w-[200px] bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 shadow-lg py-1',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}

// Date Range Dropdown
interface DateRangeDropdownProps {
  value: { start: string; end: string } | null
  onChange: (range: { start: string; end: string } | null) => void
}

const DateRangeDropdown = memo(function DateRangeDropdown({ value, onChange }: DateRangeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const handlePresetClick = useCallback(
    (preset: DatePreset) => {
      if (preset === 'custom') {
        setShowCustom(true)
        setCustomStart(value?.start || '')
        setCustomEnd(value?.end || '')
      } else {
        const range = getDateRangeForPreset(preset)
        onChange(range)
        setShowCustom(false)
        setIsOpen(false)
      }
    },
    [onChange, value]
  )

  const handleCustomApply = useCallback(() => {
    if (customStart && customEnd) {
      onChange({ start: customStart, end: customEnd })
      setIsOpen(false)
      setShowCustom(false)
    }
  }, [customStart, customEnd, onChange])

  const displayText = useMemo(() => {
    if (!value) return 'Date Range'
    if (value.start === value.end) return formatDateShort(value.start)
    return `${formatDateShort(value.start)} - ${formatDateShort(value.end)}`
  }, [value])

  return (
    <Dropdown
      trigger={
        <>
          <Calendar className="h-4 w-4" />
          {displayText}
        </>
      }
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      onClose={() => {
        setIsOpen(false)
        setShowCustom(false)
      }}
    >
      {!showCustom ? (
        <>
          <button
            type="button"
            onClick={() => handlePresetClick('today')}
            className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => handlePresetClick('this-week')}
            className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"
          >
            This Week
          </button>
          <button
            type="button"
            onClick={() => handlePresetClick('this-month')}
            className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"
          >
            This Month
          </button>
          <div className="border-t border-stone-200 dark:border-stone-700 my-1" />
          <button
            type="button"
            onClick={() => handlePresetClick('custom')}
            className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"
          >
            Custom...
          </button>
        </>
      ) : (
        <div className="p-3 space-y-3">
          <div>
            <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">Start Date</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">End Date</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCustom(false)}
              className="flex-1 px-3 py-1.5 text-sm text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-700 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleCustomApply}
              disabled={!customStart || !customEnd}
              className="flex-1 px-3 py-1.5 text-sm text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </Dropdown>
  )
})

// Status Multi-select Dropdown
interface StatusDropdownProps {
  value: BookingStatus[]
  onChange: (statuses: BookingStatus[]) => void
}

const StatusDropdown = memo(function StatusDropdown({ value, onChange }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggleStatus = useCallback(
    (status: BookingStatus) => {
      if (value.includes(status)) {
        onChange(value.filter((s) => s !== status))
      } else {
        onChange([...value, status])
      }
    },
    [value, onChange]
  )

  const handleSelectAll = useCallback(() => {
    onChange([])
  }, [onChange])

  const displayText = useMemo(() => {
    if (value.length === 0) return 'All Statuses'
    if (value.length === 1) {
      const status = STATUS_OPTIONS.find((s) => s.value === value[0])
      return status?.label || 'Status'
    }
    return `${value.length} statuses`
  }, [value])

  return (
    <Dropdown
      trigger={displayText}
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      onClose={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={handleSelectAll}
        className={cn(
          'w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-stone-50 dark:hover:bg-stone-700',
          value.length === 0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-stone-700 dark:text-stone-300'
        )}
      >
        <div
          className={cn(
            'h-4 w-4 rounded border flex items-center justify-center',
            value.length === 0 ? 'bg-emerald-500 border-emerald-500' : 'border-stone-300 dark:border-stone-600'
          )}
        >
          {value.length === 0 && <Check className="h-3 w-3 text-white" />}
        </div>
        All
      </button>
      <div className="border-t border-stone-200 dark:border-stone-700 my-1" />
      {STATUS_OPTIONS.map((option) => {
        const isSelected = value.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleToggleStatus(option.value)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"
          >
            <div
              className={cn(
                'h-4 w-4 rounded border flex items-center justify-center',
                isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-stone-300 dark:border-stone-600'
              )}
            >
              {isSelected && <Check className="h-3 w-3 text-white" />}
            </div>
            {option.label}
          </button>
        )
      })}
    </Dropdown>
  )
})

// Course Dropdown
interface CourseDropdownProps {
  value: string | null
  courses: Array<{ id: string; name: string }>
  onChange: (courseId: string | null) => void
}

const CourseDropdown = memo(function CourseDropdown({ value, courses, onChange }: CourseDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = useCallback(
    (courseId: string | null) => {
      onChange(courseId)
      setIsOpen(false)
    },
    [onChange]
  )

  const displayText = useMemo(() => {
    if (!value) return 'All Courses'
    const course = courses.find((c) => c.id === value)
    return course?.name || 'Course'
  }, [value, courses])

  return (
    <Dropdown
      trigger={displayText}
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      onClose={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={() => handleSelect(null)}
        className={cn(
          'w-full text-left px-4 py-2 text-sm hover:bg-stone-50 dark:hover:bg-stone-700',
          !value ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-stone-700 dark:text-stone-300'
        )}
      >
        All Courses
      </button>
      <div className="border-t border-stone-200 dark:border-stone-700 my-1" />
      {courses.map((course) => (
        <button
          key={course.id}
          type="button"
          onClick={() => handleSelect(course.id)}
          className={cn(
            'w-full text-left px-4 py-2 text-sm hover:bg-stone-50 dark:hover:bg-stone-700',
            value === course.id ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-stone-700 dark:text-stone-300'
          )}
        >
          {course.name}
        </button>
      ))}
    </Dropdown>
  )
})

// Filter Pill component
interface FilterPillProps {
  label: string
  onRemove: () => void
}

const FilterPill = memo(function FilterPill({ label, onRemove }: FilterPillProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-full text-sm">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="p-0.5 rounded-full hover:text-red-500 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
})

export function BookingsFilters({ filters, courses, onFilterChange, onClear }: BookingsFiltersProps) {
  const hasActiveFilters = useMemo(
    () => filters.dateRange !== null || filters.statuses.length > 0 || filters.courseId !== null,
    [filters]
  )

  const handleDateRangeChange = useCallback(
    (range: { start: string; end: string } | null) => {
      onFilterChange({
        ...filters,
        dateRange: range,
        search: '',
      })
    },
    [filters, onFilterChange]
  )

  const handleStatusesChange = useCallback(
    (statuses: BookingStatus[]) => {
      onFilterChange({
        ...filters,
        statuses,
        search: '',
      })
    },
    [filters, onFilterChange]
  )

  const handleCourseChange = useCallback(
    (courseId: string | null) => {
      onFilterChange({
        ...filters,
        courseId,
        search: '',
      })
    },
    [filters, onFilterChange]
  )

  // Build active filter pills
  const activePills = useMemo(() => {
    const pills: Array<{ key: string; label: string; onRemove: () => void }> = []

    if (filters.dateRange) {
      const label =
        filters.dateRange.start === filters.dateRange.end
          ? formatDateShort(filters.dateRange.start)
          : `${formatDateShort(filters.dateRange.start)} - ${formatDateShort(filters.dateRange.end)}`
      pills.push({
        key: 'dateRange',
        label,
        onRemove: () => handleDateRangeChange(null),
      })
    }

    if (filters.statuses.length > 0) {
      const label = filters.statuses
        .map((s) => STATUS_OPTIONS.find((opt) => opt.value === s)?.label || s)
        .join(', ')
      pills.push({
        key: 'statuses',
        label,
        onRemove: () => handleStatusesChange([]),
      })
    }

    if (filters.courseId) {
      const course = courses.find((c) => c.id === filters.courseId)
      if (course) {
        pills.push({
          key: 'course',
          label: course.name,
          onRemove: () => handleCourseChange(null),
        })
      }
    }

    return pills
  }, [filters, courses, handleDateRangeChange, handleStatusesChange, handleCourseChange])

  return (
    <div className="space-y-2">
      {/* Filter Bar */}
      <div className="flex items-center gap-3 py-3">
        <span className="text-sm text-stone-500 dark:text-stone-400">Filters:</span>
        <DateRangeDropdown value={filters.dateRange} onChange={handleDateRangeChange} />
        <StatusDropdown value={filters.statuses} onChange={handleStatusesChange} />
        <CourseDropdown value={filters.courseId} courses={courses} onChange={handleCourseChange} />
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-sm text-blue-600 hover:underline ml-auto"
          >
            Clear
          </button>
        )}
      </div>

      {/* Active Filter Pills */}
      {activePills.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {activePills.map((pill) => (
            <FilterPill key={pill.key} label={pill.label} onRemove={pill.onRemove} />
          ))}
        </div>
      )}
    </div>
  )
}
