"use client"

import { useEffect, useRef } from 'react'

export function useMount(callback: () => void): void {
  useEffect(() => {
    callback();
  }, []);
}

export function useUnmount(callback: () => void): void {
  const callbackRef = useRef(callback);
  
  callbackRef.current = callback;

  useEffect(() => {
    return () => {
      callbackRef.current();
    };
  }, []);
}

export function useUpdateEffect(effect: () => void, deps: any[]): void {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

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

