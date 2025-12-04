export function isEqual(a: any, b: any): boolean {
  if (a === b) {
    return true;
  }

  if (a == null || b == null) {
    return false;
  }

  if (typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!keysB.includes(key)) {
      return false;
    }

    if (!isEqual(a[key], b[key])) {
      return false;
    }
  }

  return true;
}

export function isShallowEqual(a: any, b: any): boolean {
  if (a === b) {
    return true;
  }

  if (a == null || b == null) {
    return false;
  }

  if (typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}

export function compareNumbers(a: number, b: number): number {
  return a - b;
}

export function compareStrings(a: string, b: string, caseSensitive: boolean = true): number {
  const aVal = caseSensitive ? a : a.toLowerCase();
  const bVal = caseSensitive ? b : b.toLowerCase();
  return aVal.localeCompare(bVal);
}

export function compareDates(a: Date, b: Date): number {
  return a.getTime() - b.getTime();
}

export function compareBy<T>(key: keyof T, order: 'asc' | 'desc' = 'asc'): (a: T, b: T) => number {
  return (a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  };
}

export function minBy<T>(array: T[], key: keyof T): T | undefined {
  if (array.length === 0) return undefined;
  
  return array.reduce((min, current) => {
    return current[key] < min[key] ? current : min;
  });
}

export function maxBy<T>(array: T[], key: keyof T): T | undefined {
  if (array.length === 0) return undefined;
  
  return array.reduce((max, current) => {
    return current[key] > max[key] ? current : max;
  });
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function isBetween(value: number, min: number, max: number, inclusive: boolean = true): boolean {
  if (inclusive) {
    return value >= min && value <= max;
  }
  return value > min && value < max;
}

