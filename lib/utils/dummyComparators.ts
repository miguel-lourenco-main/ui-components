export function dummyEqual<T>(a: T, b: T): boolean {
  return a === b;
}

export function dummyNotEqual<T>(a: T, b: T): boolean {
  return a !== b;
}

export function dummyGreaterThan(a: number, b: number): boolean {
  return a > b;
}

export function dummyGreaterThanOrEqual(a: number, b: number): boolean {
  return a >= b;
}

export function dummyLessThan(a: number, b: number): boolean {
  return a < b;
}

export function dummyLessThanOrEqual(a: number, b: number): boolean {
  return a <= b;
}

export function dummyCompare<T>(a: T, b: T): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function dummyCompareBy<T>(a: T, b: T, keyFn: (item: T) => number | string): number {
  return dummyCompare(keyFn(a), keyFn(b));
}

export function dummyIsBetween(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function dummyIsInRange(value: number, min: number, max: number): boolean {
  return value > min && value < max;
}

export function dummyIsSameType(a: any, b: any): boolean {
  return typeof a === typeof b;
}

export function dummyIsSameLength(a: string | any[], b: string | any[]): boolean {
  return a.length === b.length;
}

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
