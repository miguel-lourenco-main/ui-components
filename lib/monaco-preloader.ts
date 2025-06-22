/**
 * Monaco Editor Preloader
 * Preloads Monaco Editor during initial app loading to improve perceived performance
 */

import { perf } from './performance';

// Global state for Monaco preloading
let monacoPreloadPromise: Promise<typeof import('@monaco-editor/react')> | null = null;
let monacoModule: typeof import('@monaco-editor/react') | null = null;
let monacoEditorInstance: any = null;
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
    .then(async (module) => {
      console.log('✅ [Monaco Preloader] @monaco-editor/react module loaded');
      
      try {
        // Initialize Monaco Editor by creating a dummy editor to trigger chunk loading
        // This will cause Next.js to load the Monaco Editor chunks
        console.log('🔄 [Monaco Preloader] Triggering Monaco Editor initialization...');
        
        // Create a temporary container
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.top = '-1000px';
        tempContainer.style.left = '-1000px';
        tempContainer.style.width = '100px';
        tempContainer.style.height = '100px';
        tempContainer.style.visibility = 'hidden';
        document.body.appendChild(tempContainer);

        // Use the loader to initialize Monaco
        const { loader } = module;
        
        // Initialize Monaco Editor which will load all required chunks
        const monaco = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Monaco initialization timeout'));
          }, 10000); // 10 second timeout

          loader.init().then((monacoInstance: any) => {
            clearTimeout(timeout);
            console.log('✅ [Monaco Preloader] Monaco Editor core initialized');
            
            // Create a minimal editor to ensure all chunks are loaded
            try {
              const editor = monacoInstance.editor.create(tempContainer, {
                value: '// preload test',
                language: 'typescript',
                theme: 'vs-dark',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: false,
              });
              
              // Dispose the editor immediately
              setTimeout(() => {
                try {
                  editor.dispose();
                  document.body.removeChild(tempContainer);
                } catch (cleanupError) {
                  console.warn('[Monaco Preloader] Cleanup warning:', cleanupError);
                }
              }, 100);
              
              monacoEditorInstance = monacoInstance;
              resolve(monacoInstance);
            } catch (editorError) {
              console.warn('[Monaco Preloader] Editor creation failed, but Monaco loaded:', editorError);
              monacoEditorInstance = monacoInstance;
              resolve(monacoInstance);
            }
          }).catch((initError: any) => {
            clearTimeout(timeout);
            console.error('❌ [Monaco Preloader] Monaco initialization failed:', initError);
            reject(initError);
          });
        });

        monacoModule = module;
        perf.end('monaco-preload', { success: true });
        console.log('✅ [Monaco Preloader] Monaco Editor fully preloaded and ready');
        return module;
        
      } catch (error) {
        console.error('❌ [Monaco Preloader] Failed to initialize Monaco Editor:', error);
        // Fallback: just store the module without full initialization
        monacoModule = module;
        perf.end('monaco-preload', { success: true, fallback: true });
        console.log('⚠️ [Monaco Preloader] Fallback: @monaco-editor/react loaded, Monaco will initialize on first use');
        return module;
      }
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
    moduleLoaded: monacoModule !== null,
    editorInstanceCreated: monacoEditorInstance !== null,
  };
}

/**
 * Reset preloader state (useful for testing)
 */
export function resetMonacoPreloader(): void {
  monacoPreloadPromise = null;
  monacoModule = null;
  monacoEditorInstance = null;
  preloadStarted = false;
} 