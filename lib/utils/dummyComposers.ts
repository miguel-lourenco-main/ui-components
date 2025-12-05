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

/**
 * Composes functions from right to left on the argument.
 * @param {...Function} fns - The functions to compose, applied from right to left.
 * @returns {Function} A new function that represents the composition of the provided functions.
 */
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
 /**
 * Executes a side-effect function on the provided argument and returns the original argument.
 * 
 * @param {any} arg - The argument to be processed.
 * @param {Function} effect - A side-effect function to be executed.
 * @returns {any} The original argument provided.
 */
 
  /**
   * Executes a side-effect function on the provided argument and returns the original argument.
   *
   * @param value - The value on which the side-effect is executed.
   * @param sideEffect - The function to be executed as a side-effect.
   * @returns The original value after the side-effect has been executed.
   */
  
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


 * Executes a side-effect function on the provided argument.
 * @param {any} arg - The argument to be passed to the side-effect function.
 * @param {Function} sideEffectFn - The function to execute as a side-effect.
 * @returns {any} The original argument after executing the side-effect.
 * @description This function executes a side-effect function on the argument and returns the original argument.
 
export function dummyTap<T>(fn: (arg: T) => void): (arg: T) => T {
  return (arg: T) => {
    /**
 * Applies a side-effect function on the argument and returns it.
 /**
 * Executes a side-effect function on the provided argument and returns the original argument.
 *
 * @param {any} argument - The argument to be processed by the side-effect function.
 * @param {function} sideEffect - The function to execute as a side-effect.
 * @returns {any} Returns the original argument after executing the side-effect.
 */
 * 
 * @param {Function} tapFunc - The side-effect function to execute.
 * @param {*} arg - The argument to process and return.
 * @returns {*} The original argument after executing the side-effect.
 */
    fn(arg);
    return arg;
  };
}
