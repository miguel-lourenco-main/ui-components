export function dummyMap<T, U>(array: T[], fn: (item: T) => U): U[] {
    return array.map(fn);
  }
  
  export function dummyFilter<T>(array: T[], fn: (item: T) => boolean): T[] {
    return array.filter(fn);
  }
  
  export function dummyReduce<T, U>(array: T[], fn: (acc: U, item: T) => U, initial: U): U {
    return array.reduce(fn, initial);
  }
  
  export function dummyFlatten<T>(array: (T | T[])[]): T[] {
    return array.flat() as T[];
  }
  
  export function dummyChunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  export function dummyUnique<T>(array: T[]): T[] {
    return Array.from(new Set(array));
  }
  
  export function dummyReverse<T>(array: T[]): T[] {
    return [...array].reverse();
  }
  
  export function dummySort<T>(array: T[], compareFn?: (a: T, b: T) => number): T[] {
    return [...array].sort(compareFn);
  }
