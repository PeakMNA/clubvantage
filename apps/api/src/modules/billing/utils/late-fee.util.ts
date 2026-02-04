import { LateFeeType } from '../dto/club-billing-settings.dto';

/**
 * Configuration for late fee calculation
 */
export interface LateFeeConfig {
  /** Type of late fee to apply */
  type: LateFeeType;
  /** Fixed amount for FIXED type (in cents) */
  amount: number;
  /** Percentage for PERCENTAGE type (0-100) */
  percentage: number;
  /** Maximum fee cap (in cents) */
  maxFee?: number;
  /** Grace period in days after due date before fees apply */
  gracePeriodDays: number;
}

/**
 * Result of late fee calculation
 */
export interface LateFeeResult {
  /** Calculated fee amount (in cents) */
  feeAmount: number;
  /** Number of days past due date */
  daysOverdue: number;
  /** Date when fee was calculated/applied */
  appliedDate: Date;
  /** Human-readable description of the fee */
  description: string;
  /** Whether the invoice is still within grace period */
  isWithinGracePeriod: boolean;
}

/**
 * Tiered multipliers based on days overdue
 * 1-30 days: 1x base fee
 * 31-60 days: 1.5x base fee
 * 61-90 days: 2x base fee
 * 90+ days: 2.5x base fee
 */
const TIERED_MULTIPLIERS = [
  { minDays: 1, maxDays: 30, multiplier: 1 },
  { minDays: 31, maxDays: 60, multiplier: 1.5 },
  { minDays: 61, maxDays: 90, multiplier: 2 },
  { minDays: 91, maxDays: Infinity, multiplier: 2.5 },
];

/**
 * Get the tiered multiplier based on days overdue
 * @param daysOverdue - Number of days past due date (after grace period)
 * @returns The multiplier to apply to base fee
 */
function getTieredMultiplier(daysOverdue: number): number {
  for (const tier of TIERED_MULTIPLIERS) {
    if (daysOverdue >= tier.minDays && daysOverdue <= tier.maxDays) {
      return tier.multiplier;
    }
  }
  return TIERED_MULTIPLIERS[TIERED_MULTIPLIERS.length - 1].multiplier;
}

/**
 * Round a number to 2 decimal places (for cents, this ensures whole numbers)
 * @param value - The value to round
 * @returns Rounded value
 */
function roundTo2Decimals(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculate the number of days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of full days between dates
 */
function calculateDaysBetween(startDate: Date, endDate: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Reset time components to compare dates only
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return Math.floor((end.getTime() - start.getTime()) / msPerDay);
}

/**
 * Calculate late fee for an overdue invoice
 *
 * @param invoiceBalance - Outstanding balance on the invoice (in cents)
 * @param dueDate - Original due date of the invoice
 * @param config - Late fee configuration
 * @param calculationDate - Date to calculate fee from (defaults to now)
 * @returns Late fee calculation result
 *
 * @example
 * ```typescript
 * const result = calculateLateFee(
 *   10000, // $100.00 in cents
 *   new Date('2024-01-01'),
 *   {
 *     type: LateFeeType.PERCENTAGE,
 *     amount: 0,
 *     percentage: 5,
 *     gracePeriodDays: 15,
 *     maxFee: 5000, // $50.00 max
 *   },
 *   new Date('2024-01-20') // 19 days after due, 4 days after grace
 * );
 * // result.feeAmount = 500 (5% of $100 = $5.00)
 * ```
 */
export function calculateLateFee(
  invoiceBalance: number,
  dueDate: Date,
  config: LateFeeConfig,
  calculationDate?: Date,
): LateFeeResult {
  const calcDate = calculationDate || new Date();
  const daysOverdue = calculateDaysBetween(dueDate, calcDate);

  // Check if within grace period
  if (daysOverdue <= config.gracePeriodDays) {
    return {
      feeAmount: 0,
      daysOverdue: Math.max(0, daysOverdue),
      appliedDate: calcDate,
      description: daysOverdue <= 0
        ? 'Invoice not yet due'
        : `Within grace period (${config.gracePeriodDays - daysOverdue} days remaining)`,
      isWithinGracePeriod: true,
    };
  }

  // Calculate effective days overdue (after grace period)
  const effectiveDaysOverdue = daysOverdue - config.gracePeriodDays;

  let feeAmount: number;
  let description: string;

  switch (config.type) {
    case LateFeeType.PERCENTAGE:
      feeAmount = invoiceBalance * (config.percentage / 100);
      description = `${config.percentage}% late fee on balance of ${(invoiceBalance / 100).toFixed(2)}`;
      break;

    case LateFeeType.FIXED:
      feeAmount = config.amount;
      description = `Fixed late fee of ${(config.amount / 100).toFixed(2)}`;
      break;

    case LateFeeType.TIERED: {
      const multiplier = getTieredMultiplier(effectiveDaysOverdue);
      // For tiered, use percentage as base and apply multiplier
      const baseFee = invoiceBalance * (config.percentage / 100);
      feeAmount = baseFee * multiplier;
      description = `Tiered late fee: ${config.percentage}% x ${multiplier}x (${effectiveDaysOverdue} days overdue)`;
      break;
    }

    default:
      feeAmount = 0;
      description = 'Unknown late fee type';
  }

  // Apply max fee cap if configured
  if (config.maxFee !== undefined && config.maxFee > 0 && feeAmount > config.maxFee) {
    feeAmount = config.maxFee;
    description += ` (capped at ${(config.maxFee / 100).toFixed(2)})`;
  }

  // Round to 2 decimal places
  feeAmount = roundTo2Decimals(feeAmount);

  return {
    feeAmount,
    daysOverdue,
    appliedDate: calcDate,
    description,
    isWithinGracePeriod: false,
  };
}

/**
 * Determine if a late fee should be applied to an invoice
 *
 * @param dueDate - Original due date of the invoice
 * @param gracePeriodDays - Number of grace period days
 * @param calculationDate - Date to check against (defaults to now)
 * @returns True if the invoice is past grace period and fee should apply
 *
 * @example
 * ```typescript
 * const shouldApply = shouldApplyLateFee(
 *   new Date('2024-01-01'),
 *   15,
 *   new Date('2024-01-20') // 19 days after due
 * );
 * // shouldApply = true (past 15-day grace period)
 * ```
 */
export function shouldApplyLateFee(
  dueDate: Date,
  gracePeriodDays: number,
  calculationDate?: Date,
): boolean {
  const calcDate = calculationDate || new Date();
  const daysOverdue = calculateDaysBetween(dueDate, calcDate);

  return daysOverdue > gracePeriodDays;
}
