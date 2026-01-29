'use client'

import { useState, useCallback } from 'react'
import { cn } from '@clubvantage/ui'
import { Plus, Calendar, ChevronRight, X, Trash2 } from 'lucide-react'
import type { Season, TimePeriod, BookingMode } from './types'
import { InlineTimePeriodEditor } from './inline-time-period-editor'

interface SeasonManagerProps {
  seasons: Season[]
  onSeasonsChange: (seasons: Season[]) => void
}

interface SeasonModalProps {
  season: Season | null
  isOpen: boolean
  onClose: () => void
  onSave: (season: Season) => void
  onDelete?: () => void
  isNew?: boolean
}

// Month names for display
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function formatSeasonRange(season: Season): string {
  const startMonth = MONTHS[season.startMonth - 1] ?? 'Jan'
  const endMonth = MONTHS[season.endMonth - 1] ?? 'Dec'
  return `${startMonth} ${season.startDay} - ${endMonth} ${season.endDay}`
}

function SeasonCard({
  season,
  onClick,
}: {
  season: Season
  onClick: () => void
}) {
  const periodCount = season.timePeriods?.length || 0
  const hasOverrides = season.overrideFirstTee || season.overrideLastTee ||
    season.overrideTwilightTime || season.overrideBookingWindow !== null
  const hasBookingModeOverride = season.weekdayBookingMode || season.weekendBookingMode

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
          <Calendar className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h5 className="font-medium text-stone-900">{season.name}</h5>
          <p className="text-xs text-stone-500">
            {formatSeasonRange(season)}
            {season.isRecurring && ' · Recurring'}
            {hasOverrides && ' · Custom hours'}
            {hasBookingModeOverride && ' · Custom tee mode'}
            {periodCount > 0 && ` · ${periodCount} periods`}
          </p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-stone-400" />
    </button>
  )
}

// Default empty season data
const getEmptySeason = (): Partial<Season> => ({
  name: '',
  startMonth: 1,
  startDay: 1,
  endMonth: 12,
  endDay: 31,
  isRecurring: true,
  priority: 1,
  overrideFirstTee: null,
  overrideLastTee: null,
  overrideBookingWindow: null,
  overrideTwilightTime: null,
  overrideTimePeriods: false,
  timePeriods: [],
  weekdayBookingMode: null,
  weekendBookingMode: null,
})

// Booking mode options
const BOOKING_MODE_OPTIONS: { value: BookingMode | ''; label: string; description: string }[] = [
  { value: '', label: 'Use Base Config', description: 'Inherit from base schedule' },
  { value: 'EIGHTEEN', label: '18 (Single Start)', description: 'Hole 1 tee starts only' },
  { value: 'CROSS', label: 'Cross (Dual Start)', description: 'Hole 1 + Hole 10 starts' },
]

function SeasonModal({
  season,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isNew,
}: SeasonModalProps) {
  const [formData, setFormData] = useState<Partial<Season>>(
    season || getEmptySeason()
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const handleSave = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave(formData as Season)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h3 className="text-lg font-semibold">
            {isNew ? 'Add Season' : 'Edit Season'}
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
              Season Name
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Peak Season, Monsoon"
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500',
                errors.name && 'border-red-500'
              )}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Date Range - Month/Day format */}
          <div className="bg-stone-50 rounded-lg p-3">
            <label className="block text-xs font-medium text-stone-500 uppercase mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Start</label>
                <div className="flex gap-2">
                  <select
                    value={formData.startMonth || 1}
                    onChange={(e) => setFormData({ ...formData, startMonth: parseInt(e.target.value) })}
                    className="flex-1 px-2 py-2 border rounded-lg text-sm"
                  >
                    {MONTHS.map((month, i) => (
                      <option key={month} value={i + 1}>{month}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={formData.startDay || 1}
                    onChange={(e) => setFormData({ ...formData, startDay: parseInt(e.target.value) || 1 })}
                    min={1}
                    max={31}
                    className="w-16 px-2 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">End</label>
                <div className="flex gap-2">
                  <select
                    value={formData.endMonth || 12}
                    onChange={(e) => setFormData({ ...formData, endMonth: parseInt(e.target.value) })}
                    className="flex-1 px-2 py-2 border rounded-lg text-sm"
                  >
                    {MONTHS.map((month, i) => (
                      <option key={month} value={i + 1}>{month}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={formData.endDay || 31}
                    onChange={(e) => setFormData({ ...formData, endDay: parseInt(e.target.value) || 31 })}
                    min={1}
                    max={31}
                    className="w-16 px-2 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isRecurring ?? true}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-stone-600">Recurring every year</span>
            </label>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Priority
            </label>
            <p className="text-xs text-stone-500 mb-2">
              Higher priority seasons override lower ones when dates overlap
            </p>
            <input
              type="number"
              value={formData.priority || 1}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
              min={1}
              max={10}
              className="w-20 px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* Operating Hours Override */}
          <div className="bg-stone-50 rounded-lg p-3">
            <label className="block text-xs font-medium text-stone-500 uppercase mb-2">
              Operating Hours Override (Optional)
            </label>
            <p className="text-xs text-stone-500 mb-3">
              Leave blank to use base schedule hours
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">First Tee</label>
                <input
                  type="time"
                  value={formData.overrideFirstTee || ''}
                  onChange={(e) => setFormData({ ...formData, overrideFirstTee: e.target.value || null })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Last Tee</label>
                <input
                  type="time"
                  value={formData.overrideLastTee || ''}
                  onChange={(e) => setFormData({ ...formData, overrideLastTee: e.target.value || null })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="bg-stone-50 rounded-lg p-3 space-y-3">
            <label className="block text-xs font-medium text-stone-500 uppercase">
              Additional Settings (Optional)
            </label>

            <div>
              <label className="block text-xs text-stone-500 mb-1">Twilight Time Override</label>
              <input
                type="time"
                value={formData.overrideTwilightTime || ''}
                onChange={(e) => setFormData({ ...formData, overrideTwilightTime: e.target.value || null })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-500 mb-1">Booking Window (Days)</label>
              <input
                type="number"
                value={formData.overrideBookingWindow ?? ''}
                onChange={(e) => setFormData({ ...formData, overrideBookingWindow: e.target.value ? parseInt(e.target.value) : null })}
                min={1}
                max={365}
                placeholder="Use default"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            {/* Booking Mode Overrides */}
            <div className="pt-2 border-t border-stone-200">
              <label className="block text-xs text-stone-500 mb-2">Tee Sheet Mode Override</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-stone-400 mb-1">Weekday</label>
                  <select
                    value={formData.weekdayBookingMode || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      weekdayBookingMode: e.target.value ? (e.target.value as BookingMode) : null
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    {BOOKING_MODE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-stone-400 mb-1">Weekend</label>
                  <select
                    value={formData.weekendBookingMode || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      weekendBookingMode: e.target.value ? (e.target.value as BookingMode) : null
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    {BOOKING_MODE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-stone-400 mt-1">
                18 = Single column (Hole 1) · Cross = Dual columns (Hole 1 + 10)
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.overrideTimePeriods ?? false}
                onChange={(e) => setFormData({ ...formData, overrideTimePeriods: e.target.checked })}
                className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-stone-600">Use custom time periods for this season</span>
            </label>

            {formData.overrideTimePeriods && (
              <InlineTimePeriodEditor
                periods={formData.timePeriods || []}
                onPeriodsChange={(periods) => setFormData({ ...formData, timePeriods: periods })}
                label="Season Time Periods"
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t bg-stone-50 rounded-b-2xl sticky bottom-0">
          {onDelete && !isNew ? (
            <button
              onClick={onDelete}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="h-4 w-4" />
              Delete Season
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

export function SeasonManager({
  seasons,
  onSeasonsChange,
}: SeasonManagerProps) {
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNewSeason, setIsNewSeason] = useState(false)

  // Sort by priority (highest first), then by start month/day
  const sortedSeasons = [...seasons].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    const aStart = a.startMonth * 100 + a.startDay
    const bStart = b.startMonth * 100 + b.startDay
    return aStart - bStart
  })

  const handleEditSeason = useCallback((season: Season) => {
    setSelectedSeason(season)
    setIsNewSeason(false)
    setIsModalOpen(true)
  }, [])

  const handleAddSeason = useCallback(() => {
    setSelectedSeason(null)
    setIsNewSeason(true)
    setIsModalOpen(true)
  }, [])

  const handleSaveSeason = useCallback((updatedSeason: Season) => {
    if (isNewSeason) {
      const newSeason: Season = {
        ...updatedSeason,
        id: `season-${Date.now()}`,
        timePeriods: updatedSeason.timePeriods || [],
      }
      onSeasonsChange([...seasons, newSeason])
    } else {
      onSeasonsChange(
        seasons.map((s) => (s.id === updatedSeason.id ? updatedSeason : s))
      )
    }
  }, [isNewSeason, seasons, onSeasonsChange])

  const handleDeleteSeason = useCallback(() => {
    if (selectedSeason) {
      onSeasonsChange(seasons.filter((s) => s.id !== selectedSeason.id))
    }
    setIsModalOpen(false)
  }, [selectedSeason, seasons, onSeasonsChange])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-base font-semibold text-stone-900">Seasons</h4>
          <p className="text-xs text-stone-500 mt-0.5">
            Define seasonal date ranges with custom settings
          </p>
        </div>
        <button
          onClick={handleAddSeason}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg"
        >
          <Plus className="h-4 w-4" />
          Add Season
        </button>
      </div>

      {sortedSeasons.length === 0 ? (
        <div className="text-center py-8 text-stone-500">
          <Calendar className="h-8 w-8 mx-auto mb-2 text-stone-400" />
          <p className="text-sm">No seasons configured</p>
          <p className="text-xs mt-1">Base schedule applies year-round</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedSeasons.map((season) => (
            <SeasonCard
              key={season.id}
              season={season}
              onClick={() => handleEditSeason(season)}
            />
          ))}
        </div>
      )}

      <SeasonModal
        season={selectedSeason}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSeason}
        onDelete={handleDeleteSeason}
        isNew={isNewSeason}
      />
    </div>
  )
}
