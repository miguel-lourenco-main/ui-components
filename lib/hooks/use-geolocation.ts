"use client"

import { useState, useEffect } from 'react'


/**
 * A hook that returns the online status of the browser.
 * @returns {boolean} The online status of the browser.
 * @example
 * const isOnline = useOnline();
 * console.log(isOnline); // true or false
 */
export function useOnline() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

}

/**
 * A hook that returns detailed network connection status of the browser.
 * @returns {{type: string, effectiveType: string, downlink: number, rtt: number}} The connection status object containing type, effective type, downlink speed, and round-trip time.
 * @example
 * const connectionStatus = useConnectionStatus();
 * console.log(connectionStatus);
 */
export function useConnectionStatus(): {
  isOnline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
} {
  const [status, setStatus] = useState<{
    isOnline: boolean;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  }>(() => {
    if (typeof window !== 'undefined' && 'connection' in navigator) {
      const conn = (navigator as any).connection;
      return {
        isOnline: navigator.onLine,
        effectiveType: conn?.effectiveType,
        downlink: conn?.downlink,
        rtt: conn?.rtt,
        saveData: conn?.saveData,
      };
    }
    return { isOnline: navigator.onLine };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateStatus = () => {
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        setStatus({
          isOnline: navigator.onLine,
          effectiveType: conn?.effectiveType,
          downlink: conn?.downlink,
          rtt: conn?.rtt,
          saveData: conn?.saveData,
        });
      } else {
        setStatus({ isOnline: navigator.onLine });
      }
    };

    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      conn?.addEventListener('change', updateStatus);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        conn?.removeEventListener('change', updateStatus);
      }
    };
  }, []);

  return status;
}

