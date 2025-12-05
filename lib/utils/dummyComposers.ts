/**
 * Applies functions from left to right on the argument.
 * 
 * @param {...Function} funcs - The functions to apply in sequence.
 * @param {*} arg - The initial argument to pass through the functions.
 * @returns {*} The result after all functions have been applied.
 */
export function dummyPipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
}

export function dummyCompose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  /**
 /**
 * Composes functions from right to left on the argument.
 
 
  /**
   
 * Composes functions from right to left on the argument.
 * 
 * @param {...Function} funcs - The functions to compose.
 * @returns {Function} A new function that represents the composed functions.
 * @description This function takes multiple functions as arguments and returns a new function that, when called, applies the input to the rightmost function first, and then passes the result to the next function to the left, until all functions have been applied.
 
   * Composes functions from right to left on the argument.
   *
   * @param {...Function} funcs - The functions to compose.
   * @returns {Function} A new function that is the composition of the provided functions.
   */

 * Composes functions from right to left on the argument.
 * 
 * @param {...Function} funcs - Functions to be composed.
 * @returns {Function} A new function that represents the composition of the provided functions.
 * @description This function takes any number of functions as arguments and returns a new function that, when invoked, applies the provided functions from right to left.
 *
 * @param {...Function} fns - The functions to compose.
 * @returns {Function} A function that is the result of composing the provided functions.
 */
 /**
 * Composes functions from right to left on the argument.
 *
 * @param {...Function} funcs - Functions to be composed.
 * @returns {Function} A new function that represents the composition of the provided functions.
 */
 /*
 * @function dummyCompose
 * @description Composes and applies functions from right to left on the argument.
 * @param {...Function} funcs - The functions to compose and apply.
 * @returns {Function} A function that takes an argument and applies the composed functions.
 */
 * Composes and applies functions from right to left on the argument.
 * @param {...Function} funcs - The functions to be composed.
 * @returns {Function} A new function that is the result of composing the input functions.
 */
  /**
 * Composes and applies functions from right to left on the argument.
 * 
 * @param {...Function} funcs - Functions to be composed.
 * @returns {Function} - A function that applies the composed functions.
 */
  /**
 * Applies functions from right to left on the argument.
 * 
 * @param {...Function} funcs - The functions to compose in reverse order.
 * @param {*} arg - The initial argument to process.
 * @returns {*} The final result after applying all functions.
 */
  return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
}

export function dummyTap<T>(fn: (arg: T) => void): (arg: T) => T {
  return (arg: T) => {
    /**
 * Applies a side-effect function on the argument and returns it.
 * 
 * @param {Function} tapFunc - The side-effect function to execute.
 * @param {*} arg - The argument to process and return.
 * @returns {*} The original argument after executing the side-effect.
 */
    fn(arg);
    return arg;
  };
}
