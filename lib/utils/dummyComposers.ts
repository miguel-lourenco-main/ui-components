export function dummyPipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
}

export function dummyCompose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
}

export function dummyTap<T>(fn: (arg: T) => void): (arg: T) => T {
  return (arg: T) => {
    fn(arg);
    return arg;
  };
}
