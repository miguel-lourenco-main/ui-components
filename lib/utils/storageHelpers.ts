export function setLocalStorage(key: string, value: any): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function getLocalStorage<T>(key: string, defaultValue: T | null = null): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

export function clearLocalStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

export function setSessionStorage(key: string, value: any): void {
  try {
    const serialized = JSON.stringify(value);
    sessionStorage.setItem(key, serialized);
  } catch (error) {
    console.error('Error saving to sessionStorage:', error);
  }
}

export function getSessionStorage<T>(key: string, defaultValue: T | null = null): T | null {
  try {
    const item = sessionStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error('Error reading from sessionStorage:', error);
    return defaultValue;
  }
}

export function removeSessionStorage(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from sessionStorage:', error);
  }
}

export function hasLocalStorage(key: string): boolean {
  return localStorage.getItem(key) !== null;
}

export function hasSessionStorage(key: string): boolean {
  return sessionStorage.getItem(key) !== null;
}

