'use client'

import { useState } from 'react'
import { PageHeader } from '@clubvantage/ui'
import { SettingsTab } from '@/components/golf/settings-tab'

const initialSettings = {
  general: {
    teeTimeInterval: 8,
    firstTeeTime: '06:00',
    lastTeeTime: '17:00',
    advanceBookingDays: 14,
    maxPlayersPerBooking: 4,
    walkupsAllowed: true,
  },
  schedule: {
    weekday: { firstTeeTime: '06:00', lastTeeTime: '17:00', interval: 8 },
    weekend: { firstTeeTime: '06:00', lastTeeTime: '17:30', interval: 8 },
    seasons: [] as Array<{
      id: string
      name: string
      type: 'high' | 'low'
      startDate: string
      endDate: string
      customSchedule?: {
        weekday: { firstTeeTime: string; lastTeeTime: string; interval: number }
        weekend: { firstTeeTime: string; lastTeeTime: string; interval: number }
      }
    }>,
    holidays: [] as Array<{
      id: string
      name: string
      date: string
      recurring: boolean
      customSchedule?: {
        weekday: { firstTeeTime: string; lastTeeTime: string; interval: number }
        weekend: { firstTeeTime: string; lastTeeTime: string; interval: number }
      }
    }>,
  },
  cancellation: {
    fullRefundHours: 48,
    partialRefundHours: 24,
    partialRefundPercentage: 50,
    noShowFee: 500,
  },
  guest: {
    maxGuestsPerMember: 3,
    requireSponsor: true,
    guestGreenFeeMultiplier: 1.5,
  },
  standingTeeTime: {
    enabled: true,
    maxStandingTimesPerMember: 2,
    priorityLevels: ['Gold', 'Silver', 'Bronze'],
    seasonRequired: true,
  },
  noShow: {
    gracePeriod: 15,
    penaltyFee: 500,
    maxStrikesPerYear: 3,
    suspensionDays: 30,
  },
  notifications: {
    bookingConfirmation: true,
    reminder24Hour: true,
    reminder2Hour: true,
    groupingNotice: true,
    cancellationConfirmation: true,
    noShowNotice: true,
  },
  blockManagement: {
    starterBlock: {
      enabled: false,
      numberOfSlots: 1,
      applyTo: 'all' as const,
    },
    defaultBlockDurationMinutes: 60,
    recurringMaintenance: [],
  },
}

export default function GolfSettingsPage() {
  const [golfSettings, setGolfSettings] = useState(initialSettings)

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Golf Management"
        description="Configure golf settings"
        breadcrumbs={[{ label: 'Golf' }, { label: 'Settings' }]}
      />

      <SettingsTab
        settings={golfSettings}
        onSaveSection={async (section: string, data: unknown) => {
          console.log('Saving section:', section, data)
          setGolfSettings(prev => ({
            ...prev,
            [section]: data,
          }))
          await new Promise((resolve) => setTimeout(resolve, 500))
        }}
      />
    </div>
  )
}
