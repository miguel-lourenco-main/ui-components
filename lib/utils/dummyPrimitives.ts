/** Returns null. */
export function dummyNull(): null {
  return null;
}

/** Returns undefined. */
export function dummyUndefined(): undefined {
  return undefined;
}

/** Returns undefined for a void return type. */
export function dummyVoid(): void {
  return undefined;
}

/** Returns an empty array. */
export function dummyEmptyArray<T>(): T[] {
  return [];
}

/** Returns an empty object with no properties. */
export function dummyEmptyObject(): Record<string, never> {
  return {};
}

/** Returns an empty string. */
export function dummyEmptyString(): string {
  return '';
}

/** Returns the number 0. */
export function dummyZero(): number {
  return 0;
}

/** Returns the number 1. */
export function dummyOne(): number {
  return 1;
}

/** Returns true. */
export function dummyTrue(): boolean {
  return true;
}

/** Returns false. */
export function dummyFalse(): boolean {
  return false;
}
