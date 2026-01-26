'use client'

import { useState } from 'react'
import { cn } from '@clubvantage/ui'
import { ChevronDown, Loader2, Check, Plus, Trash2 } from 'lucide-react'

interface GeneralSettings {
  teeTimeInterval: number
  firstTeeTime: string
  lastTeeTime: string
  advanceBookingDays: number
  maxPlayersPerBooking: number
  walkupsAllowed: boolean
}

interface ScheduleConfig {
  weekday: {
    firstTeeTime: string
    lastTeeTime: string
    interval: number
  }
  weekend: {
    firstTeeTime: string
    lastTeeTime: string
    interval: number
  }
  seasons: {
    id: string
    name: string
    type: 'high' | 'low'
    startDate: string
    endDate: string
    customSchedule?: {
      firstTeeTime: string
      lastTeeTime: string
      interval: number
    }
  }[]
  holidays: {
    id: string
    name: string
    date: string
    recurring: boolean
    customSchedule?: {
      firstTeeTime: string
      lastTeeTime: string
      interval: number
    }
  }[]
}

interface CancellationPolicy {
  fullRefundHours: number
  partialRefundHours: number
  partialRefundPercentage: number
  noShowFee: number
}

interface GuestPolicy {
  maxGuestsPerMember: number
  requireSponsor: boolean
  guestGreenFeeMultiplier: number
}

interface StandingTeeTimeRules {
  enabled: boolean
  maxStandingTimesPerMember: number
  priorityLevels: string[]
  seasonRequired: boolean
}

interface NoShowPolicy {
  gracePeriod: number
  penaltyFee: number
  maxStrikesPerYear: number
  suspensionDays: number
}

interface NotificationSettings {
  bookingConfirmation: boolean
  reminder24Hour: boolean
  reminder2Hour: boolean
  groupingNotice: boolean
  cancellationConfirmation: boolean
  noShowNotice: boolean
}

interface GolfSettings {
  general: GeneralSettings
  schedule: ScheduleConfig
  cancellation: CancellationPolicy
  guest: GuestPolicy
  standingTeeTime: StandingTeeTimeRules
  noShow: NoShowPolicy
  notifications: NotificationSettings
}

interface SettingsTabProps {
  settings: GolfSettings
  isLoading?: boolean
  onSaveSection: (section: keyof GolfSettings, data: unknown) => Promise<void>
}

interface CollapsibleSectionProps {
  title: string
  description?: string
  expanded: boolean
  onToggle: () => void
  saving?: boolean
  saved?: boolean
  children: React.ReactNode
  onSave?: () => void
  hasChanges?: boolean
}

function CollapsibleSection({
  title,
  description,
  expanded,
  onToggle,
  saving,
  saved,
  children,
  onSave,
  hasChanges,
}: CollapsibleSectionProps) {
  return (
    <div className="border rounded-lg">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="text-left">
          <h3 className="font-medium">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-emerald-600">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
          <ChevronDown
            className={cn(
              'h-5 w-5 text-muted-foreground transition-transform',
              expanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t p-4 space-y-4">
          {children}

          {onSave && (
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={onSave}
                disabled={saving || !hasChanges}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-muted'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-5'
          )}
        />
      </button>
      {label && <span className="text-sm">{label}</span>}
    </label>
  )
}

function SkeletonSection() {
  return (
    <div className="border rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="h-4 w-60 bg-muted/50 rounded" />
        </div>
        <div className="h-5 w-5 bg-muted rounded" />
      </div>
    </div>
  )
}

export function SettingsTab({
  settings,
  isLoading,
  onSaveSection,
}: SettingsTabProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [savedSection, setSavedSection] = useState<string | null>(null)

  // Local state for each section
  const [general, setGeneral] = useState(settings.general)
  const [schedule, setSchedule] = useState(settings.schedule)
  const [cancellation, setCancellation] = useState(settings.cancellation)
  const [guest, setGuest] = useState(settings.guest)
  const [standingTeeTime, setStandingTeeTime] = useState(settings.standingTeeTime)
  const [noShow, setNoShow] = useState(settings.noShow)
  const [notifications, setNotifications] = useState(settings.notifications)

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    )
  }

  const handleSave = async (section: keyof GolfSettings, data: unknown) => {
    setSavingSection(section)
    setSavedSection(null)

    try {
      await onSaveSection(section, data)
      setSavedSection(section)
      setTimeout(() => setSavedSection(null), 2000)
    } finally {
      setSavingSection(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <SkeletonSection key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 1. General Settings */}
      <CollapsibleSection
        title="General Settings"
        description="Basic tee time configuration"
        expanded={expandedSections.includes('general')}
        onToggle={() => toggleSection('general')}
        saving={savingSection === 'general'}
        saved={savedSection === 'general'}
        hasChanges={JSON.stringify(general) !== JSON.stringify(settings.general)}
        onSave={() => handleSave('general', general)}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Tee Time Interval
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={general.teeTimeInterval}
                onChange={(e) =>
                  setGeneral({ ...general, teeTimeInterval: parseInt(e.target.value) || 8 })
                }
                min={1}
                max={30}
                className="w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Advance Booking Days
            </label>
            <input
              type="number"
              value={general.advanceBookingDays}
              onChange={(e) =>
                setGeneral({ ...general, advanceBookingDays: parseInt(e.target.value) || 7 })
              }
              min={1}
              className="w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              First Tee Time
            </label>
            <input
              type="time"
              value={general.firstTeeTime}
              onChange={(e) =>
                setGeneral({ ...general, firstTeeTime: e.target.value })
              }
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Last Tee Time
            </label>
            <input
              type="time"
              value={general.lastTeeTime}
              onChange={(e) =>
                setGeneral({ ...general, lastTeeTime: e.target.value })
              }
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Max Players Per Booking
            </label>
            <select
              value={general.maxPlayersPerBooking}
              onChange={(e) =>
                setGeneral({ ...general, maxPlayersPerBooking: parseInt(e.target.value) })
              }
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <ToggleSwitch
              checked={general.walkupsAllowed}
              onChange={(checked) => setGeneral({ ...general, walkupsAllowed: checked })}
              label="Walk-ups Allowed"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* 2. Schedule Configuration */}
      <CollapsibleSection
        title="Schedule Configuration"
        description="Weekday, weekend, seasons, and holidays"
        expanded={expandedSections.includes('schedule')}
        onToggle={() => toggleSection('schedule')}
        saving={savingSection === 'schedule'}
        saved={savedSection === 'schedule'}
        hasChanges={JSON.stringify(schedule) !== JSON.stringify(settings.schedule)}
        onSave={() => handleSave('schedule', schedule)}
      >
        <p className="text-sm text-muted-foreground mb-4">
          Schedule priority: Holidays &gt; Seasons &gt; Weekend/Weekday
        </p>

        {/* Base Schedules */}
        <div className="space-y-4 mb-6">
          <h4 className="font-medium text-sm">Base Schedules</h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-3">
              <h5 className="text-sm font-medium mb-3">Weekday</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground w-16">First:</label>
                  <input
                    type="time"
                    value={schedule.weekday.firstTeeTime}
                    onChange={(e) =>
                      setSchedule({
                        ...schedule,
                        weekday: { ...schedule.weekday, firstTeeTime: e.target.value },
                      })
                    }
                    className="flex-1 px-2 py-1 text-sm border rounded"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground w-16">Last:</label>
                  <input
                    type="time"
                    value={schedule.weekday.lastTeeTime}
                    onChange={(e) =>
                      setSchedule({
                        ...schedule,
                        weekday: { ...schedule.weekday, lastTeeTime: e.target.value },
                      })
                    }
                    className="flex-1 px-2 py-1 text-sm border rounded"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground w-16">Interval:</label>
                  <input
                    type="number"
                    value={schedule.weekday.interval}
                    onChange={(e) =>
                      setSchedule({
                        ...schedule,
                        weekday: { ...schedule.weekday, interval: parseInt(e.target.value) || 8 },
                      })
                    }
                    className="w-16 px-2 py-1 text-sm border rounded"
                  />
                  <span className="text-xs text-muted-foreground">min</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-3">
              <h5 className="text-sm font-medium mb-3">Weekend</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground w-16">First:</label>
                  <input
                    type="time"
                    value={schedule.weekend.firstTeeTime}
                    onChange={(e) =>
                      setSchedule({
                        ...schedule,
                        weekend: { ...schedule.weekend, firstTeeTime: e.target.value },
                      })
                    }
                    className="flex-1 px-2 py-1 text-sm border rounded"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground w-16">Last:</label>
                  <input
                    type="time"
                    value={schedule.weekend.lastTeeTime}
                    onChange={(e) =>
                      setSchedule({
                        ...schedule,
                        weekend: { ...schedule.weekend, lastTeeTime: e.target.value },
                      })
                    }
                    className="flex-1 px-2 py-1 text-sm border rounded"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground w-16">Interval:</label>
                  <input
                    type="number"
                    value={schedule.weekend.interval}
                    onChange={(e) =>
                      setSchedule({
                        ...schedule,
                        weekend: { ...schedule.weekend, interval: parseInt(e.target.value) || 8 },
                      })
                    }
                    className="w-16 px-2 py-1 text-sm border rounded"
                  />
                  <span className="text-xs text-muted-foreground">min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seasons */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Seasons</h4>
            <button
              onClick={() =>
                setSchedule({
                  ...schedule,
                  seasons: [
                    ...schedule.seasons,
                    {
                      id: `season-${Date.now()}`,
                      name: '',
                      type: 'high',
                      startDate: '',
                      endDate: '',
                    },
                  ],
                })
              }
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Plus className="h-4 w-4" />
              Add Season
            </button>
          </div>

          {schedule.seasons.length === 0 ? (
            <p className="text-sm text-muted-foreground">No seasons configured</p>
          ) : (
            <div className="space-y-2">
              {schedule.seasons.map((season, index) => (
                <div key={season.id} className="flex items-center gap-2 p-2 border rounded">
                  <input
                    type="text"
                    value={season.name}
                    onChange={(e) => {
                      const newSeasons = [...schedule.seasons]
                      newSeasons[index] = { ...season, name: e.target.value }
                      setSchedule({ ...schedule, seasons: newSeasons })
                    }}
                    placeholder="Name"
                    className="flex-1 px-2 py-1 text-sm border rounded"
                  />
                  <select
                    value={season.type}
                    onChange={(e) => {
                      const newSeasons = [...schedule.seasons]
                      newSeasons[index] = { ...season, type: e.target.value as 'high' | 'low' }
                      setSchedule({ ...schedule, seasons: newSeasons })
                    }}
                    className="px-2 py-1 text-sm border rounded"
                  >
                    <option value="high">High</option>
                    <option value="low">Low</option>
                  </select>
                  <input
                    type="text"
                    value={season.startDate}
                    onChange={(e) => {
                      const newSeasons = [...schedule.seasons]
                      newSeasons[index] = { ...season, startDate: e.target.value }
                      setSchedule({ ...schedule, seasons: newSeasons })
                    }}
                    placeholder="MM-DD"
                    className="w-20 px-2 py-1 text-sm border rounded"
                  />
                  <span className="text-muted-foreground">to</span>
                  <input
                    type="text"
                    value={season.endDate}
                    onChange={(e) => {
                      const newSeasons = [...schedule.seasons]
                      newSeasons[index] = { ...season, endDate: e.target.value }
                      setSchedule({ ...schedule, seasons: newSeasons })
                    }}
                    placeholder="MM-DD"
                    className="w-20 px-2 py-1 text-sm border rounded"
                  />
                  <button
                    onClick={() =>
                      setSchedule({
                        ...schedule,
                        seasons: schedule.seasons.filter((s) => s.id !== season.id),
                      })
                    }
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Holidays */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Holidays</h4>
            <button
              onClick={() =>
                setSchedule({
                  ...schedule,
                  holidays: [
                    ...schedule.holidays,
                    {
                      id: `holiday-${Date.now()}`,
                      name: '',
                      date: '',
                      recurring: false,
                    },
                  ],
                })
              }
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Plus className="h-4 w-4" />
              Add Holiday
            </button>
          </div>

          {schedule.holidays.length === 0 ? (
            <p className="text-sm text-muted-foreground">No holidays configured</p>
          ) : (
            <div className="space-y-2">
              {schedule.holidays.map((holiday, index) => (
                <div key={holiday.id} className="flex items-center gap-2 p-2 border rounded">
                  <input
                    type="text"
                    value={holiday.name}
                    onChange={(e) => {
                      const newHolidays = [...schedule.holidays]
                      newHolidays[index] = { ...holiday, name: e.target.value }
                      setSchedule({ ...schedule, holidays: newHolidays })
                    }}
                    placeholder="Name"
                    className="flex-1 px-2 py-1 text-sm border rounded"
                  />
                  <input
                    type="date"
                    value={holiday.date}
                    onChange={(e) => {
                      const newHolidays = [...schedule.holidays]
                      newHolidays[index] = { ...holiday, date: e.target.value }
                      setSchedule({ ...schedule, holidays: newHolidays })
                    }}
                    className="px-2 py-1 text-sm border rounded"
                  />
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={holiday.recurring}
                      onChange={(e) => {
                        const newHolidays = [...schedule.holidays]
                        newHolidays[index] = { ...holiday, recurring: e.target.checked }
                        setSchedule({ ...schedule, holidays: newHolidays })
                      }}
                    />
                    Recurring
                  </label>
                  <button
                    onClick={() =>
                      setSchedule({
                        ...schedule,
                        holidays: schedule.holidays.filter((h) => h.id !== holiday.id),
                      })
                    }
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* 3. Cancellation Policy */}
      <CollapsibleSection
        title="Cancellation Policy"
        description="Refund rules and no-show fees"
        expanded={expandedSections.includes('cancellation')}
        onToggle={() => toggleSection('cancellation')}
        saving={savingSection === 'cancellation'}
        saved={savedSection === 'cancellation'}
        hasChanges={JSON.stringify(cancellation) !== JSON.stringify(settings.cancellation)}
        onSave={() => handleSave('cancellation', cancellation)}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Full Refund Hours
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={cancellation.fullRefundHours}
                onChange={(e) =>
                  setCancellation({ ...cancellation, fullRefundHours: parseInt(e.target.value) || 0 })
                }
                min={0}
                className="w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">hours before tee time</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Partial Refund Hours
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={cancellation.partialRefundHours}
                onChange={(e) =>
                  setCancellation({ ...cancellation, partialRefundHours: parseInt(e.target.value) || 0 })
                }
                min={0}
                className="w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">hours before tee time</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Partial Refund Amount
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={cancellation.partialRefundPercentage}
                onChange={(e) =>
                  setCancellation({ ...cancellation, partialRefundPercentage: parseInt(e.target.value) || 0 })
                }
                min={0}
                max={100}
                className="w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              No-Show Fee
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">฿</span>
              <input
                type="number"
                value={cancellation.noShowFee}
                onChange={(e) =>
                  setCancellation({ ...cancellation, noShowFee: parseInt(e.target.value) || 0 })
                }
                min={0}
                className="w-28 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* 4. Guest Policy */}
      <CollapsibleSection
        title="Guest Policy"
        description="Guest limits and fees"
        expanded={expandedSections.includes('guest')}
        onToggle={() => toggleSection('guest')}
        saving={savingSection === 'guest'}
        saved={savedSection === 'guest'}
        hasChanges={JSON.stringify(guest) !== JSON.stringify(settings.guest)}
        onSave={() => handleSave('guest', guest)}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Max Guests Per Member
            </label>
            <input
              type="number"
              value={guest.maxGuestsPerMember}
              onChange={(e) =>
                setGuest({ ...guest, maxGuestsPerMember: parseInt(e.target.value) || 1 })
              }
              min={0}
              className="w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Guest Green Fee Multiplier
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={guest.guestGreenFeeMultiplier}
                onChange={(e) =>
                  setGuest({ ...guest, guestGreenFeeMultiplier: parseFloat(e.target.value) || 1 })
                }
                min={0}
                step={0.1}
                className="w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">x member rate</span>
            </div>
          </div>

          <div className="col-span-2">
            <ToggleSwitch
              checked={guest.requireSponsor}
              onChange={(checked) => setGuest({ ...guest, requireSponsor: checked })}
              label="Require Member Sponsor"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* 5. Standing Tee Time Rules */}
      <CollapsibleSection
        title="Standing Tee Time Rules"
        description="Recurring reservation settings"
        expanded={expandedSections.includes('standingTeeTime')}
        onToggle={() => toggleSection('standingTeeTime')}
        saving={savingSection === 'standingTeeTime'}
        saved={savedSection === 'standingTeeTime'}
        hasChanges={JSON.stringify(standingTeeTime) !== JSON.stringify(settings.standingTeeTime)}
        onSave={() => handleSave('standingTeeTime', standingTeeTime)}
      >
        <div className="space-y-4">
          <ToggleSwitch
            checked={standingTeeTime.enabled}
            onChange={(checked) => setStandingTeeTime({ ...standingTeeTime, enabled: checked })}
            label="Enable Standing Tee Times"
          />

          {standingTeeTime.enabled && (
            <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-gray-200">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Max Standing Times Per Member
                </label>
                <input
                  type="number"
                  value={standingTeeTime.maxStandingTimesPerMember}
                  onChange={(e) =>
                    setStandingTeeTime({
                      ...standingTeeTime,
                      maxStandingTimesPerMember: parseInt(e.target.value) || 1,
                    })
                  }
                  min={1}
                  className="w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="col-span-2">
                <ToggleSwitch
                  checked={standingTeeTime.seasonRequired}
                  onChange={(checked) =>
                    setStandingTeeTime({ ...standingTeeTime, seasonRequired: checked })
                  }
                  label="Season Required"
                />
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* 6. No-Show Policy */}
      <CollapsibleSection
        title="No-Show Policy"
        description="Penalties and suspension rules"
        expanded={expandedSections.includes('noShow')}
        onToggle={() => toggleSection('noShow')}
        saving={savingSection === 'noShow'}
        saved={savedSection === 'noShow'}
        hasChanges={JSON.stringify(noShow) !== JSON.stringify(settings.noShow)}
        onSave={() => handleSave('noShow', noShow)}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Grace Period
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={noShow.gracePeriod}
                onChange={(e) =>
                  setNoShow({ ...noShow, gracePeriod: parseInt(e.target.value) || 0 })
                }
                min={0}
                className="w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Penalty Fee
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">฿</span>
              <input
                type="number"
                value={noShow.penaltyFee}
                onChange={(e) =>
                  setNoShow({ ...noShow, penaltyFee: parseInt(e.target.value) || 0 })
                }
                min={0}
                className="w-28 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Max Strikes Per Year
            </label>
            <input
              type="number"
              value={noShow.maxStrikesPerYear}
              onChange={(e) =>
                setNoShow({ ...noShow, maxStrikesPerYear: parseInt(e.target.value) || 3 })
              }
              min={1}
              className="w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Suspension After Max Strikes
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={noShow.suspensionDays}
                onChange={(e) =>
                  setNoShow({ ...noShow, suspensionDays: parseInt(e.target.value) || 0 })
                }
                min={0}
                className="w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* 7. Notification Settings */}
      <CollapsibleSection
        title="Notification Settings"
        description="Email and SMS notifications"
        expanded={expandedSections.includes('notifications')}
        onToggle={() => toggleSection('notifications')}
        saving={savingSection === 'notifications'}
        saved={savedSection === 'notifications'}
        hasChanges={JSON.stringify(notifications) !== JSON.stringify(settings.notifications)}
        onSave={() => handleSave('notifications', notifications)}
      >
        <div className="space-y-3">
          <ToggleSwitch
            checked={notifications.bookingConfirmation}
            onChange={(checked) =>
              setNotifications({ ...notifications, bookingConfirmation: checked })
            }
            label="Booking Confirmation"
          />
          <ToggleSwitch
            checked={notifications.reminder24Hour}
            onChange={(checked) =>
              setNotifications({ ...notifications, reminder24Hour: checked })
            }
            label="24-Hour Reminder"
          />
          <ToggleSwitch
            checked={notifications.reminder2Hour}
            onChange={(checked) =>
              setNotifications({ ...notifications, reminder2Hour: checked })
            }
            label="2-Hour Reminder"
          />
          <ToggleSwitch
            checked={notifications.groupingNotice}
            onChange={(checked) =>
              setNotifications({ ...notifications, groupingNotice: checked })
            }
            label="Grouping Notice"
          />
          <ToggleSwitch
            checked={notifications.cancellationConfirmation}
            onChange={(checked) =>
              setNotifications({ ...notifications, cancellationConfirmation: checked })
            }
            label="Cancellation Confirmation"
          />
          <ToggleSwitch
            checked={notifications.noShowNotice}
            onChange={(checked) =>
              setNotifications({ ...notifications, noShowNotice: checked })
            }
            label="No-Show Notice"
          />
        </div>
      </CollapsibleSection>
    </div>
  )
}
