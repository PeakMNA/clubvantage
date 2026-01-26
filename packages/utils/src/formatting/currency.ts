/**
 * Currency formatting utilities for ClubVantage
 * Supports THB, SGD, MYR
 */

export type CurrencyCode = 'THB' | 'SGD' | 'MYR' | 'USD';

const CURRENCY_CONFIG: Record<CurrencyCode, {
  symbol: string;
  locale: string;
  decimals: number;
}> = {
  THB: { symbol: '฿', locale: 'th-TH', decimals: 2 },
  SGD: { symbol: 'S$', locale: 'en-SG', decimals: 2 },
  MYR: { symbol: 'RM', locale: 'en-MY', decimals: 2 },
  USD: { symbol: '$', locale: 'en-US', decimals: 2 },
};

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'THB',
  options?: {
    showSymbol?: boolean;
    showDecimals?: boolean;
    compact?: boolean;
  }
): string {
  const config = CURRENCY_CONFIG[currency];
  const { showSymbol = true, showDecimals = true, compact = false } = options || {};

  const formatter = new Intl.NumberFormat(config.locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: currency,
    minimumFractionDigits: showDecimals ? config.decimals : 0,
    maximumFractionDigits: showDecimals ? config.decimals : 0,
    notation: compact ? 'compact' : 'standard',
  });

  return formatter.format(amount);
}

/**
 * Parse a currency string to number
 */
export function parseCurrency(value: string, currency: CurrencyCode = 'THB'): number {
  const config = CURRENCY_CONFIG[currency];

  // Remove currency symbol and thousands separators
  const cleaned = value
    .replace(config.symbol, '')
    .replace(/[,\s]/g, '')
    .trim();

  return parseFloat(cleaned) || 0;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCY_CONFIG[currency].symbol;
}

/**
 * Format amount with color class for balance (red if positive/debt)
 */
export function formatBalance(
  amount: number,
  currency: CurrencyCode = 'THB'
): { formatted: string; isDebt: boolean } {
  return {
    formatted: formatCurrency(Math.abs(amount), currency),
    isDebt: amount > 0,
  };
}
