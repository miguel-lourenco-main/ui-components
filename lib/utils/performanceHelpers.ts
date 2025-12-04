export function measurePerformance<T>(
  fn: () => T,
  label?: string
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;

  if (label) {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

export async function measureAsyncPerformance<T>(
  fn: () => Promise<T>,
  label?: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const duration = end - start;

  if (label) {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

export function createPerformanceMarker(name: string): () => void {
  const start = performance.now();
  
  return () => {
    const end = performance.now();
    const duration = end - start;
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  };
}

export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} {
  if (typeof performance === 'undefined' || !(performance as any).memory) {
    return { used: 0, total: 0, percentage: 0 };
  }

  const memory = (performance as any).memory;
  const used = memory.usedJSHeapSize;
  const total = memory.totalJSHeapSize;
  const percentage = (used / total) * 100;

  return { used, total, percentage };
}
