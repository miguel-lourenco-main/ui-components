/**
 * Formats a number with commas as thousand separators.
 *
 * @param {number} value - The number to format.
 * @returns {string} The formatted number as a string.
 */
export function formatNumberWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Formats a number as currency using a specified currency and locale.
 *
 * @param {number} amount - The amount to format.
 * @param {string} currency - The currency code (e.g., 'USD').
 * @param {string} locale - The locale to use for formatting.
 * @returns {string} The formatted currency string.
 */
export function formatCurrencyAmount(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
/**
 * Formats a number as a percentage with a specified number of decimals.
 *
 * @param {number} value - The value to format as a percentage.
 * @param {number} decimals - The number of decimal places to include.
 * @returns {string} The formatted percentage string.
 */
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
/**
 * Formats a file size in bytes into a human-readable string (e.g., KB, MB).
 *
 * @param {number} bytes - The size in bytes.
 * @returns {string} The human-readable file size string.
 */
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
/**
 * Formats a duration from seconds into a human-readable time string.
 *
 * @param {number} seconds - The duration in seconds.
 * @returns {string} The formatted duration string.
 */
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  /**
 * Formats a date into a relative time format (e.g., '2h ago').
 *
 * @param {Date} date - The date to format.
 * @returns {string} The formatted relative time string.
 */
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  /**
 * Formats a 10-digit US phone number into a standard format.
 *
 * @param {string} phoneNumber - The 10-digit phone number as a string.
 * @returns {string} The formatted phone number.
 */
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return then.toLocaleDateString();
}

export function formatPhoneNumber(phone: string): string {
  /**
 * Formats a credit card number by adding spaces to separate digits.
 *
 * @param {string} cardNumber - The credit card number as a string.
 * @returns {string} The formatted credit card number.
 */
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  /**
 * Formats a Social Security Number (SSN) into a standard format.
 *
 * @param {string} ssn - The SSN as a string.
 * @returns {string} The formatted SSN.
 */
  
  return phone;
}

export function formatCreditCard(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s+/g, '');
  return cleaned.match(/.{1,4}/g)?.join(' ') || cardNumber;
}

export function formatSSN(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  }
  return ssn;
}

