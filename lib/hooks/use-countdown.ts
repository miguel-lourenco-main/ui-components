"use client"

import { useState, useEffect, useRef } from 'react'


 * @description A hook that manages a countdown timer.
 * @param {number} initialSeconds - The initial countdown time in seconds.
 * @param {function} [onComplete] - Optional callback function to be called when the countdown reaches zero.
 * @returns {{ seconds: number, isActive: boolean, start: function, pause: function, reset: function }} An object containing the countdown state and methods.
export function useCountdown(initialSeconds: number, onComplete?: () => void): {
  seconds: number;
  isActive: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
} {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, seconds, onComplete]);

  const start = () => setIsActive(true);
  const pause = () => setIsActive(false);
  const reset = () => {
    
 * @description A hook that manages a simple timer.
 * @param {number} [initialSeconds=0] - The initial timer time in seconds, default is 0.
 * @returns {{ seconds: number, isRunning: boolean, start: function, stop: function, reset: function }} An object containing the timer state and methods.
    setIsActive(false);
    setSeconds(initialSeconds);
  };

  return { seconds, isActive, start, pause, reset };
}

export function useTimer(initialSeconds: number = 0): {
  seconds: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
} {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    setSeconds(initialSeconds);
  };

  return { seconds, isRunning, start, stop, reset };
}

