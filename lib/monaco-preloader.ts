/**
 * Monaco Editor Preloader
 * Preloads Monaco Editor during initial app loading to improve perceived performance
 */

import { perf } from './performance';

// Global state for Monaco preloading
let monacoPreloadPromise: Promise<typeof import('@monaco-editor/react')> | null = null;
let monacoModule: typeof import('@monaco-editor/react') | null = null;
let preloadStarted = false;

/**
 * Start preloading Monaco Editor in the background
 * This should be called early in the app lifecycle
 */
export function startMonacoPreload(): Promise<typeof import('@monaco-editor/react')> {
  if (monacoPreloadPromise) {
    return monacoPreloadPromise;
  }

  if (preloadStarted) {
    // Return a promise that resolves when the current preload completes
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (monacoModule) {
          clearInterval(checkInterval);
          resolve(monacoModule);
        }
        if (monacoPreloadPromise === null && !monacoModule) {
          clearInterval(checkInterval);
          reject(new Error('Monaco preload failed'));
        }
      }, 100);
    });
  }

  preloadStarted = true;
  perf.start('monaco-preload');

  console.log('🚀 [Monaco Preloader] Starting Monaco Editor preload...');

  monacoPreloadPromise = import('@monaco-editor/react')
    .then((module) => {
      monacoModule = module;
      perf.end('monaco-preload', { success: true });
      console.log('✅ [Monaco Preloader] Monaco Editor preloaded successfully');
      return module;
    })
    .catch((error) => {
      perf.end('monaco-preload', { success: false, error: error.message });
      console.error('❌ [Monaco Preloader] Failed to preload Monaco Editor:', error);
      monacoPreloadPromise = null;
      preloadStarted = false;
      throw error;
    });

  return monacoPreloadPromise;
}

/**
 * Get the preloaded Monaco Editor module
 * Returns immediately if already loaded, otherwise starts loading
 */
export async function getPreloadedMonaco(): Promise<typeof import('@monaco-editor/react')> {
  if (monacoModule) {
    console.log('✅ [Monaco Preloader] Using preloaded Monaco Editor');
    return monacoModule;
  }

  if (monacoPreloadPromise) {
    console.log('⏳ [Monaco Preloader] Waiting for Monaco Editor preload to complete...');
    return monacoPreloadPromise;
  }

  console.log('🔄 [Monaco Preloader] Monaco not preloaded, starting load now...');
  return startMonacoPreload();
}

/**
 * Check if Monaco Editor is preloaded and ready
 */
export function isMonacoPreloaded(): boolean {
  return monacoModule !== null;
}

/**
 * Get loading status for debugging
 */
export function getMonacoPreloadStatus() {
  return {
    preloadStarted,
    isPreloaded: monacoModule !== null,
    isLoading: monacoPreloadPromise !== null && monacoModule === null,
  };
}

/**
 * Reset preloader state (useful for testing)
 */
export function resetMonacoPreloader(): void {
  monacoPreloadPromise = null;
  monacoModule = null;
  preloadStarted = false;
} 