/** Checks if a value is defined (not null or undefined). */
export function dummyIsDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/** Checks if a value is null. */
export function dummyIsNull(value: any): value is null {
  return value === null;
}

/** Checks if a value is undefined. */
export function dummyIsUndefined(value: any): value is undefined {
  return value === undefined;
}

/** Checks if a value is a string. */
export function dummyIsString(value: any): value is string {
  return typeof value === 'string';
}

/** Checks if a value is a number. */
export function dummyIsNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/** Checks if a value is a boolean. */
export function dummyIsBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

/** Checks if a value is an object. */
export function dummyIsObject(value: any): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Checks if a value is an array. */
export function dummyIsArray(value: any): value is any[] {
  return Array.isArray(value);
}

/** Checks if a value is a function. */
export function dummyIsFunction(value: any): value is Function {
  return typeof value === 'function';
}

/** Checks if a value is empty (null, undefined, empty string, empty array, or empty object). */
export function dummyIsEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/** Checks if a string is a valid email format. */
export function dummyIsEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Checks if a string is a valid URL format. */
export function dummyIsUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/** Checks if a number is positive. */
export function dummyIsPositive(value: number): boolean {
  return value > 0;
}

/** Checks if a number is negative. */
export function dummyIsNegative(value: number): boolean {
  return value < 0;
}

/** Checks if a number is even. */
export function dummyIsEven(value: number): boolean {
  return value % 2 === 0;
}

/** Checks if a number is odd. */
export function dummyIsOdd(value: number): boolean {
  return value % 2 !== 0;
}
