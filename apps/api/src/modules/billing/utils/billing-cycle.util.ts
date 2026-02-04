import {
  BillingFrequency,
  BillingTiming,
  CycleAlignment,
} from '../dto/club-billing-settings.dto';

/**
 * Configuration for billing cycle calculation
 */
export interface BillingCycleConfig {
  frequency: BillingFrequency;
  timing: BillingTiming;
  alignment: CycleAlignment;
  billingDay: number;
  joinDate?: Date;
}

/**
 * Represents a calculated billing period with all relevant dates
 */
export interface BillingPeriod {
  periodStart: Date;
  periodEnd: Date;
  billingDate: Date;
  dueDate: Date;
  description: string;
}

/**
 * Returns the number of billing cycles per year for a given frequency
 * @param frequency - The billing frequency
 * @returns Number of cycles per year (12, 4, 2, or 1)
 */
export function getFrequencyMultiplier(frequency: BillingFrequency): number {
  switch (frequency) {
    case BillingFrequency.MONTHLY:
      return 12;
    case BillingFrequency.QUARTERLY:
      return 4;
    case BillingFrequency.SEMI_ANNUAL:
      return 2;
    case BillingFrequency.ANNUAL:
      return 1;
    default:
      return 12;
  }
}

/**
 * Returns the number of months in each billing cycle for a given frequency
 * @param frequency - The billing frequency
 * @returns Number of months per cycle (1, 3, 6, or 12)
 */
export function getMonthsPerCycle(frequency: BillingFrequency): number {
  switch (frequency) {
    case BillingFrequency.MONTHLY:
      return 1;
    case BillingFrequency.QUARTERLY:
      return 3;
    case BillingFrequency.SEMI_ANNUAL:
      return 6;
    case BillingFrequency.ANNUAL:
      return 12;
    default:
      return 1;
  }
}

/**
 * Adds days to a date and returns a new Date object
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Sets a specific day on a date, handling month overflow (e.g., day 31 in February)
 */
function setDayOfMonth(date: Date, day: number): Date {
  const result = new Date(date);
  const maxDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate();
  result.setDate(Math.min(day, maxDay));
  return result;
}

/**
 * Adds months to a date and returns a new Date object
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getDate();
  result.setMonth(result.getMonth() + months);

  // Handle month overflow (e.g., Jan 31 + 1 month = Feb 28/29)
  if (result.getDate() !== day) {
    result.setDate(0); // Go to last day of previous month
  }
  return result;
}

/**
 * Subtracts one day from a date (for calculating period end as day before next period start)
 */
function subtractOneDay(date: Date): Date {
  return addDays(date, -1);
}

/**
 * Formats a date range into a human-readable description
 */
function formatPeriodDescription(
  periodStart: Date,
  periodEnd: Date,
  frequency: BillingFrequency,
): string {
  const startMonth = periodStart.toLocaleString('en-US', { month: 'short' });
  const endMonth = periodEnd.toLocaleString('en-US', { month: 'short' });
  const startYear = periodStart.getFullYear();
  const endYear = periodEnd.getFullYear();

  if (frequency === BillingFrequency.MONTHLY) {
    return `${startMonth} ${startYear}`;
  }

  if (startYear === endYear) {
    return `${startMonth} - ${endMonth} ${startYear}`;
  }

  return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
}

/**
 * Calculates the next billing period based on configuration
 *
 * @param config - Billing cycle configuration
 * @param referenceDate - Date to calculate the next period from (typically current date)
 * @param invoiceDueDays - Number of days after billing date when payment is due
 * @returns The calculated billing period with all relevant dates
 */
export function calculateNextBillingPeriod(
  config: BillingCycleConfig,
  referenceDate: Date = new Date(),
  invoiceDueDays: number = 30,
): BillingPeriod {
  const monthsPerCycle = getMonthsPerCycle(config.frequency);
  let periodStart: Date;

  if (config.alignment === CycleAlignment.CALENDAR) {
    // Calendar alignment: use billingDay and calendar months
    periodStart = calculateCalendarPeriodStart(
      referenceDate,
      config.billingDay,
      monthsPerCycle,
    );
  } else {
    // Anniversary alignment: use member's join date
    if (!config.joinDate) {
      throw new Error(
        'Join date is required for anniversary-based billing alignment',
      );
    }
    periodStart = calculateAnniversaryPeriodStart(
      referenceDate,
      config.joinDate,
      monthsPerCycle,
    );
  }

  // Calculate period end (day before next period start)
  const nextPeriodStart = addMonths(periodStart, monthsPerCycle);
  const periodEnd = subtractOneDay(nextPeriodStart);

  // Determine billing date based on timing
  const billingDate =
    config.timing === BillingTiming.ADVANCE
      ? new Date(periodStart)
      : new Date(periodEnd);

  // Calculate due date
  const dueDate = addDays(billingDate, invoiceDueDays);

  // Generate description
  const description = formatPeriodDescription(
    periodStart,
    periodEnd,
    config.frequency,
  );

  return {
    periodStart,
    periodEnd,
    billingDate,
    dueDate,
    description,
  };
}

/**
 * Calculates the period start date for calendar-based alignment
 */
function calculateCalendarPeriodStart(
  referenceDate: Date,
  billingDay: number,
  monthsPerCycle: number,
): Date {
  // Start with the billing day in the reference month
  let periodStart = setDayOfMonth(
    new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1),
    billingDay,
  );

  // If we're past the billing day this month, the period started this month
  // Otherwise, the period started in the previous cycle
  if (referenceDate.getDate() < billingDay) {
    // We haven't reached billing day yet, go back one cycle
    periodStart = addMonths(periodStart, -monthsPerCycle);
  }

  // For quarterly/semi-annual/annual, align to cycle boundaries
  if (monthsPerCycle > 1) {
    // Align to the start of the appropriate cycle
    const month = periodStart.getMonth();
    const cycleStartMonth = Math.floor(month / monthsPerCycle) * monthsPerCycle;
    periodStart = new Date(
      periodStart.getFullYear(),
      cycleStartMonth,
      billingDay,
    );

    // Handle day overflow for the target month
    periodStart = setDayOfMonth(periodStart, billingDay);

    // If the calculated period start is in the future, go back one cycle
    if (periodStart > referenceDate) {
      periodStart = addMonths(periodStart, -monthsPerCycle);
    }
  }

  return periodStart;
}

/**
 * Calculates the period start date for anniversary-based alignment
 */
function calculateAnniversaryPeriodStart(
  referenceDate: Date,
  joinDate: Date,
  monthsPerCycle: number,
): Date {
  const joinDay = joinDate.getDate();
  const joinMonth = joinDate.getMonth();
  const joinYear = joinDate.getFullYear();

  // Calculate how many complete cycles have passed since join date
  const referenceYear = referenceDate.getFullYear();
  const referenceMonth = referenceDate.getMonth();

  // Calculate total months since join
  const totalMonthsSinceJoin =
    (referenceYear - joinYear) * 12 + (referenceMonth - joinMonth);

  // Calculate how many complete cycles have passed
  let completedCycles = Math.floor(totalMonthsSinceJoin / monthsPerCycle);

  // Calculate the start of the current cycle
  let periodStart = addMonths(new Date(joinDate), completedCycles * monthsPerCycle);
  periodStart = setDayOfMonth(periodStart, joinDay);

  // If we're before the anniversary day in this cycle, we might need to go back one cycle
  if (referenceDate < periodStart) {
    completedCycles = Math.max(0, completedCycles - 1);
    periodStart = addMonths(new Date(joinDate), completedCycles * monthsPerCycle);
    periodStart = setDayOfMonth(periodStart, joinDay);
  }

  return periodStart;
}
