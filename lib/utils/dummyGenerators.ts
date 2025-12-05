/** Generates a random integer between min and max (inclusive). */
export function dummyRandomInt(min: number = 0, max: number = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Generates a random float between min and max. */
export function dummyRandomFloat(min: number = 0, max: number = 1): number {
  return Math.random() * (max - min) + min;
}

/** Generates a random string of specified length with optional character set. */
export function dummyRandomString(length: number = 10, chars: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/** Generates a random element from an array. */
export function dummyRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/** Generates multiple random elements from an array (with optional count). */
export function dummyRandomElements<T>(array: T[], count: number = 1): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

/** Generates a random boolean value. */
export function dummyRandomBoolean(): boolean {
  return Math.random() >= 0.5;
}

/** Generates a random date between start and end dates. */
export function dummyRandomDate(start: Date = new Date(2000, 0, 1), end: Date = new Date()): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/** Generates a sequence of numbers from start to end. */
export function dummyRange(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

/** Generates an array of specified length using a generator function. */
export function dummyGenerate<T>(length: number, generator: (index: number) => T): T[] {
  return Array.from({ length }, (_, i) => generator(i));
}

/** Generates a random hex color code. */
export function dummyRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

/** Generates a random alphanumeric ID. */
export function dummyRandomId(length: number = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/** Generates a random UUID v4. */
export function dummyRandomUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
