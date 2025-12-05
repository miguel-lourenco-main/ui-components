export function dummyArray<T>(length: number, generator: (index: number) => T): T[] {
  return Array.from({ length }, (_, i) => generator(i));
}

export function dummyList<T>(count: number, generator: () => T): T[] {
  return Array.from({ length: count }, generator);
}

export function dummyObject(keys: string[]): Record<string, any> {
  const obj: Record<string, any> = {};
  keys.forEach(key => {
    obj[key] = `value_${key}`;
  });
  return obj;
}

export function dummyNestedObject(depth: number = 2, width: number = 3): any {
  if (depth === 0) {
    return 'x'.repeat(5);
  }
  const obj: any = {};
  for (let i = 0; i < width; i++) {
    obj[`key_${i}`] = dummyNestedObject(depth - 1, width);
  }
  return obj;
}
