Compares two values for deep equality.
@param {any} a - The first value to compare.
@param {any} b - The second value to compare.
@returns {boolean} True if the values are deeply equal, false otherwise.
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
      Compares two values for shallow equality.
@param {any} a - The first value to compare.
@param {any} b - The second value to compare.
@returns {boolean} True if the values are shallowly equal, false otherwise.
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

  Compares two numbers.
@param {number} a - The first number to compare.
@param {number} b - The second number to compare.
@returns {number} A negative number if a is less than b, zero if they are equal, or a positive number if a is greater than b.
  if (typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }

  Compares two strings, optionally case-sensitive.
@param {string} a - The first string to compare.
@param {string} b - The second string to compare.
@param {boolean} [caseSensitive=false] - Indicates if the comparison should be case-sensitive.
@returns {number} A negative number if a is less than b, zero if equal, or a positive number if a is greater than b.
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }
Compares two dates.
@param {Date} a - The first date to compare.
@param {Date} b - The second date to compare.
@returns {number} A negative number if a is earlier than b, zero if they are equal, or a positive number if a is later than b.

  for (const key of keysA) {
    if (a[key] !== b[key]) {
      return false;
    Creates a comparator function for objects based on a specific key and order.
@param {string} key - The key to compare the objects by.
@param {'asc' | 'desc'} order - The sort order, either ascending or descending.
@returns {Function} A comparator function that takes two objects and returns a number.
    }
  }

  return true;
}

export function compareNumbers(a: number, b: number): number {
  return a - b;
}
Finds the minimum element in an array based on a specific key.
@param {Array<Object>} array - The array to search.
@param {string} key - The key to determine the minimum element.
@returns {Object} The minimum element in the array.

export function compareStrings(a: string, b: string, caseSensitive: boolean = true): number {
  const aVal = caseSensitive ? a : a.toLowerCase();
  const bVal = caseSensitive ? b : b.toLowerCase();
  return aVal.localeCompare(bVal);
}

export function compareDates(a: Date, b: Date): number {
  Finds the maximum element in an array based on a specific key.
@param {Array<Object>} array - The array to search.
@param {string} key - The key to determine the maximum element.
@returns {Object} The maximum element in the array.
  return a.getTime() - b.getTime();
}

export function compareBy<T>(key: keyof T, order: 'asc' | 'desc' = 'asc'): (a: T, b: T) => number {
  return (a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    Clamps a number between a minimum and maximum value.
@param {number} value - The number to clamp.
@param {number} min - The minimum value.
@param {number} max - The maximum value.
@returns {number} The clamped number.
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  };
Checks if a number is between two values, optionally inclusive.
@param {number} value - The number to check.
@param {number} start - The start of the range.
@param {number} end - The end of the range.
@param {boolean} [inclusive=false] - Indicates if the range should be inclusive.
@returns {boolean} True if the number is between the values, false otherwise.
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

