// Maximum file size limit in bytes (256MB)
export const MAX_FILE_SIZE_MB = 256 * 1024 * 1024;

// Human-readable string representation of the maximum file size
export const MAX_FILE_SIZE_STRING = `${MAX_FILE_SIZE_MB / 1024 / 1024}MB`;

// Toggle detailed logging for different parts of the app
export const DEBUG_ENABLED = {
  general: false,
  state: false,
  props: false,
  effects: false,
  validation: false,
  FUNCTION_EDITOR: false,
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

// Components blacklist moved to components/display-components/index.json
// This is kept for backward compatibility but no longer used
export const COMPONENTS_BLACKLIST: string[] = [];

export const BASE_REPO_URL = 'https://gitlab.com/miguel-lourenco-main/ui-components';

/**
 * Resolve the public base URL for the app.
 *
 * Centralizes the GitLab Pages deployment logic so metadata, links, and config
 * stay in sync.
 */
export function getPublicBaseUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    const slug = process.env.CI_COMMIT_REF_SLUG;
    if (slug && slug !== 'main') {
      return `https://ui-components-5218c2.gitlab.io/${slug}`;
    }
    return 'https://miguel-lourenco-main.gitlab.io/ui-components';
  }

  return 'http://localhost:3000';
}
