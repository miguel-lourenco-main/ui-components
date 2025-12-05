export function dummyPromise<T>(value: T, delay: number = 0): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), delay);
  });
}

export function dummyDelay(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function dummyAsyncFunction<T = any>(returnValue: T = undefined as T, delay: number = 0): (...args: any[]) => Promise<T> {
  return async () => {
    await new Promise(resolve => setTimeout(resolve, delay));
    return returnValue;
  };
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
