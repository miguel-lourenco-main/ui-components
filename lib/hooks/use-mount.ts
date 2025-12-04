"use client"

import { useEffect, useRef } from 'react'


 * Executes a callback function when the component is mounted.
 * @param callback - The function to execute on mount.
 * @returns {void}
 */
export function useMount(callback: () => void): void {
  useEffect(() => {
    callback();
  }, []);
}

 * Executes a callback function when the component is unmounted.
 * @param callback - The function to execute on unmount.
 * @returns {void}
 */

export function useUnmount(callback: () => void): void {
  const callbackRef = useRef(callback);
  
  callbackRef.current = callback;

  useEffect(() => {
    return () => {
      callbackRef.current();
    };
  }, []);

 * Runs an effect function when the component updates, but not on initial render.
 * @param effect - The function to run on updates.
 * @param deps - The dependency array for the effect.
 * @returns {void}
 */
}

export function useUpdateEffect(effect: () => void, deps: any[]): void {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    
 * Returns a function to check if the component is currently mounted.
 * @returns {function: boolean} - A function that returns true if mounted, false otherwise.
 */
    return effect();
  }, deps);
}

export function useIsMounted(): () => boolean {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return () => isMountedRef.current;
}

