import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format currency with proper locale and symbol
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date to readable string
 */
export function formatDate(
  date: string | Date,
  formatStr: string = 'MMM dd, yyyy'
): string {
  return format(new Date(date), formatStr);
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number with commas
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Calculate days remaining until a date
 */
export function getDaysRemaining(targetDate: string | Date): number {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const now = new Date();
  const diffInMs = target.getTime() - now.getTime();
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
}

/**
 * Format large numbers with K/M/B/T suffixes
 * e.g., 1500 -> "1.5K", 1500000 -> "1.5M"
 */
export function formatCompactNumber(value: number, currency: string = 'USD'): string {
  if (value === 0) return '$0';

  const currencySymbol = currency === 'IDR' ? 'Rp' :
    currency === 'EUR' ? '€' :
      currency === 'GBP' ? '£' : '$';

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1e12) {
    return `${sign}${currencySymbol}${(absValue / 1e12).toFixed(2)}T`;
  } else if (absValue >= 1e9) {
    return `${sign}${currencySymbol}${(absValue / 1e9).toFixed(2)}B`;
  } else if (absValue >= 1e6) {
    return `${sign}${currencySymbol}${(absValue / 1e6).toFixed(2)}M`;
  } else if (absValue >= 1e3) {
    return `${sign}${currencySymbol}${(absValue / 1e3).toFixed(2)}K`;
  } else {
    return `${sign}${currencySymbol}${absValue.toFixed(2)}`;
  }
}

/**
 * Safely parse a value to number (handles Prisma Decimal, strings, etc.)
 */
export function toNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  if (typeof value === 'object' && value.toString) {
    return parseFloat(value.toString()) || 0;
  }
  return 0;
}
