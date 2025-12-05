export function dummyFunction<T = any>(returnValue: T = undefined as T): (...args: any[]) => T {
  return () => returnValue;
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
