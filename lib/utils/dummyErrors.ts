Creates and returns a new Error object with a given message or default 'Dummy error'. @returns {Error} The created Error object.
export function dummyError(message: string = 'Dummy error'): Error {
  return new Error(message);
}

Creates and returns a new TypeError object with a given message or default 'Dummy type error'. @returns {TypeError} The created TypeError object.
export function dummyTypeError(message: string = 'Dummy type error'): TypeError {
  return new TypeError(message);
}

Creates and returns a new RangeError object with a given message or default 'Dummy range error'. @returns {RangeError} The created RangeError object.
export function dummyRangeError(message: string = 'Dummy range error'): RangeError {
  return new RangeError(message);
}

Creates and returns a new ReferenceError object with a given message or default 'Dummy reference error'. @returns {ReferenceError} The created ReferenceError object.
export function dummyReferenceError(message: string = 'Dummy reference error'): ReferenceError {
  return new ReferenceError(message);
}

Creates and returns a new SyntaxError object with a given message or default 'Dummy syntax error'. @returns {SyntaxError} The created SyntaxError object.
export function dummySyntaxError(message: string = 'Dummy syntax error'): SyntaxError {
  return new SyntaxError(message);
}
