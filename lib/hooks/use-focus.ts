"use client"

import { useState, useRef, useEffect } from 'react'

export function useFocus<T extends HTMLElement = HTMLElement>(): [
  React.RefObject<T>,
  boolean,
  () => void,
  () => void
] {
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef<T>(null);

  const focus = () => {
    ref.current?.focus();
  };

  const blur = () => {
    ref.current?.blur();
  };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, []);

  return [ref, isFocused, focus, blur];
}

export function useFocusWithin<T extends HTMLElement = HTMLElement>(): [
  React.RefObject<T>,
  boolean
] {
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleFocusIn = () => setIsFocusedWithin(true);
    const handleFocusOut = () => setIsFocusedWithin(false);

    element.addEventListener('focusin', handleFocusIn);
    element.addEventListener('focusout', handleFocusOut);

    return () => {
      element.removeEventListener('focusin', handleFocusIn);
      element.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return [ref, isFocusedWithin];
}

