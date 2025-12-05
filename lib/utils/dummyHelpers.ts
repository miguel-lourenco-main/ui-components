export function dummyString(length: number = 10): string {
  return 'x'.repeat(length);
}

export function dummyNumber(min: number = 0, max: number = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

export function dummyDate(daysOffset: number = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date;
}

export function dummyEmail(domain: string = 'test.com'): string {
  return `user_${Math.random().toString(36).substring(7)}@${domain}`;
}

export function dummyId(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 15)}`;
}

export function dummyBoolean(): boolean {
  return Math.random() >= 0.5;
}

export function dummyNull(): null {
  return null;
}

export function dummyUndefined(): undefined {
  return undefined;
}

export function dummyPromise<T>(value: T, delay: number = 0): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), delay);
  });
}

export function dummyFunction<T = any>(returnValue: T = undefined as T): (...args: any[]) => T {
  return () => returnValue;
}

export function dummyAsyncFunction<T = any>(returnValue: T = undefined as T, delay: number = 0): (...args: any[]) => Promise<T> {
  return async () => {
    await new Promise(resolve => setTimeout(resolve, delay));
    return returnValue;
  };
}

export function dummyError(message: string = 'Dummy error'): Error {
  return new Error(message);
}

export function dummyUser(id?: string): { id: string; name: string; email: string } {
  return {
    id: id || dummyId('user'),
    name: dummyString(8),
    email: dummyEmail(),
  };
}

export function dummyList<T>(count: number, generator: () => T): T[] {
  return Array.from({ length: count }, generator);
}

export function dummyNestedObject(depth: number = 2, width: number = 3): any {
  if (depth === 0) {
    return dummyString(5);
  }
  const obj: any = {};
  for (let i = 0; i < width; i++) {
    obj[`key_${i}`] = dummyNestedObject(depth - 1, width);
  }
  return obj;
}

export function dummyUrl(domain: string = 'example.com', path: string = ''): string {
  return `https://${domain}${path || '/' + dummyString(5)}`;
}

export function dummyPhoneNumber(): string {
  return `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
}

export function dummyUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function dummyColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

export function dummyImageUrl(width: number = 200, height: number = 200): string {
  return `https://via.placeholder.com/${width}x${height}`;
}

export function dummyJsonString(obj: any = { test: 'value' }): string {
  return JSON.stringify(obj);
}

export function dummyBase64(data: string = 'test'): string {
  return btoa(data);
}

export function dummyDelay(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function dummyRetry<T>(fn: () => T | Promise<T>, maxAttempts: number = 3): Promise<T> {
  return new Promise(async (resolve, reject) => {
    let lastError: any;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const result = await fn();
        return resolve(result);
      } catch (error) {
        lastError = error;
      }
    }
    reject(lastError);
  });
}

export function dummyTimeout<T>(fn: () => T | Promise<T>, ms: number = 1000): Promise<T> {
  return Promise.race([
    Promise.resolve(fn()),
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ]);
}

export function dummyDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function dummyThrottle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function dummyMemoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

export function dummyOnce<T extends (...args: any[]) => any>(fn: T): T {
  let called = false;
  let result: ReturnType<T>;
  return ((...args: Parameters<T>) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  }) as T;
}

export function dummyPipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
}

export function dummyCompose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
}

export function dummyTap<T>(fn: (arg: T) => void): (arg: T) => T {
  return (arg: T) => {
    fn(arg);
    return arg;
  };
}

export function dummyNoop(): void {
}

export function dummyIdentity<T>(value: T): T {
  return value;
}

export function dummyConstant<T>(value: T): () => T {
  return () => value;
}

export function dummyAlways<T>(value: T): (...args: any[]) => T {
  return () => value;
}

export function dummyNever(): (...args: any[]) => never {
  return () => {
    throw new Error('This function never returns');
  };
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
