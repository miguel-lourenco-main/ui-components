// Maximum file size limit in bytes (256MB)
export const MAX_FILE_SIZE_MB = 256 * 1024 * 1024;

// Human-readable string representation of the maximum file size
export const MAX_FILE_SIZE_STRING = `${MAX_FILE_SIZE_MB / 1024 / 1024}MB`;

// Toggle detailed logging for different parts of the app
export const DEBUG_ENABLED = {
  general: true,
  state: true,
  props: true,
  effects: true,
  validation: true,
  FUNCTION_EDITOR: true,
};

type DebugCategory = keyof typeof DEBUG_ENABLED;

/**
 * A wrapper for console.log that can be toggled by category.
 * Helps to avoid having to comment/uncomment log statements everywhere.
 */
export function debugLog(category: DebugCategory, ...args: any[]) {
  if (DEBUG_ENABLED[category]) {
    console.log(...args);
  }
}