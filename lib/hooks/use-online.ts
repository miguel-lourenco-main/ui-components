"use client"

import { useState, useEffect } from 'react'

export function useOnline(): boolean {
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

  return isOnline;
}

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

