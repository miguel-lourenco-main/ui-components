export function parseJSON<T>(json: string, fallback?: T): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback ?? null;
  }
}

export function parseQueryString(queryString: string): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(queryString);
  
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

export function parseCookieString(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  cookieString.split(';').forEach(cookie => {
    const [name, ...valueParts] = cookie.trim().split('=');
    if (name) {
      cookies[name] = decodeURIComponent(valueParts.join('='));
    }
  });
  
  return cookies;
}

export function parseNumber(value: string | number, fallback: number = 0): number {
  if (typeof value === 'number') {
    return isNaN(value) ? fallback : value;
  }
  
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

export function parseInteger(value: string | number, fallback: number = 0): number {
  if (typeof value === 'number') {
    return isNaN(value) ? fallback : Math.floor(value);
  }
  
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

export function parseBoolean(value: string | boolean | number): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'number') {
    return value !== 0;
  }
  
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

