// Re-export query keys
export { queryKeys } from './query-keys';

/**
 * Format currency values from string decimal
 */
export function formatCurrency(value: string | number, currency = 'USD'): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(numValue);
}

/**
 * Format date string
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format datetime string
 */
export function formatDateTime(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', options);
}

/**
 * Parse cursor from connection edge
 */
export function parseCursor(cursor: string): string {
  try {
    return atob(cursor);
  } catch {
    return cursor;
  }
}

/**
 * Create cursor from ID
 */
export function createCursor(id: string): string {
  try {
    return btoa(id);
  } catch {
    return id;
  }
}
