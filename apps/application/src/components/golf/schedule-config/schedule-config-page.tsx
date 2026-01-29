'use client'

import { useState, useCallback } from 'react'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { OperatingHoursCard } from './operating-hours-card'
import { TimePeriodEditor } from './time-period-editor'
import { SchedulePreview } from './schedule-preview'
import { SeasonManager } from './season-manager'
import { SpecialDayManager } from './special-day-manager'
import type { ScheduleConfig, TimePeriod, Season, SpecialDay } from './types'
import { DEFAULT_TIME_PERIODS } from './types'

interface ScheduleConfigPageProps {
  courseId: string
  courseName: string
  initialConfig?: ScheduleConfig
  onBack?: () => void
  onSave?: (config: ScheduleConfig) => Promise<void>
}

// Create a default config for new courses
function createDefaultConfig(courseId: string): ScheduleConfig {
  const scheduleId = `schedule-${courseId}`
  return {
    id: scheduleId,
    courseId,
    weekdayFirstTee: '06:00',
    weekdayLastTee: '17:00',
    weekdayBookingMode: 'EIGHTEEN',
    weekendFirstTee: '05:30',
    weekendLastTee: '17:30',
    weekendBookingMode: 'EIGHTEEN',
    twilightMode: 'FIXED',
    twilightMinutesBeforeSunset: 90,
    twilightFixedDefault: '16:00',
    defaultBookingWindowDays: 7,
    timePeriods: DEFAULT_TIME_PERIODS.map((p, i) => ({
      ...p,
      id: `period-${i}`,
      scheduleId,
    })),
    seasons: [],
    specialDays: [],
  }
}

export function ScheduleConfigPage({
  courseId,
  courseName,
  initialConfig,
  onBack,
  onSave,
}: ScheduleConfigPageProps) {
  const [config, setConfig] = useState<ScheduleConfig>(
    initialConfig || createDefaultConfig(courseId)
  )
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateConfig = useCallback(<K extends keyof ScheduleConfig>(
    field: K,
    value: ScheduleConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }, [])

  const handleOperatingHoursChange = useCallback((field: string, value: string) => {
    updateConfig(field as keyof ScheduleConfig, value as never)

    // Validate that first tee is before last tee
    const newErrors = { ...errors }
    if (field === 'weekdayFirstTee' || field === 'weekdayLastTee') {
      const first = field === 'weekdayFirstTee' ? value : config.weekdayFirstTee
      const last = field === 'weekdayLastTee' ? value : config.weekdayLastTee
      if (first >= last) {
        newErrors.weekday = 'First tee must be before last tee'
      } else {
        delete newErrors.weekday
      }
    }
    if (field === 'weekendFirstTee' || field === 'weekendLastTee') {
      const first = field === 'weekendFirstTee' ? value : config.weekendFirstTee
      const last = field === 'weekendLastTee' ? value : config.weekendLastTee
      if (first >= last) {
        newErrors.weekend = 'First tee must be before last tee'
      } else {
        delete newErrors.weekend
      }
    }
    setErrors(newErrors)
  }, [config, errors, updateConfig])

  const handlePeriodsChange = useCallback((periods: TimePeriod[]) => {
    updateConfig('timePeriods', periods)
  }, [updateConfig])

  const handleSeasonsChange = useCallback((seasons: Season[]) => {
    updateConfig('seasons', seasons)
  }, [updateConfig])

  const handleSpecialDaysChange = useCallback((specialDays: SpecialDay[]) => {
    updateConfig('specialDays', specialDays)
  }, [updateConfig])

  const handleSave = async () => {
    if (!onSave) return

    // Validate
    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSaving(true)
    try {
      await onSave(config)
      setHasChanges(false)
    } finally {
      setIsSaving(false)
    }
  }

  // Determine which last tee time to use for preview based on day type
  const getOperatingHoursEnd = () => {
    // Use weekday as default for the timeline visualization
    return config.weekdayLastTee
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Course
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              Schedule Configuration
            </h1>
            <p className="text-sm text-stone-500">
              {courseName} &middot; Configure operating hours, time periods, and more
            </p>
          </div>
        </div>

        {onSave && (
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges || Object.keys(errors).length > 0}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
            {hasChanges && !isSaving && (
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            )}
          </button>
        )}
      </div>

      {/* Main content - two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column - Configuration panels */}
        <div className="lg:col-span-3 space-y-6">
          <OperatingHoursCard
            weekdayFirstTee={config.weekdayFirstTee}
            weekdayLastTee={config.weekdayLastTee}
            weekdayBookingMode={config.weekdayBookingMode}
            weekendFirstTee={config.weekendFirstTee}
            weekendLastTee={config.weekendLastTee}
            weekendBookingMode={config.weekendBookingMode}
            onChange={handleOperatingHoursChange}
            errors={errors}
          />

          <TimePeriodEditor
            periods={config.timePeriods}
            operatingHoursEnd={getOperatingHoursEnd()}
            onPeriodsChange={handlePeriodsChange}
          />

          {/* Placeholder for Twilight Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5">
            <h4 className="text-base font-semibold text-stone-900 mb-4">
              Twilight Settings
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-stone-50">
                <input
                  type="radio"
                  name="twilightMode"
                  checked={config.twilightMode === 'FIXED'}
                  onChange={() => updateConfig('twilightMode', 'FIXED')}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-sm">Fixed times</div>
                  <div className="text-xs text-stone-500">Set manually per season</div>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-stone-50">
                <input
                  type="radio"
                  name="twilightMode"
                  checked={config.twilightMode === 'SUNSET'}
                  onChange={() => updateConfig('twilightMode', 'SUNSET')}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-sm">Sunset-based</div>
                  <div className="text-xs text-stone-500">Calculated from actual sunset</div>
                </div>
              </label>
            </div>

            {config.twilightMode === 'FIXED' && (
              <div className="mt-4 p-3 bg-stone-50 rounded-lg">
                <label className="block text-xs font-medium text-stone-500 mb-2">
                  Default twilight time
                </label>
                <input
                  type="time"
                  value={config.twilightFixedDefault}
                  onChange={(e) => updateConfig('twilightFixedDefault', e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                />
              </div>
            )}

            {config.twilightMode === 'SUNSET' && (
              <div className="mt-4 p-3 bg-stone-50 rounded-lg">
                <label className="block text-xs font-medium text-stone-500 mb-2">
                  Minutes before sunset
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={config.twilightMinutesBeforeSunset}
                    onChange={(e) => updateConfig('twilightMinutesBeforeSunset', parseInt(e.target.value) || 90)}
                    min={30}
                    max={180}
                    className="w-20 px-3 py-2 border rounded-lg"
                  />
                  <span className="text-sm text-stone-500">minutes</span>
                </div>
              </div>
            )}
          </div>

          <SeasonManager
            seasons={config.seasons}
            onSeasonsChange={handleSeasonsChange}
          />

          <SpecialDayManager
            specialDays={config.specialDays}
            onSpecialDaysChange={handleSpecialDaysChange}
          />
        </div>

        {/* Right column - Preview */}
        <div className="lg:col-span-2 lg:sticky lg:top-4 lg:h-fit">
          <SchedulePreview config={config} />
        </div>
      </div>
    </div>
  )
}
