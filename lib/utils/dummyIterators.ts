/** Iterates over an array and applies a function to each element. */
export function dummyForEach<T>(array: T[], fn: (item: T, index: number) => void): void {
  array.forEach(fn);
}

/** Creates a new array by applying a function to each element. */
export function dummyMap<T, U>(array: T[], fn: (item: T, index: number) => U): U[] {
  return array.map(fn);
}

/** Filters array elements based on a predicate function. */
export function dummyFilter<T>(array: T[], fn: (item: T, index: number) => boolean): T[] {
  return array.filter(fn);
}

/** Reduces an array to a single value using a reducer function. */
export function dummyReduce<T, U>(array: T[], fn: (acc: U, item: T, index: number) => U, initial: U): U {
  return array.reduce(fn, initial);
}

/** Finds the first element that matches a predicate. */
export function dummyFind<T>(array: T[], fn: (item: T, index: number) => boolean): T | undefined {
  return array.find(fn);
}

/** Finds the index of the first element that matches a predicate. */
export function dummyFindIndex<T>(array: T[], fn: (item: T, index: number) => boolean): number {
  return array.findIndex(fn);
}

/** Checks if any element matches a predicate. */
export function dummySome<T>(array: T[], fn: (item: T, index: number) => boolean): boolean {
  return array.some(fn);
}

/** Checks if all elements match a predicate. */
export function dummyEvery<T>(array: T[], fn: (item: T, index: number) => boolean): boolean {
  return array.every(fn);
}

/** Returns the first element of an array. */
export function dummyFirst<T>(array: T[]): T | undefined {
  return array[0];
}

/** Returns the last element of an array. */
export function dummyLast<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

/** Returns the first N elements of an array. */
export function dummyTake<T>(array: T[], count: number): T[] {
  return array.slice(0, count);
}

/** Returns all elements except the first N. */
export function dummySkip<T>(array: T[], count: number): T[] {
  return array.slice(count);
}

/** Groups array elements by a key function. */
export function dummyGroupBy<T, K extends string | number>(array: T[], keyFn: (item: T) => K): Record<K, T[]> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

/** Partitions array into two arrays based on a predicate. */
export function dummyPartition<T>(array: T[], fn: (item: T) => boolean): [T[], T[]] {
  return array.reduce((acc, item) => {
    acc[fn(item) ? 0 : 1].push(item);
    return acc;
  }, [[], []] as [T[], T[]]);
}
