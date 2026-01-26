export * from './currency';
export * from './date';

/**
 * Format member ID for display
 */
export function formatMemberId(id: string): string {
  // Ensure format like M-0001
  if (id.startsWith('M-')) return id;
  return `M-${id.padStart(4, '0')}`;
}

/**
 * Format invoice number for display
 */
export function formatInvoiceNumber(
  sequence: number,
  prefix: string = 'INV',
  year?: number,
  month?: number
): string {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;
  return `${prefix}-${y}${m.toString().padStart(2, '0')}-${sequence.toString().padStart(4, '0')}`;
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string, countryCode: string = 'TH'): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Format based on country
  switch (countryCode) {
    case 'TH':
      // Thai format: +66 81 234 5678
      if (digits.length === 10 && digits.startsWith('0')) {
        return `+66 ${digits.slice(1, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
      }
      break;
    case 'SG':
      // Singapore format: +65 8123 4567
      if (digits.length === 8) {
        return `+65 ${digits.slice(0, 4)} ${digits.slice(4)}`;
      }
      break;
    case 'MY':
      // Malaysia format: +60 12-345 6789
      if (digits.length === 10 && digits.startsWith('0')) {
        return `+60 ${digits.slice(1, 3)}-${digits.slice(3, 6)} ${digits.slice(6)}`;
      }
      break;
  }

  return phone; // Return original if can't format
}

/**
 * Format name (First Last)
 */
export function formatName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Get initials from name
 */
export function getInitials(firstName: string, lastName?: string): string {
  const first = firstName.charAt(0).toUpperCase();
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${first}${last}`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value);
}
