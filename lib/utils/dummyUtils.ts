export function dummyString(length: number = 10): string {
  return 'x'.repeat(length);
}

export function dummyNumber(min: number = 0, max: number = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function dummyBoolean(): boolean {
  return Math.random() >= 0.5;
}

export function dummyArray<T>(length: number, generator: (index: number) => T): T[] {
  return Array.from({ length }, (_, i) => generator(i));
}

export function dummyObject(keys: string[]): Record<string, any> {
  const obj: Record<string, any> = {};
  keys.forEach(key => {
    obj[key] = `value_${key}`;
  });
  return obj;
}

export function dummyId(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 15)}`;
}

export function dummyEmail(domain: string = 'test.com'): string {
  return `user_${Math.random().toString(36).substring(7)}@${domain}`;
}

export function dummyDate(daysOffset: number = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date;
}

export function dummyPromise<T>(value: T, delay: number = 0): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), delay);
  });
}

export function dummyFunction<T = any>(returnValue: T = undefined as T): (...args: any[]) => T {
  return () => returnValue;
}

export function dummyError(message: string = 'Dummy error'): Error {
  return new Error(message);
}

export function dummyNoop(): void {
}

export function dummyIdentity<T>(value: T): T {
  return value;
}
