/**
 * Shared date-time utilities
 * Extracted from duplicate implementations across services
 */

/**
 * Normalize a date string to UTC midnight
 * Input can be "2026-01-27" or "2026-01-27T00:00:00.000Z"
 * Always returns a Date at UTC midnight
 */
export function normalizeUTCDate(dateInput: string): Date {
  const dateOnly = dateInput.split('T')[0];
  return new Date(`${dateOnly}T00:00:00.000Z`);
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Get milliseconds remaining until midnight (UTC)
 * Useful for cache expiration at end of day
 */
export function getMillisecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

/**
 * Get the start and end of a day in UTC
 */
export function getDayBounds(date: Date): { startOfDay: Date; endOfDay: Date } {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
}

/**
 * Check if a time string falls within a time range
 */
export function isTimeInRange(
  time: string,
  rangeStart: string,
  rangeEnd: string,
): boolean {
  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(rangeStart);
  const endMinutes = timeToMinutes(rangeEnd);

  return timeMinutes >= startMinutes && timeMinutes < endMinutes;
}

/**
 * Day names for recurring pattern matching
 */
export const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

/**
 * Check if a date matches a recurring pattern
 * Pattern format: "WEEKLY:MON,TUE,WED" or "DAILY" or "MONTHLY:1,15"
 */
export function matchesRecurringPattern(
  date: Date,
  pattern: string | null,
): boolean {
  if (!pattern) return false;

  const [type, values] = pattern.split(':');
  const dayOfWeek = date.getDay(); // 0 = Sunday
  const dayOfMonth = date.getDate();

  switch (type?.toUpperCase()) {
    case 'DAILY':
      return true;
    case 'WEEKLY':
      const days = values?.split(',').map((d) => d.trim().toUpperCase()) || [];
      return days.includes(DAY_NAMES[dayOfWeek]);
    case 'MONTHLY':
      const datesOfMonth =
        values?.split(',').map((d) => parseInt(d.trim(), 10)) || [];
      return datesOfMonth.includes(dayOfMonth);
    default:
      return false;
  }
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Get day type based on date (for schedule intervals)
 */
export function getDayType(date: Date): 'WEEKDAY' | 'WEEKEND' {
  return isWeekend(date) ? 'WEEKEND' : 'WEEKDAY';
}

/**
 * Format date as ISO date string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]!;
}
