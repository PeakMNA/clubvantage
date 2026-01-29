// Re-export all types from the shared utility
// This ensures type consistency across the app

export type {
  TwilightMode,
  ApplicableDays,
  SpecialDayType,
  BookingMode,
  TimePeriod,
  Season,
  SpecialDay,
  ScheduleConfig,
  EffectiveSchedule,
  TeeTimeSlot,
  SchedulePreviewData,
} from '@/lib/golf/schedule-utils'

export {
  DEFAULT_TIME_PERIODS,
  DEFAULT_SCHEDULE_CONFIG,
} from '@/lib/golf/schedule-utils'
