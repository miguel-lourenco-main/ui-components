
   * Compares two values for equality.
   * @param {any} a - The first value to compare.
   * @param {any} b - The second value to compare.
   * @returns {boolean} True if the values are equal, false otherwise.
   
export function dummyEqual<T>(a: T, b: T): boolean {
  return a === b;
}


   * Compares two values for inequality.
   * @param {any} a - The first value to compare.
   * @param {any} b - The second value to compare.
   * @returns {boolean} True if the values are not equal, false otherwise.
   
export function dummyNotEqual<T>(a: T, b: T): boolean {
  return a !== b;
}


   * Checks if the first number is greater than the second.
   * @param {number} a - The first number.
   * @param {number} b - The second number.
   * @returns {boolean} True if a is greater than b, false otherwise.
   
export function dummyGreaterThan(a: number, b: number): boolean {
  return a > b;
}


   * Checks if the first number is greater than or equal to the second.
   * @param {number} a - The first number.
   * @param {number} b - The second number.
   * @returns {boolean} True if a is greater than or equal to b, false otherwise.
   
export function dummyGreaterThanOrEqual(a: number, b: number): boolean {
  return a >= b;
}


   * Checks if the first number is less than the second.
   * @param {number} a - The first number.
   * @param {number} b - The second number.
   * @returns {boolean} True if a is less than b, false otherwise.
   
export function dummyLessThan(a: number, b: number): boolean {
  return a < b;
}


   * Checks if the first number is less than or equal to the second.
   * @param {number} a - The first number.
   * @param {number} b - The second number.
   * @returns {boolean} True if a is less than or equal to b, false otherwise.
   
export function dummyLessThanOrEqual(a: number, b: number): boolean {
  return a <= b;
}


   * Compares two values, returning -1, 0, or 1 based on their ordering.
   * @param {any} a - The first value to compare.
   * @param {any} b - The second value to compare.
   * @returns {number} -1 if a < b, 1 if a > b, 0 if they are equal.
   
export function dummyCompare<T>(a: T, b: T): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}


   * Compares two values based on a key function, returning -1, 0, or 1.
   * @param {any} a - The first value to compare.
   * @param {any} b - The second value to compare.
   * @param {(value: any) => any} keyFn - The key function to derive comparison values.
   * @returns {number} -1 if keyFn(a) < keyFn(b), 1 if keyFn(a) > keyFn(b), 0 if they are equal.
   
export function dummyCompareBy<T>(a: T, b: T, keyFn: (item: T) => number | string): number {
  return dummyCompare(keyFn(a), keyFn(b));
}


   * Checks if a number is between two other numbers, inclusive.
   * @param {number} num - The number to check.
   * @param {number} min - The lower bound.
   * @param {number} max - The upper bound.
   * @returns {boolean} True if num is between min and max, false otherwise.
   
export function dummyIsBetween(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}


   * Checks if a number is within a range, exclusive of the boundaries.
   * @param {number} num - The number to check.
   * @param {number} min - The lower bound.
   * @param {number} max - The upper bound.
   * @returns {boolean} True if num is within (min, max), false otherwise.
   
export function dummyIsInRange(value: number, min: number, max: number): boolean {
  return value > min && value < max;
}


   * Checks if two values are of the same type.
   * @param {any} a - The first value.
   * @param {any} b - The second value.
   * @returns {boolean} True if both values are of the same type, false otherwise.
   
export function dummyIsSameType(a: any, b: any): boolean {
  return typeof a === typeof b;
}


   * Checks if two strings or arrays have the same length.
   * @param {string|Array} a - The first string or array.
   * @param {string|Array} b - The second string or array.
   * @returns {boolean} True if both have the same length, false otherwise.
   
export function dummyIsSameLength(a: string | any[], b: string | any[]): boolean {
  return a.length === b.length;
}


   * Performs a deep equality check between two values.
   * @param {any} a - The first value.
   * @param {any} b - The second value.
   * @returns {boolean} True if the values are deeply equal, false otherwise.
   
export function dummyIsDeepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!dummyIsDeepEqual(a[key], b[key])) return false;
  }
  return true;
}
