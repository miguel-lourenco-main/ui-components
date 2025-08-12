import { ComponentDiscoveryResult, FullComponentInfo, ComponentExample } from '@/lib/interfaces';
import { debugLog } from '@/lib/constants';
import { getMonacoPreloadStatus } from '@/lib/monaco-preloader';
import { COMPONENTS_INDEX } from '@/lib/componentsIndex';
import indexJson from '@/components/display-components/index.json';

/**
 * Discover all local components from the static registry
 * Optimized for performance with static imports only (no API calls for static deployment)
 */
export async function discoverLocalComponents(): Promise<ComponentDiscoveryResult> {
  debugLog('general', '🔍 Loading components from static registry...');
  
  // Get blacklist from index.json
  const blacklist = (indexJson.blacklist || []) as string[];
  
  const components = COMPONENTS_INDEX.filter(c => !blacklist.includes(c.id)).map(c => ({
    ...c,
    // Normalize id to kebab-case just in case
    id: c.id.toLowerCase(),
  } as FullComponentInfo));

  const monacoStatus = getMonacoPreloadStatus();
  if (monacoStatus.isPreloaded) {
    console.log('🎉 [Monaco Preloader] Monaco Editor was ready before components finished loading - optimal performance!');
  } else if (monacoStatus.isLoading) {
    console.log('⏳ [Monaco Preloader] Monaco Editor still loading when components finished - good parallelization');
  } else {
    console.log('⚠️ [Monaco Preloader] Monaco Editor not started when components finished - preload may have failed');
  }

  return { components, errors: [] };
}

/**
 * Provide fallback components when registry loading fails
 */
function getFallbackComponents(error: any): ComponentDiscoveryResult {
  const fallbackComponents: FullComponentInfo[] = [
    {
      id: 'button-fallback',
      name: 'Button',
      description: 'Basic button component (fallback)',
      props: [
        {
          name: 'children',
          type: 'function',
          required: true,
          description: 'Button content',
          defaultValue: { type: 'function', source: 'return "Click me";' },
          functionSignature: { params: '', returnType: 'React.ReactNode' }
        },
        {
          name: 'onClick',
          type: 'function',
          required: false,
          description: 'Click handler',
          functionSignature: { params: 'event: React.MouseEvent', returnType: 'void' }
        }
      ],
      tags: ['fallback'],
      version: '1.0.0',
      author: 'Fallback',
      preview: 'button',
      examples: [],
    }
  ];
  
  debugLog('general', '🆘 Using fallback components due to registry load failure');
  
  return {
    components: fallbackComponents,
    errors: [{
      filePath: 'Registry',
      error: error instanceof Error ? error.message : 'Failed to load registry',
      type: 'component'
    }]
  };
}

/**
 * Load detailed component data (code, props, examples) for a specific component
 * Optimized with caching
 */
export async function loadComponentDetails(componentId: string): Promise<Partial<FullComponentInfo>> {
  const comp = COMPONENTS_INDEX.find(c => c.id === componentId);
  if (!comp) throw new Error(`Component ${componentId} not found`);
  return {
    id: comp.id,
    props: comp.props,
  };
}

/**
 * Clear the registry cache (useful for development)
 */
export function clearRegistryCache(): void {
  // no-op: static index
  debugLog('general', '🗑️ Static components index in use; nothing to clear');
}

/**
 * Watch for changes in the components directory
 * This is a simplified version - in practice you'd use chokidar or similar
 */
export async function watchComponentChanges(callback: (changes: string[]) => void): Promise<() => void> {
  // TODO: Implement file system watching
  // For now, return a no-op function
  return () => {};
}

/**
 * Get all component categories from discovered components
 */
export async function getComponentCategories(): Promise<string[]> {
  // Categories are no longer used; keep function for compatibility
  return [];
}

/**
 * Get full components info including prop-based examples by loading example modules per component.
 * Uses the static components index and dynamically imports the corresponding *.examples files.
 */
export async function getFullComponentsInfo(): Promise<FullComponentInfo[]> {
  const blacklist = (indexJson.blacklist || []) as string[];
  const indexItems = (indexJson.components || []) as Array<{ id: string; name: string; path: string }>;

  // Build a map from id -> normalized path for example file resolution
  const idToPath: Record<string, string> = {};
  for (const item of indexItems) {
    if (blacklist.includes(item.id)) continue;
    const normalizedPath = item.path.replace(/^\.\/+/, '').replace(/\/+$/, '');
    idToPath[item.id] = normalizedPath;
  }

  const components: FullComponentInfo[] = [];

  for (const base of COMPONENTS_INDEX.filter(c => !blacklist.includes(c.id))) {
    let examples: ComponentExample[] = [];
    try {
      const compPath = idToPath[base.id];
      if (compPath) {
        // Import the Examples module using the index path and component name
        const examplesModule = await import(`@/components/display-components/${compPath}/${base.name}.examples`);
        const exportKey = `${base.id}Examples` as keyof typeof examplesModule;
        const exportedExamples = (examplesModule as any)[exportKey] || (examplesModule as any).examples || [];
        if (Array.isArray(exportedExamples)) {
          examples = exportedExamples as ComponentExample[];
        }
      }
    } catch (err) {
      // Silently ignore if examples are not available for a component
      console.warn(`No examples found for component ${base.name} (${base.id})`, err);
    }

    components.push({
      id: base.id,
      name: base.name,
      description: base.description,
      props: base.props,
      tags: base.tags,
      version: base.version,
      author: base.author,
      examples,
      preview: base.id,
    });
  }

  return components;
}