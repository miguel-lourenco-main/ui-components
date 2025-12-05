export function dummyError(message: string = 'Dummy error'): Error {
  return new Error(message);
}

export function dummyTypeError(message: string = 'Dummy type error'): TypeError {
  return new TypeError(message);
}

export function dummyRangeError(message: string = 'Dummy range error'): RangeError {
  return new RangeError(message);
}

export function dummyReferenceError(message: string = 'Dummy reference error'): ReferenceError {
  return new ReferenceError(message);
}

export function dummySyntaxError(message: string = 'Dummy syntax error'): SyntaxError {
  return new SyntaxError(message);
}
