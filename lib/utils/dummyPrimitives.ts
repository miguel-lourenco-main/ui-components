export function dummyNull(): null {
  return null;
}

export function dummyUndefined(): undefined {
  return undefined;
}

export function dummyVoid(): void {
  return undefined;
}

export function dummyEmptyArray<T>(): T[] {
  return [];
}

export function dummyEmptyObject(): Record<string, never> {
  return {};
}

export function dummyEmptyString(): string {
  return '';
}

export function dummyZero(): number {
  return 0;
}

export function dummyOne(): number {
  return 1;
}

export function dummyTrue(): boolean {
  return true;
}

export function dummyFalse(): boolean {
  return false;
}
