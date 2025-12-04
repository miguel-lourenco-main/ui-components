"use client"

import { useState, useCallback } from 'react'

export function useCopyToClipboard(): [
  string | null,
  (text: string) => Promise<boolean>,
  { error: Error | null; reset: () => void }
] {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      if (!navigator?.clipboard) {
        throw new Error('Clipboard API not available');
      }

      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setError(null);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to copy');
      setError(error);
      setCopiedText(null);
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setCopiedText(null);
    setError(null);
  }, []);

  return [copiedText, copy, { error, reset }];
}

export function useCopyToClipboardWithTimeout(timeout: number = 2000): [
  boolean,
  (text: string) => Promise<void>
] {
  const [copied, setCopied] = useState<boolean>(false);

  const copy = useCallback(async (text: string): Promise<void> => {
    try {
      if (!navigator?.clipboard) {
        throw new Error('Clipboard API not available');
      }

      await navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, timeout);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }, [timeout]);

  return [copied, copy];
}

