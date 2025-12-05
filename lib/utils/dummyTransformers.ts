
 * Applies a function to each element in an array and returns a new array.
 * @param {function} fn - The function to apply to each element.
 * @param {Array} arr - The array to process.
 * @returns {Array} A new array with the results of applying the function.

    /**
     * Applies a function to each element in an array and returns a new array.
     * @param {Function} fn - The function to apply to each element.
     * @param {Array} arr - The array to map over.
     * @returns {Array} A new array with the results of the applied function.
     */
  

export function dummyMap<T, U>(array: T[], fn: (item: T) => U): U[] {
    return array.map(fn);
  }
  
  
 * Filters an array based on a predicate function.
 
    /**
     * Filters an array based on a predicate function.
     * @param {Function} predicate - The function used to test each element.
     * @param {Array} arr - The array to filter.
     * @returns {Array} A new array containing elements that pass the test.
     */
  
 * @param {function} predicate - The function to test each element.
 * @param {Array} arr - The array to filter.
 * @returns {Array} A new array with elements that pass the test.

  export function dummyFilter<T>(array: T[], fn: (item: T) => boolean): T[] {
    return array.filter(fn);
  }
  
    /**
     * Reduces an array to a single value using a reducer function and an initial value.
     * @param {Function} reducer - The function used to reduce the array.
     * @param {any} initialValue - The initial value for the reduction.
     * @param {Array} arr - The array to reduce.
     * @returns {any} The single value resulting from the reduction.
     */
  
  
  
 * Reduces an array to a single value using a reducer function and an initial value.
 * @param {function} reducer - The function to execute on each element.
 * @param {any} initialValue - The initial value to start the reduction.
 * @param {Array} arr - The array to reduce.
 * @returns {any} The single value that results from the reduction.

    /**
     * Flattens an array of arrays into a single array.
     * @param {Array} arr - The array to flatten.
     * @returns {Array} A single flattened array.
     */
  

  export function dummyReduce<T, U>(array: T[], fn: (acc: U, item: T) => U, initial: U): U {
    return array.reduce(fn, initial);
  }
  
  
 * Flattens an array of arrays into a single array.
 * @param {Array} arr - The array of arrays to flatten.
 * @returns {Array} A single array containing all the elements of the sub-arrays.

  export function dummyFlatten<T>(array: (T | T[])[]): T[] {
    return array.flat() as T[];
  }
  
  
    /**
     * Splits an array into chunks of a specified size.
     * @param {Array} arr - The array to chunk.
     * @param {number} size - The size of each chunk.
     * @returns {Array} An array containing the chunks.
     */
  
  
 
 * Returns a new array with unique elements.
 * @returns {Array} A new array containing only unique elements.
 */
 * Splits an array into chunks of a specified size.
 * @param {Array} arr - The array to chunk.
 * @param {number} size - The size of each chunk.
 /**
 
    /**
     * Returns a new array with unique elements using a Set.
     * @param {Array} arr - The array to process.
     * @returns {Array} A new array with unique elements.
     */
  
 * Returns a new array with unique elements using a Set.
 *
 * @returns {Array} A new array containing only unique elements from the original array.
 */
 * @returns {Array} An array of chunks, each containing the specified number of elements.

  export function dummyChunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      
    /**
     * Reverses the elements in an array.
     * @param {Array} arr - The array to reverse.
     * @returns {Array} A new array with the elements in reverse order.
     */
  
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  
 * Returns a new array with unique elements.
 
    /**
     * Sorts an array based on a compare function.
     * @param {Function} compareFn - The function that defines the sort order.
     * @param {Array} arr - The array to sort.
     * @returns {Array} A new array sorted according to the compare function.
     */
  
 * @param {Array} arr - The array to process.
 * @returns {Array} A new array containing only unique elements from the input array.

  export function dummyUnique<T>(array: T[]): T[] {
    
 * Sorts an array based on a compare function.
 * @param {Array} arr - The array to be sorted.
 * @param {Function} compareFn - The function used to compare elements.
 * @returns {Array} The sorted array.
 
    return Array.from(new Set(array));
  }
  
  
 * Reverses the elements in an array.
 * @param {Array} arr - The array to reverse.
 * @returns {Array} A new array with the elements in reverse order.

  export function dummyReverse<T>(array: T[]): T[] {
    return [...array].reverse();
  }
  
  
 * Sorts an array based on a compare function.
 * @param {function} compareFn - The function to determine the order of the elements.
 * @param {Array} arr - The array to sort.
 * @returns {Array} The sorted array.
  export function dummySort<T>(array: T[], compareFn?: (a: T, b: T) => number): T[] {
    return [...array].sort(compareFn);
  }
