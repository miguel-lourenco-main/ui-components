/**
 * Performance monitoring utilities for the UI Components Playground
 * Helps track loading times and identify bottlenecks
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled: boolean = true;

  constructor() {
    // Enable only in development or when explicitly enabled
    this.enabled = process.env.NODE_ENV === 'development' || 
                   typeof window !== 'undefined' && window.location.search.includes('perf=true');
  }

  /**
   * Start tracking a performance metric
   */
  start(name: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    const startTime = performance.now();
    this.metrics.set(name, {
      name,
      startTime,
      metadata,
    });

    console.log(`🚀 [Performance] ${name} started`, metadata);
  }

  /**
   * End tracking a performance metric
   */
  end(name: string, metadata?: Record<string, any>): number | null {
    if (!this.enabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`⚠️ [Performance] Metric ${name} not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;
    metric.metadata = { ...metric.metadata, ...metadata };

    console.log(`✅ [Performance] ${name} completed in ${duration.toFixed(2)}ms`, metric.metadata);

    return duration;
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(m => m.duration !== undefined);
  }

  /**
   * Get a specific metric
   */
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Log performance summary
   */
  summary(): void {
    if (!this.enabled) return;

    const completedMetrics = this.getMetrics();
    if (completedMetrics.length === 0) {
      console.log('📊 [Performance] No metrics recorded');
      return;
    }

    console.group('📊 [Performance Summary]');
    
    completedMetrics
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .forEach(metric => {
        console.log(`${metric.name}: ${metric.duration?.toFixed(2)}ms`);
      });

    const totalTime = completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    console.log(`Total tracked time: ${totalTime.toFixed(2)}ms`);
    
    console.groupEnd();
  }

  /**
   * Monitor a promise and track its execution time
   */
  async track<T>(name: string, promise: Promise<T>, metadata?: Record<string, any>): Promise<T> {
    if (!this.enabled) return promise;

    this.start(name, metadata);
    try {
      const result = await promise;
      this.end(name, { success: true });
      return result;
    } catch (error) {
      this.end(name, { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  /**
   * Monitor a function and track its execution time
   */
  trackSync<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    if (!this.enabled) return fn();

    this.start(name, metadata);
    try {
      const result = fn();
      this.end(name, { success: true });
      return result;
    } catch (error) {
      this.end(name, { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }
}

// Global performance monitor instance
export const perf = new PerformanceMonitor();

/**
 * Hook to monitor component mount/unmount times
 */
export function usePerformanceMonitor(componentName: string, metadata?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  const mountTime = performance.now();
  perf.start(`${componentName}-mount`, metadata);

  return () => {
    perf.end(`${componentName}-mount`);
    const unmountTime = performance.now();
    const lifeTime = unmountTime - mountTime;
    console.log(`🔄 [Performance] ${componentName} lifetime: ${lifeTime.toFixed(2)}ms`);
  };
}

/**
 * Web Vitals tracking for Core Web Vitals
 */
export function trackWebVitals() {
  if (typeof window === 'undefined') return;

  // Track LCP (Largest Contentful Paint)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('🎯 [Web Vitals] LCP:', lastEntry.startTime.toFixed(2) + 'ms');
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // Track FID (First Input Delay)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      const fidEntry = entry as any; // First Input Delay entries have custom properties
      console.log('🎯 [Web Vitals] FID:', (fidEntry.processingStart - fidEntry.startTime) + 'ms');
    });
  }).observe({ entryTypes: ['first-input'] });

  // Track CLS (Cumulative Layout Shift)
  let clsValue = 0;
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      const clsEntry = entry as any; // Layout Shift entries have custom properties
      if (!clsEntry.hadRecentInput) {
        clsValue += clsEntry.value;
      }
    });
    console.log('🎯 [Web Vitals] CLS:', clsValue.toFixed(4));
  }).observe({ entryTypes: ['layout-shift'] });
}

// Auto-track web vitals in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  trackWebVitals();
} 