// Maximum file size limit in bytes (256MB)
export const MAX_FILE_SIZE_MB = 256 * 1024 * 1024;

// Human-readable string representation of the maximum file size
export const MAX_FILE_SIZE_STRING = `${MAX_FILE_SIZE_MB / 1024 / 1024}MB`;

// Debug configuration - control console.log statements throughout the app
export const DEBUG_CONFIG = {
  // Component system debugging
  COMPONENT_REGISTRY: false, // Component loading/discovery
  COMPONENT_STATE: true, // Hook state changes (very verbose)
  COMPONENT_PROPS: true, // Props updates and function generation
  
  // Editor debugging
  FUNCTION_EDITOR: true, // Function prop editor debugging
  
  // Build and scripts
  BUILD_SCRIPTS: false, // Keep build script logs as they're helpful
  
  // Debug utilities
  DEBUG_SCRIPTS: false, // Keep debug script logs as they're meant for debugging
} as const;

// Helper function to conditionally log
export function debugLog(category: keyof typeof DEBUG_CONFIG, ...args: any[]) {
  if (DEBUG_CONFIG[category]) {
    console.log(...args);
  }
}