"use client"

import { useState, useEffect } from 'react'

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined;
    height: number | undefined;
  }>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

export function useIsMobile(breakpoint: number = 768): boolean {
  const { width } = useWindowSize();
  return width !== undefined ? width < breakpoint : false;
}

export function useIsTablet(breakpoint: number = 1024): boolean {
  const { width } = useWindowSize();
  return width !== undefined ? width >= 768 && width < breakpoint : false;
}

export function useIsDesktop(breakpoint: number = 1024): boolean {
  const { width } = useWindowSize();
  return width !== undefined ? width >= breakpoint : false;
}

