import { ProrationMethod } from '../dto/club-billing-settings.dto';

/**
 * Configuration for calculating prorated amounts
 */
export interface ProrationConfig {
  /** The proration method to use */
  method: ProrationMethod;
  /** Start date of the billing period */
  periodStart: Date;
  /** End date of the billing period */
  periodEnd: Date;
  /** Date when the charge becomes effective (e.g., member join date) */
  effectiveDate: Date;
  /** Full amount for the complete billing period (in cents) */
  fullPeriodAmount: number;
}

/**
 * Result of a proration calculation
 */
export interface ProrationResult {
  /** The calculated prorated amount (in cents) */
  proratedAmount: number;
  /** Total days in the billing period */
  daysInPeriod: number;
  /** Number of days being prorated (charged) */
  daysProrated: number;
  /** The proration factor applied (0-1) */
  prorationFactor: number;
  /** Human-readable description of the proration calculation */
  description: string;
}

/**
 * Calculate the number of days between two dates (inclusive of start, exclusive of end)
 * @param start - Start date
 * @param end - End date
 * @returns Number of days between the dates
 */
export function getDaysBetween(start: Date, end: Date): number {
  const startTime = new Date(start).setHours(0, 0, 0, 0);
  const endTime = new Date(end).setHours(0, 0, 0, 0);
  const diffTime = endTime - startTime;
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

/**
 * Calculate the approximate number of months between two dates
 * @param start - Start date
 * @param end - End date
 * @returns Number of months between the dates (rounded up for partial months)
 */
export function getMonthsBetween(start: Date, end: Date): number {
  const startDate = new Date(start);
  const endDate = new Date(end);

  // Calculate year and month difference
  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();
  const dayDiff = endDate.getDate() - startDate.getDate();

  let months = yearDiff * 12 + monthDiff;

  // If there's a partial month (days remaining), round up
  if (dayDiff > 0) {
    months += 1;
  }

  return Math.max(0, months);
}

/**
 * Calculate the total months in a billing period
 * @param periodStart - Start of the billing period
 * @param periodEnd - End of the billing period
 * @returns Total months in the period
 */
function getTotalMonthsInPeriod(periodStart: Date, periodEnd: Date): number {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);

  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();

  return Math.max(1, yearDiff * 12 + monthDiff);
}

/**
 * Calculate prorated amount based on the configuration
 * @param config - Proration configuration
 * @returns Proration result with calculated amounts and description
 */
export function calculateProration(config: ProrationConfig): ProrationResult {
  const { method, periodStart, periodEnd, effectiveDate, fullPeriodAmount } =
    config;

  // Normalize dates to start of day for consistent comparison
  const normalizedPeriodStart = new Date(periodStart);
  normalizedPeriodStart.setHours(0, 0, 0, 0);

  const normalizedPeriodEnd = new Date(periodEnd);
  normalizedPeriodEnd.setHours(0, 0, 0, 0);

  const normalizedEffectiveDate = new Date(effectiveDate);
  normalizedEffectiveDate.setHours(0, 0, 0, 0);

  // Handle case where effective date is before or at period start
  if (normalizedEffectiveDate <= normalizedPeriodStart) {
    return {
      proratedAmount: fullPeriodAmount,
      daysInPeriod: getDaysBetween(normalizedPeriodStart, normalizedPeriodEnd),
      daysProrated: getDaysBetween(normalizedPeriodStart, normalizedPeriodEnd),
      prorationFactor: 1,
      description: 'Full period charge - effective date is at or before period start',
    };
  }

  // Handle case where effective date is after period end
  if (normalizedEffectiveDate >= normalizedPeriodEnd) {
    return {
      proratedAmount: 0,
      daysInPeriod: getDaysBetween(normalizedPeriodStart, normalizedPeriodEnd),
      daysProrated: 0,
      prorationFactor: 0,
      description: 'No charge - effective date is after period end',
    };
  }

  const totalDays = getDaysBetween(normalizedPeriodStart, normalizedPeriodEnd);
  const remainingDays = getDaysBetween(normalizedEffectiveDate, normalizedPeriodEnd);

  switch (method) {
    case ProrationMethod.NONE: {
      // No proration - charge full amount regardless of effective date
      return {
        proratedAmount: fullPeriodAmount,
        daysInPeriod: totalDays,
        daysProrated: totalDays,
        prorationFactor: 1,
        description: 'Full period charge - proration disabled',
      };
    }

    case ProrationMethod.MONTHLY: {
      // Prorate by whole months (round up partial months)
      const totalMonths = getTotalMonthsInPeriod(
        normalizedPeriodStart,
        normalizedPeriodEnd,
      );
      const remainingMonths = getMonthsBetween(
        normalizedEffectiveDate,
        normalizedPeriodEnd,
      );

      // Ensure we don't exceed total months
      const monthsToCharge = Math.min(remainingMonths, totalMonths);
      const prorationFactor =
        totalMonths > 0 ? monthsToCharge / totalMonths : 1;
      const proratedAmount = Math.round(fullPeriodAmount * prorationFactor);

      return {
        proratedAmount,
        daysInPeriod: totalDays,
        daysProrated: remainingDays,
        prorationFactor,
        description: `Monthly proration: ${monthsToCharge} of ${totalMonths} months charged`,
      };
    }

    case ProrationMethod.DAILY: {
      // Prorate by exact days remaining
      const prorationFactor = totalDays > 0 ? remainingDays / totalDays : 1;
      const proratedAmount = Math.round(fullPeriodAmount * prorationFactor);

      return {
        proratedAmount,
        daysInPeriod: totalDays,
        daysProrated: remainingDays,
        prorationFactor,
        description: `Daily proration: ${remainingDays} of ${totalDays} days charged`,
      };
    }

    default: {
      // Fallback to full amount for unknown methods
      return {
        proratedAmount: fullPeriodAmount,
        daysInPeriod: totalDays,
        daysProrated: totalDays,
        prorationFactor: 1,
        description: 'Full period charge - unknown proration method',
      };
    }
  }
}
