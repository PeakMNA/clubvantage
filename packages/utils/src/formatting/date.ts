/**
 * Date formatting utilities for ClubVantage
 */

import {
  format,
  formatDistanceToNow,
  parseISO,
  isValid,
  isBefore,
  isAfter,
  addDays,
  addMonths,
  startOfMonth,
  endOfMonth,
  differenceInDays,
} from 'date-fns';
import { th, enGB } from 'date-fns/locale';
import type { Locale } from 'date-fns';

export type LocaleCode = 'th' | 'en-SG' | 'en-MY';

const LOCALE_MAP: Record<LocaleCode, Locale> = {
  th: th,
  'en-SG': enGB,
  'en-MY': enGB, // Use GB locale for SEA English
};

/**
 * Format date for display
 */
export function formatDate(
  date: Date | string,
  formatStr: string = 'dd MMM yyyy',
  locale: LocaleCode = 'en-SG'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';

  return format(dateObj, formatStr, { locale: LOCALE_MAP[locale] });
}

/**
 * Format date with time
 */
export function formatDateTime(
  date: Date | string,
  locale: LocaleCode = 'en-SG'
): string {
  return formatDate(date, 'dd MMM yyyy HH:mm', locale);
}

/**
 * Format time only (HH:mm)
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return format(dateObj, 'HH:mm');
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | string,
  locale: LocaleCode = 'en-SG'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';

  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: LOCALE_MAP[locale]
  });
}

/**
 * Check if date is overdue
 */
export function isOverdue(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) && isBefore(dateObj, new Date());
}

/**
 * Get days until date (negative if past)
 */
export function getDaysUntil(date: Date | string): number {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 0;
  return differenceInDays(dateObj, new Date());
}

/**
 * Format date range
 */
export function formatDateRange(
  start: Date | string,
  end: Date | string,
  locale: LocaleCode = 'en-SG'
): string {
  const startStr = formatDate(start, 'dd MMM', locale);
  const endStr = formatDate(end, 'dd MMM yyyy', locale);
  return `${startStr} - ${endStr}`;
}

/**
 * Get billing month string (e.g., "2026-01")
 */
export function getBillingMonth(date: Date = new Date()): string {
  return format(date, 'yyyy-MM');
}

/**
 * Parse billing month string to date range
 */
export function parseBillingMonth(billingMonth: string): {
  start: Date;
  end: Date;
} {
  const date = parseISO(`${billingMonth}-01`);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

// Re-export commonly used date-fns functions
export {
  parseISO,
  isValid,
  isBefore,
  isAfter,
  addDays,
  addMonths,
  startOfMonth,
  endOfMonth,
  differenceInDays,
};
