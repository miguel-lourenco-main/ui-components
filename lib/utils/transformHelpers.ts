export function mapObject<T, R>(
  obj: Record<string, T>,
  transform: (value: T, key: string) => R
): Record<string, R> {
  const result: Record<string, R> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = transform(obj[key], key);
    }
  }
  
  return result;
}

export function filterObject<T>(
  obj: Record<string, T>,
  predicate: (value: T, key: string) => boolean
): Record<string, T> {
  const result: Record<string, T> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && predicate(obj[key], key)) {
      result[key] = obj[key];
    }
  }
  
  return result;
}

export function reduceObject<T, R>(
  obj: Record<string, T>,
  reducer: (acc: R, value: T, key: string) => R,
  initialValue: R
): R {
  let result = initialValue;
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result = reducer(result, obj[key], key);
    }
  }
  
  return result;
}

export function invertObject<T extends string | number, U extends string | number>(
  obj: Record<T, U>
): Record<U, T> {
  const result = {} as Record<U, T>;
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[obj[key]] = key;
    }
  }
  
  return result;
}

export function flattenArray<T>(arrays: T[][]): T[] {
  return arrays.reduce((acc, arr) => acc.concat(arr), []);
}

export function flatMap<T, R>(array: T[], mapper: (item: T) => R[]): R[] {
  return flattenArray(array.map(mapper));
}

export function partition<T>(
  array: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];
  
  for (const item of array) {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  }
  
  return [truthy, falsy];
}

export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function zip<T, U>(array1: T[], array2: U[]): [T, U][] {
  const length = Math.min(array1.length, array2.length);
  const result: [T, U][] = [];
  
  for (let i = 0; i < length; i++) {
    result.push([array1[i], array2[i]]);
  }
  
  return result;
}

export function unzip<T, U>(pairs: [T, U][]): [T[], U[]] {
  const first: T[] = [];
  const second: U[] = [];
  
  for (const [a, b] of pairs) {
    first.push(a);
    second.push(b);
  }
  
  return [first, second];
}

