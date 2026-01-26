'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, startOfWeek, endOfWeek, subMonths, subQuarters } from 'date-fns'
import { cn, Button } from '@clubvantage/ui'

interface DateRange {
  start: Date
  end: Date
  preset?: string
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

const presets = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this-week' },
  { label: 'This Month', value: 'this-month' },
  { label: 'Last Month', value: 'last-month' },
  { label: 'This Quarter', value: 'this-quarter' },
  { label: 'Last Quarter', value: 'last-quarter' },
  { label: 'YTD', value: 'ytd' },
  { label: 'Custom', value: 'custom' },
]

function getPresetRange(preset: string): { start: Date; end: Date } {
  const now = new Date()
  switch (preset) {
    case 'today':
      return { start: now, end: now }
    case 'this-week':
      return { start: startOfWeek(now), end: endOfWeek(now) }
    case 'this-month':
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case 'last-month':
      const lastMonth = subMonths(now, 1)
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
    case 'this-quarter':
      return { start: startOfQuarter(now), end: endOfQuarter(now) }
    case 'last-quarter':
      const lastQuarter = subQuarters(now, 1)
      return { start: startOfQuarter(lastQuarter), end: endOfQuarter(lastQuarter) }
    case 'ytd':
      return { start: startOfYear(now), end: now }
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) }
  }
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState(value.preset || 'this-month')
  const [customStart, setCustomStart] = useState(format(value.start, 'yyyy-MM-dd'))
  const [customEnd, setCustomEnd] = useState(format(value.end, 'yyyy-MM-dd'))
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePresetClick = (preset: string) => {
    setSelectedPreset(preset)
    if (preset !== 'custom') {
      const range = getPresetRange(preset)
      setCustomStart(format(range.start, 'yyyy-MM-dd'))
      setCustomEnd(format(range.end, 'yyyy-MM-dd'))
    }
  }

  const handleApply = () => {
    const start = new Date(customStart)
    const end = new Date(customEnd)
    onChange({ start, end, preset: selectedPreset })
    setIsOpen(false)
  }

  const displayText = `${format(value.start, 'MMM d, yyyy')} - ${format(value.end, 'MMM d, yyyy')}`

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 transition-colors hover:border-stone-300',
          isOpen && 'ring-2 ring-amber-500/30'
        )}
      >
        <Calendar className="h-4 w-4 text-stone-500" />
        <span>{displayText}</span>
        <ChevronDown className={cn('h-4 w-4 text-stone-500 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-xl border border-stone-200 bg-white p-4 shadow-lg">
          {/* Presets Grid */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm transition-colors',
                  selectedPreset === preset.value
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'hover:bg-stone-100 text-stone-600'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs */}
          {selectedPreset === 'custom' && (
            <div className="mb-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">From</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">To</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
