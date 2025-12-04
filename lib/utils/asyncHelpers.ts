export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await sleep(delay * attempt);
      }
    }
  }

  throw lastError!;
}

export async function timeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), ms);
  });

  return Promise.race([promise, timeoutPromise]);
}

export async function parallel<T>(
  tasks: (() => Promise<T>)[]
): Promise<T[]> {
  return Promise.all(tasks.map(task => task()));
}

export async function sequential<T>(
  tasks: (() => Promise<T>)[]
): Promise<T[]> {
  const results: T[] = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}

export async function race<T>(
  promises: Promise<T>[]
): Promise<T> {
  return Promise.race(promises);
}

export function createAsyncQueue<T>() {
  const queue: Array<() => Promise<T>> = [];
  let processing = false;

  const process = async () => {
    if (processing || queue.length === 0) return;

    processing = true;
    while (queue.length > 0) {
      const task = queue.shift()!;
      try {
        await task();
      } catch (error) {
        console.error('Queue task error:', error);
      }
    }
    processing = false;
  };

  return {
    add: (task: () => Promise<T>) => {
      queue.push(task);
      process();
    },
    clear: () => {
      queue.length = 0;
    },
    size: () => queue.length,
  };
}

export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 5
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }

  return results;
}

