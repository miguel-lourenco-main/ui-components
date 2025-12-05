/**
 * Creates a debounced function that delays invoking the provided function until after a specified delay has passed.
 *
 * @param fn - The function to debounce.
 * @param delay - The number of milliseconds to delay.
 * @returns A new debounced function.
 */
export function dummyDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
/**
 /**
 * Creates a throttled function that only invokes the provided function at most once per every specified limit.
 * @param {Function} func - The function to be throttled.
 * @param {number} limit - The time limit in milliseconds.
 * @returns {Function} A new throttled function.
 */
 * Creates a throttled function that only invokes the provided function at most once per every specified limit.
 *
 * @param fn - The function to throttle.
 * @param limit - The number of milliseconds to wait before calling the function again.
 * @returns A new throttled function.
 */
}

export function dummyThrottle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      /**
 * Creates a memoized version of the provided function, caching the results based on arguments.
 *
 * @param fn - The function to memoize.
 * @returns A new memoized function.
 */
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
    /**
 * Creates a function that invokes the provided function only once, caching the result for future calls.
 *
 * @param fn - The function to invoke once.
 * @returns A new function that can be called only once.
 */
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
