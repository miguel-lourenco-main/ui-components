/**
 * Parses a JSON string and returns the result or a fallback value.
 * @param {string} jsonString - The JSON string to parse.
 * @param {any} fallback - The fallback value to return in case of an error.
 * @returns {any} The parsed object or the fallback value.
 */
export function parseJSON<T>(json: string, fallback?: T): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback ?? null;
  }
}
/**
 * Parses a query string into a record of key/value pairs.
 * @param {string} queryString - The query string to parse.
 * @returns {Record<string, string>} An object containing the key/value pairs from the query string.
 */

export function parseQueryString(queryString: string): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(queryString);
  
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  /**
 * Parses a cookie string into a record of key/value pairs.
 * @param {string} cookieString - The cookie string to parse.
 * @returns {Record<string, string>} An object containing the key/value pairs from the cookie string.
 */
  
  return params;
}

export function parseCookieString(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  cookieString.split(';').forEach(cookie => {
    const [name, ...valueParts] = cookie.trim().split('=');
    if (name) {
      /**
 * Attempts to parse a number from a string or returns a fallback value.
 * @param {string} value - The string to parse.
 * @param {number} fallback - The fallback value to return if parsing fails.
 * @returns {number} The parsed number or the fallback value.
 */
      cookies[name] = decodeURIComponent(valueParts.join('='));
    }
  });
  
  return cookies;
}

export function parseNumber(value: string | number, fallback: number = 0): number {
  /**
 * Attempts to parse an integer from a string or returns a fallback value.
 * @param {string} value - The string to parse.
 * @param {number} fallback - The fallback value to return if parsing fails.
 * @returns {number} The parsed integer or the fallback value.
 */
  if (typeof value === 'number') {
    return isNaN(value) ? fallback : value;
  }
  
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Converts a string, boolean, or number to a boolean value.
 * @param {string | boolean | number} value - The value to convert.
 * @returns {boolean} The converted boolean value.
 */
export function parseInteger(value: string | number, fallback: number = 0): number {
  if (typeof value === 'number') {
    return isNaN(value) ? fallback : Math.floor(value);
  }
  
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Parses a string into a Date object or returns a fallback value.
 * @param {string} dateString - The string to parse.
 * @param {Date} fallback - The fallback Date to return if parsing fails.
 * @returns {Date} The parsed Date object or the fallback value.
 */
export function parseBoolean(value: string | boolean | number): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'number') {
    return value !== 0;
  }
  /**
 * Converts a CSV string into a 2D array, handling nested quotes.
 * @param {string} csvString - The CSV string to parse.
 * @returns {string[][]} A 2D array representing the parsed CSV data.
 */
  
  const lowercased = value.toLowerCase().trim();
  return lowercased === 'true' || lowercased === '1' || lowercased === 'yes';
}

export function parseDate(value: string | Date, fallback?: Date): Date | null {
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? (fallback ?? null) : value;
  }
  
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? (fallback ?? null) : parsed;
}

export function parseCSV(csv: string, delimiter: string = ','): string[][] {
  const lines = csv.split('\n');
  return lines
    .filter(line => line.trim().length > 0)
    .map(line => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      values.push(current.trim());
      return values;
    });
}

