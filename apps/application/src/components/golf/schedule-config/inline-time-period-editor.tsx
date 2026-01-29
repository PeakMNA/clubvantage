'use client'

import { useState, useCallback } from 'react'
import { cn } from '@clubvantage/ui'
import { Plus, Trash2, Star, Clock } from 'lucide-react'
import type { TimePeriod, ApplicableDays } from './types'

interface InlineTimePeriodEditorProps {
  periods: TimePeriod[]
  onPeriodsChange: (periods: TimePeriod[]) => void
  label?: string
}

interface PeriodRowProps {
  period: TimePeriod
  onUpdate: (updated: TimePeriod) => void
  onDelete: () => void
}

function PeriodRow({ period, onUpdate, onDelete }: PeriodRowProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-stone-200">
      <input
        type="text"
        value={period.name}
        onChange={(e) => onUpdate({ ...period, name: e.target.value })}
        placeholder="Name"
        className="flex-1 min-w-[80px] px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
      />

      <div className="flex items-center gap-1">
        <input
          type="time"
          value={period.startTime}
          onChange={(e) => onUpdate({ ...period, startTime: e.target.value })}
          className="w-[90px] px-1 py-1 text-xs border rounded"
        />
        <span className="text-xs text-stone-400">-</span>
        <input
          type="time"
          value={period.endTime || ''}
          onChange={(e) => onUpdate({ ...period, endTime: e.target.value || null })}
          placeholder="End"
          className="w-[90px] px-1 py-1 text-xs border rounded"
        />
      </div>

      <div className="flex items-center gap-1">
        <input
          type="number"
          value={period.intervalMinutes}
          onChange={(e) => onUpdate({ ...period, intervalMinutes: parseInt(e.target.value) || 10 })}
          min={5}
          max={20}
          className="w-14 px-1 py-1 text-xs border rounded text-center"
        />
        <span className="text-[10px] text-stone-400">min</span>
      </div>

      <button
        type="button"
        onClick={() => onUpdate({ ...period, isPrimeTime: !period.isPrimeTime })}
        className={cn(
          'p-1 rounded transition-colors',
          period.isPrimeTime ? 'text-amber-500 bg-amber-50' : 'text-stone-300 hover:text-stone-400'
        )}
        title={period.isPrimeTime ? 'Prime time (click to disable)' : 'Not prime time (click to enable)'}
      >
        <Star className="h-4 w-4" fill={period.isPrimeTime ? 'currentColor' : 'none'} />
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="p-1 text-stone-400 hover:text-red-500 rounded transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

export function InlineTimePeriodEditor({
  periods,
  onPeriodsChange,
  label = 'Time Periods',
}: InlineTimePeriodEditorProps) {
  const sortedPeriods = [...periods].sort((a, b) => a.sortOrder - b.sortOrder)

  const handleUpdatePeriod = useCallback((index: number, updated: TimePeriod) => {
    const newPeriods = [...periods]
    const originalIndex = periods.findIndex(p => p.id === updated.id)
    if (originalIndex !== -1) {
      newPeriods[originalIndex] = updated
      onPeriodsChange(newPeriods)
    }
  }, [periods, onPeriodsChange])

  const handleDeletePeriod = useCallback((id: string) => {
    onPeriodsChange(periods.filter(p => p.id !== id))
  }, [periods, onPeriodsChange])

  const handleAddPeriod = useCallback(() => {
    const newPeriod: TimePeriod = {
      id: `custom-period-${Date.now()}`,
      name: 'New Period',
      startTime: '08:00',
      endTime: '12:00',
      intervalMinutes: 10,
      isPrimeTime: false,
      applicableDays: 'ALL',
      sortOrder: periods.length,
    }
    onPeriodsChange([...periods, newPeriod])
  }, [periods, onPeriodsChange])

  const handleCopyDefaults = useCallback(() => {
    const defaultPeriods: TimePeriod[] = [
      {
        id: `custom-early-${Date.now()}`,
        name: 'Early Bird',
        startTime: '06:00',
        endTime: '07:00',
        intervalMinutes: 12,
        isPrimeTime: false,
        applicableDays: 'ALL',
        sortOrder: 0,
      },
      {
        id: `custom-prime-am-${Date.now()}`,
        name: 'Prime AM',
        startTime: '07:00',
        endTime: '11:00',
        intervalMinutes: 8,
        isPrimeTime: true,
        applicableDays: 'ALL',
        sortOrder: 1,
      },
      {
        id: `custom-midday-${Date.now()}`,
        name: 'Midday',
        startTime: '11:00',
        endTime: '14:00',
        intervalMinutes: 10,
        isPrimeTime: false,
        applicableDays: 'ALL',
        sortOrder: 2,
      },
      {
        id: `custom-prime-pm-${Date.now()}`,
        name: 'Prime PM',
        startTime: '14:00',
        endTime: '16:00',
        intervalMinutes: 8,
        isPrimeTime: true,
        applicableDays: 'ALL',
        sortOrder: 3,
      },
      {
        id: `custom-twilight-${Date.now()}`,
        name: 'Twilight',
        startTime: '16:00',
        endTime: null,
        intervalMinutes: 12,
        isPrimeTime: false,
        applicableDays: 'ALL',
        sortOrder: 4,
      },
    ]
    onPeriodsChange(defaultPeriods)
  }, [onPeriodsChange])

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-stone-500 uppercase flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {label}
        </label>
        <div className="flex items-center gap-2">
          {periods.length === 0 && (
            <button
              type="button"
              onClick={handleCopyDefaults}
              className="text-xs text-amber-600 hover:text-amber-700"
            >
              Use defaults
            </button>
          )}
          <button
            type="button"
            onClick={handleAddPeriod}
            className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>
      </div>

      {periods.length === 0 ? (
        <div className="text-center py-4 text-xs text-stone-400 bg-white rounded-lg border border-dashed border-stone-200">
          No custom periods defined. Click "Use defaults" or "Add" to create periods.
        </div>
      ) : (
        <div className="space-y-1">
          {sortedPeriods.map((period, index) => (
            <PeriodRow
              key={period.id}
              period={period}
              onUpdate={(updated) => handleUpdatePeriod(index, updated)}
              onDelete={() => handleDeletePeriod(period.id)}
            />
          ))}
        </div>
      )}

      <p className="text-[10px] text-stone-400 mt-1">
        Interval = minutes between tee times. Star = prime time pricing.
      </p>
    </div>
  )
}
