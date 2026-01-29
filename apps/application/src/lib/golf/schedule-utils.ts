/**
 * Shared utility functions for golf schedule/slot generation
 * Used by both the schedule preview component and the live tee sheet
 */

import type { Flight, Player } from '@/components/golf/types'
import type { FlightStatus } from '@/components/golf/flight-status-badge'

// Types matching the GraphQL schema
export type TwilightMode = 'FIXED' | 'SUNSET'
export type ApplicableDays = 'WEEKDAY' | 'WEEKEND' | 'ALL'
export type SpecialDayType = 'WEEKEND' | 'HOLIDAY' | 'CLOSED' | 'CUSTOM'
export type BookingMode = 'EIGHTEEN' | 'CROSS' // EIGHTEEN = single column, CROSS = dual columns (Hole 1 + 10)

export interface TimePeriod {
  id: string
  name: string
  startTime: string
  endTime: string | null
  intervalMinutes: number
  isPrimeTime: boolean
  applicableDays: ApplicableDays
  sortOrder: number
}

export interface Season {
  id: string
  name: string
  startMonth: number
  startDay: number
  endMonth: number
  endDay: number
  isRecurring: boolean
  priority: number
  overrideFirstTee: string | null
  overrideLastTee: string | null
  overrideBookingWindow: number | null
  overrideTwilightTime: string | null
  overrideTimePeriods: boolean
  timePeriods: TimePeriod[]
  weekdayBookingMode?: BookingMode | null
  weekendBookingMode?: BookingMode | null
}

export interface SpecialDay {
  id: string
  name: string
  startDate: string
  endDate: string
  isRecurring: boolean
  type: SpecialDayType
  customFirstTee: string | null
  customLastTee: string | null
  customTimePeriods: boolean
  timePeriods: TimePeriod[]
  bookingMode?: BookingMode | null
}

export interface ScheduleConfig {
  id: string
  courseId: string
  weekdayFirstTee: string
  weekdayLastTee: string
  weekdayBookingMode: BookingMode
  weekendFirstTee: string
  weekendLastTee: string
  weekendBookingMode: BookingMode
  twilightMode: TwilightMode
  twilightMinutesBeforeSunset: number
  twilightFixedDefault: string
  clubLatitude?: number | null
  clubLongitude?: number | null
  defaultBookingWindowDays: number
  timePeriods: TimePeriod[]
  seasons: Season[]
  specialDays: SpecialDay[]
}

export interface EffectiveSchedule {
  courseId: string
  date: string
  firstTee: string
  lastTee: string
  bookingMode: BookingMode
  twilightMode: TwilightMode
  twilightTime: string
  bookingWindowDays: number
  timePeriods: TimePeriod[]
  activeSeason?: {
    id: string
    name: string
  }
  activeSpecialDay?: {
    id: string
    name: string
    type: SpecialDayType
  }
  isClosed: boolean
}

export interface TeeTimeSlot {
  time: string
  periodName: string
  interval: number
  isPrimeTime: boolean
  isTwilight: boolean
}

export interface SchedulePreviewData {
  date: string
  dayType: 'WEEKDAY' | 'WEEKEND'
  bookingMode: BookingMode
  operatingHours: {
    firstTee: string
    lastTee: string
  }
  twilightTime: string
  teeTimeSlots: TeeTimeSlot[]
  activeSeason?: { id: string; name: string }
  activeSpecialDay?: { id: string; name: string; type: SpecialDayType }
  isClosed: boolean
  summary: {
    totalSlots: number
    maxPlayers: number
    primeTimeSlots: number
    primeTimePercentage: number
  }
}

/**
 * Check if a date is a weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

/**
 * Parse a time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const parts = time.split(':').map(Number)
  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0
  return hours * 60 + minutes
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Format time for display (12-hour format)
 */
export function formatTime(time: string): string {
  const parts = time.split(':')
  const hours = parts[0] ?? '00'
  const minutes = parts[1] ?? '00'
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${displayHour}:${minutes.padStart(2, '0')} ${ampm}`
}

/**
 * Calculate twilight time based on sunset
 */
function calculateTwilightFromSunset(
  date: Date,
  latitude: number,
  longitude: number,
  minutesBeforeSunset: number,
): string {
  // Simplified sunset calculation
  // For production, use suncalc or similar library
  const dayOfYear = getDayOfYear(date)
  const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * (Math.PI / 180))
  const latRad = latitude * (Math.PI / 180)
  const decRad = declination * (Math.PI / 180)

  // Hour angle at sunset
  const cosHourAngle = -Math.tan(latRad) * Math.tan(decRad)
  const hourAngle = Math.acos(Math.max(-1, Math.min(1, cosHourAngle))) * (180 / Math.PI)

  // Sunset time in hours (local solar time)
  const solarNoon = 12 - longitude / 15
  const sunsetHours = solarNoon + hourAngle / 15

  // Apply minutes before sunset
  const twilightMinutes = sunsetHours * 60 - minutesBeforeSunset
  return minutesToTime(Math.floor(twilightMinutes))
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

/**
 * Check if a date falls within a season's range
 */
function isDateInSeasonRange(
  month: number,
  day: number,
  season: Season,
): boolean {
  const startVal = season.startMonth * 100 + season.startDay
  const endVal = season.endMonth * 100 + season.endDay
  const dateVal = month * 100 + day

  if (startVal <= endVal) {
    // Normal range (e.g., Mar 1 - Oct 31)
    return dateVal >= startVal && dateVal <= endVal
  } else {
    // Range spans year boundary (e.g., Nov 1 - Feb 28)
    return dateVal >= startVal || dateVal <= endVal
  }
}

/**
 * Find matching season for a date
 */
function findMatchingSeason(seasons: Season[], date: Date): Season | null {
  const month = date.getMonth() + 1
  const day = date.getDate()

  // Sort by priority (highest first)
  const sorted = [...seasons].sort((a, b) => b.priority - a.priority)

  for (const season of sorted) {
    if (isDateInSeasonRange(month, day, season)) {
      return season
    }
  }

  return null
}

/**
 * Find matching special day for a date
 */
function findMatchingSpecialDay(specialDays: SpecialDay[], date: Date): SpecialDay | null {
  const dateStr = date.toISOString().split('T')[0] ?? ''
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const mmdd = `${month}-${day}`

  for (const specialDay of specialDays) {
    if (specialDay.isRecurring) {
      // Check MM-DD format
      if (specialDay.startDate <= mmdd && mmdd <= specialDay.endDate) {
        return specialDay
      }
      // Handle range across year boundary
      if (specialDay.startDate > specialDay.endDate) {
        if (mmdd >= specialDay.startDate || mmdd <= specialDay.endDate) {
          return specialDay
        }
      }
    } else {
      // Check YYYY-MM-DD format
      if (specialDay.startDate <= dateStr && dateStr <= specialDay.endDate) {
        return specialDay
      }
    }
  }

  return null
}

/**
 * Get the effective schedule for a specific date
 * Applies season and special day overrides to the base config
 */
export function getEffectiveScheduleForDate(
  config: ScheduleConfig,
  date: Date,
): EffectiveSchedule {
  const dateStr = date.toISOString().split('T')[0] ?? ''
  const weekend = isWeekend(date)
  const dayType = weekend ? 'WEEKEND' : 'WEEKDAY'

  // Start with base operating hours
  let firstTee = weekend ? config.weekendFirstTee : config.weekdayFirstTee
  let lastTee = weekend ? config.weekendLastTee : config.weekdayLastTee
  let bookingMode: BookingMode = weekend ? config.weekendBookingMode : config.weekdayBookingMode
  let bookingWindowDays = config.defaultBookingWindowDays
  let twilightTime = config.twilightFixedDefault
  let timePeriods = config.timePeriods
  let activeSeason: EffectiveSchedule['activeSeason'] = undefined
  let activeSpecialDay: EffectiveSchedule['activeSpecialDay'] = undefined
  let isClosed = false

  // Check for active season
  const matchingSeason = findMatchingSeason(config.seasons, date)
  if (matchingSeason) {
    activeSeason = {
      id: matchingSeason.id,
      name: matchingSeason.name,
    }

    // Apply season overrides
    if (matchingSeason.overrideFirstTee) {
      firstTee = matchingSeason.overrideFirstTee
    }
    if (matchingSeason.overrideLastTee) {
      lastTee = matchingSeason.overrideLastTee
    }
    if (matchingSeason.overrideBookingWindow !== null) {
      bookingWindowDays = matchingSeason.overrideBookingWindow
    }
    if (matchingSeason.overrideTwilightTime) {
      twilightTime = matchingSeason.overrideTwilightTime
    }
    if (matchingSeason.overrideTimePeriods && matchingSeason.timePeriods.length > 0) {
      timePeriods = matchingSeason.timePeriods
    }
    // Apply season booking mode override
    const seasonBookingMode = weekend
      ? matchingSeason.weekendBookingMode
      : matchingSeason.weekdayBookingMode
    if (seasonBookingMode) {
      bookingMode = seasonBookingMode
    }
  }

  // Check for special day (takes precedence over season)
  const matchingSpecialDay = findMatchingSpecialDay(config.specialDays, date)
  if (matchingSpecialDay) {
    activeSpecialDay = {
      id: matchingSpecialDay.id,
      name: matchingSpecialDay.name,
      type: matchingSpecialDay.type,
    }

    // Handle different special day types
    if (matchingSpecialDay.type === 'CLOSED') {
      isClosed = true
    } else if (matchingSpecialDay.type === 'WEEKEND') {
      // Treat as weekend regardless of actual day
      firstTee = config.weekendFirstTee
      lastTee = config.weekendLastTee
    } else if (matchingSpecialDay.type === 'HOLIDAY') {
      // Use weekend hours for holidays
      firstTee = config.weekendFirstTee
      lastTee = config.weekendLastTee
    }

    // Apply custom overrides if type is CUSTOM
    if (matchingSpecialDay.type === 'CUSTOM') {
      if (matchingSpecialDay.customFirstTee) {
        firstTee = matchingSpecialDay.customFirstTee
      }
      if (matchingSpecialDay.customLastTee) {
        lastTee = matchingSpecialDay.customLastTee
      }
      if (matchingSpecialDay.customTimePeriods && matchingSpecialDay.timePeriods.length > 0) {
        timePeriods = matchingSpecialDay.timePeriods
      }
    }

    // Apply special day booking mode override (highest priority)
    if (matchingSpecialDay.bookingMode) {
      bookingMode = matchingSpecialDay.bookingMode
    }
  }

  // Calculate twilight time if using SUNSET mode
  if (config.twilightMode === 'SUNSET' && config.clubLatitude && config.clubLongitude) {
    twilightTime = calculateTwilightFromSunset(
      date,
      config.clubLatitude,
      config.clubLongitude,
      config.twilightMinutesBeforeSunset,
    )
  }

  // Filter time periods by applicable days
  const effectiveTimePeriods = timePeriods.filter(
    (p) => p.applicableDays === 'ALL' || p.applicableDays === dayType,
  )

  return {
    courseId: config.courseId,
    date: dateStr,
    firstTee,
    lastTee,
    bookingMode,
    twilightMode: config.twilightMode,
    twilightTime,
    bookingWindowDays,
    timePeriods: effectiveTimePeriods,
    activeSeason,
    activeSpecialDay,
    isClosed,
  }
}

/**
 * Generate tee time slots based on schedule configuration
 */
export function generateTeeTimeSlots(
  config: ScheduleConfig,
  date: Date,
): SchedulePreviewData {
  const effective = getEffectiveScheduleForDate(config, date)
  const weekend = isWeekend(date)
  const dayType = weekend ? 'WEEKEND' : 'WEEKDAY'

  if (effective.isClosed) {
    return {
      date: effective.date,
      dayType,
      bookingMode: effective.bookingMode,
      operatingHours: {
        firstTee: effective.firstTee,
        lastTee: effective.lastTee,
      },
      twilightTime: effective.twilightTime,
      teeTimeSlots: [],
      activeSeason: effective.activeSeason,
      activeSpecialDay: effective.activeSpecialDay,
      isClosed: true,
      summary: {
        totalSlots: 0,
        maxPlayers: 0,
        primeTimeSlots: 0,
        primeTimePercentage: 0,
      },
    }
  }

  const slots: TeeTimeSlot[] = []
  let currentTime = effective.firstTee
  let slotCount = 0
  const maxSlots = 200 // Safety limit

  const twilightMinutes = timeToMinutes(effective.twilightTime)

  while (currentTime <= effective.lastTee && slotCount < maxSlots) {
    const currentMinutes = timeToMinutes(currentTime)
    const isTwilight = currentMinutes >= twilightMinutes

    // Find the applicable period for this time
    let period: TimePeriod | undefined
    for (const p of effective.timePeriods.sort((a, b) => a.sortOrder - b.sortOrder)) {
      const startMins = timeToMinutes(p.startTime)
      const endTime = p.endTime || effective.lastTee
      const endMins = timeToMinutes(endTime)

      if (currentMinutes >= startMins && currentMinutes < endMins) {
        period = p
        break
      }
    }

    // Default to 10-minute interval if no period found
    const interval = period?.intervalMinutes || 10
    const isPrimeTime = period?.isPrimeTime || false
    const periodName = isTwilight ? 'Twilight' : (period?.name || 'Standard')

    slots.push({
      time: currentTime,
      periodName,
      interval,
      isPrimeTime: isPrimeTime && !isTwilight,
      isTwilight,
    })

    // Calculate next slot time
    const nextMinutes = currentMinutes + interval
    currentTime = minutesToTime(nextMinutes)
    slotCount++
  }

  // Calculate summary
  const primeTimeSlots = slots.filter((s) => s.isPrimeTime).length

  return {
    date: effective.date,
    dayType,
    bookingMode: effective.bookingMode,
    operatingHours: {
      firstTee: effective.firstTee,
      lastTee: effective.lastTee,
    },
    twilightTime: effective.twilightTime,
    teeTimeSlots: slots,
    activeSeason: effective.activeSeason,
    activeSpecialDay: effective.activeSpecialDay,
    isClosed: false,
    summary: {
      totalSlots: slots.length,
      maxPlayers: slots.length * 4,
      primeTimeSlots,
      primeTimePercentage: slots.length > 0 ? Math.round((primeTimeSlots / slots.length) * 100) : 0,
    },
  }
}

/**
 * Convert schedule slots to Flight objects for the tee sheet
 */
export function convertSlotsToFlights(
  slots: TeeTimeSlot[],
  date: Date,
  courseId: string,
  existingBookings?: Array<{
    teeTime: string
    id: string
    status: string
    players: Array<{
      id: string
      name: string
      type: string
      memberId?: string
      memberUuid?: string
      bookingId?: string
      handicap?: number
      checkedIn?: boolean
      hasCart?: boolean
      hasCaddy?: boolean
      cartSharedWith?: number
      cartStatus?: string
      caddyStatus?: string
      cartRequest?: string
      caddyRequest?: string
      rentalRequest?: string
    } | null>
    blockedReason?: string
    notes?: string
    holes?: 9 | 18
    bookingGroups?: Array<{
      id: string
      groupNumber: 1 | 2
      bookedBy: { id: string; name: string; memberId?: string }
      playerIds: string[]
    }>
  }>,
): Flight[] {
  const dateStr = date.toISOString().split('T')[0] ?? ''

  return slots.map((slot) => {
    // Find existing booking for this time
    const existingBooking = existingBookings?.find((b) => b.teeTime === slot.time)

    if (existingBooking) {
      // Return flight with booking data
      return {
        id: existingBooking.id,
        time: formatTime(slot.time),
        date: dateStr,
        status: existingBooking.status as FlightStatus,
        players: existingBooking.players.map((p) =>
          p ? {
            id: p.id,
            name: p.name,
            type: p.type as 'member' | 'guest' | 'dependent' | 'walkup',
            memberId: p.memberId,
            memberUuid: p.memberUuid, // Member.id (UUID) for API calls
            bookingId: p.bookingId,
            handicap: p.handicap,
            checkedIn: p.checkedIn,
            hasCart: p.hasCart,
            hasCaddy: p.hasCaddy,
            cartSharedWith: p.cartSharedWith,
            cartStatus: p.cartStatus,
            caddyStatus: p.caddyStatus,
            cartRequest: p.cartRequest,
            caddyRequest: p.caddyRequest,
            rentalRequest: p.rentalRequest,
          } : null
        ) as Flight['players'],
        courseId,
        blockedReason: existingBooking.blockedReason,
        notes: existingBooking.notes,
        holes: existingBooking.holes,
        isPrimeTime: slot.isPrimeTime,
        isTwilight: slot.isTwilight,
        periodName: slot.periodName,
        // Pass through booking groups for multiple bookings at same time
        bookingGroups: existingBooking.bookingGroups,
      }
    }

    // Return available slot
    return {
      id: `flight-${dateStr}-${slot.time.replace(':', '')}`,
      time: formatTime(slot.time),
      date: dateStr,
      status: 'available' as FlightStatus,
      players: [null, null, null, null],
      courseId,
      isPrimeTime: slot.isPrimeTime,
      isTwilight: slot.isTwilight,
      periodName: slot.periodName,
    }
  })
}

// Default time periods for new courses
export const DEFAULT_TIME_PERIODS: Omit<TimePeriod, 'id'>[] = [
  {
    name: 'Early Bird',
    startTime: '06:00',
    endTime: '07:00',
    intervalMinutes: 12,
    isPrimeTime: false,
    applicableDays: 'ALL',
    sortOrder: 0,
  },
  {
    name: 'Prime AM',
    startTime: '07:00',
    endTime: '11:00',
    intervalMinutes: 8,
    isPrimeTime: true,
    applicableDays: 'ALL',
    sortOrder: 1,
  },
  {
    name: 'Midday',
    startTime: '11:00',
    endTime: '14:00',
    intervalMinutes: 10,
    isPrimeTime: false,
    applicableDays: 'ALL',
    sortOrder: 2,
  },
  {
    name: 'Prime PM',
    startTime: '14:00',
    endTime: '16:00',
    intervalMinutes: 8,
    isPrimeTime: true,
    applicableDays: 'ALL',
    sortOrder: 3,
  },
  {
    name: 'Twilight',
    startTime: '16:00',
    endTime: null,
    intervalMinutes: 12,
    isPrimeTime: false,
    applicableDays: 'ALL',
    sortOrder: 4,
  },
]

// Default schedule config for when no config exists
export const DEFAULT_SCHEDULE_CONFIG: Omit<ScheduleConfig, 'id' | 'courseId'> = {
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
  timePeriods: DEFAULT_TIME_PERIODS.map((p, i) => ({ ...p, id: `default-${i}` })),
  seasons: [],
  specialDays: [],
}
