import { ComponentDiscoveryResult, LocalComponent } from '@/types';
import { debugLog } from '@/lib/constants';
import { getMonacoPreloadStatus } from '@/lib/monaco-preloader';

// Cache for the loaded registry with timestamp
let registryCache: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Load the component registry from the generated JSON file
 * The registry is built at build time and imported directly
 * Implements caching and lazy loading for better performance
 */
async function loadRegistry(): Promise<any> {
  const now = Date.now();
  
  // Return cached registry if still fresh
  if (registryCache && (now - cacheTimestamp) < CACHE_DURATION) {
    debugLog('general', '📋 Using cached registry');
    return registryCache;
  }

  debugLog('general', '🔄 Loading registry...');

  try {
    // Import the registry directly - it's built at build time
    debugLog('general', '📦 Loading registry via dynamic import...');
    
    // Add timeout to prevent hanging
    const importPromise = import('@/lib/generated-registry.json');
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Registry import timeout')), 8000);
    });
    
    const module = await Promise.race([importPromise, timeoutPromise]) as any;
    const registry = module.default || module;
    
    debugLog('general', '✅ Registry loaded successfully');
    
    // Update cache
    registryCache = registry;
    cacheTimestamp = now;
    
    return registry;
  } catch (importError) {
    debugLog('general', '❌ Failed to load registry:', importError);
    
    // Clear cache on error
    registryCache = null;
    cacheTimestamp = 0;
    
    throw new Error(`Failed to load component registry: ${importError instanceof Error ? importError.message : 'Unknown error'}`);
  }
}

/**
 * Discover all local components from the registry
 * Optimized for performance with better error handling
 */
export async function discoverLocalComponents(): Promise<ComponentDiscoveryResult> {
  debugLog('general', '🔍 Starting component discovery from registry...');
  
  try {
    // Load the registry asynchronously with timeout
    const loadPromise = loadRegistry();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Registry loading timeout after 8 seconds')), 8000);
    });
    
    const expandedRegistry = await Promise.race([loadPromise, timeoutPromise]);
    
    // Add debugging for registry loading
    debugLog('general', '📋 Registry loaded:', {
      hasRegistry: !!expandedRegistry,
      hasComponents: !!expandedRegistry?.components,
      componentCount: expandedRegistry?.components?.length || 0,
      registryKeys: Object.keys(expandedRegistry || {})
    });
    
    if (!expandedRegistry) {
      throw new Error('Registry not loaded - expandedRegistry is null/undefined');
    }
    
    if (!expandedRegistry.components) {
      throw new Error('Registry loaded but no components array found');
    }
    
    const components: LocalComponent[] = [];
    const errors: any[] = expandedRegistry.buildErrors || [];
    
    debugLog('general', `🔄 Processing ${expandedRegistry.components.length} components from registry...`);
    
    // Process components in batches for better performance
    const BATCH_SIZE = 5;
    for (let i = 0; i < expandedRegistry.components.length; i += BATCH_SIZE) {
      const batch = expandedRegistry.components.slice(i, i + BATCH_SIZE);
      
      for (const registryComponent of batch) {
        try {
          const component: LocalComponent = {
            id: registryComponent.id,
            name: registryComponent.name,
            category: registryComponent.category as any,
            description: registryComponent.description,
            props: (registryComponent.props || []) as any,
            code: registryComponent.code || '',
            examples: (registryComponent.examples || []) as any,
            tags: registryComponent.tags || [],
            version: registryComponent.version,
            author: registryComponent.author,
            filePath: registryComponent.filePath,
            metaPath: registryComponent.metaPath,
            examplesPath: registryComponent.examplesPath,
            lastModified: new Date(registryComponent.lastModified || new Date()),
            isLocal: true,
            dependencies: registryComponent.dependencies || [],
            createdAt: registryComponent.createdAt || new Date().toISOString(),
            updatedAt: registryComponent.updatedAt || new Date().toISOString()
          };
          
          components.push(component);
        } catch (error) {
          errors.push({
            filePath: registryComponent.filePath,
            error: error instanceof Error ? error.message : 'Unknown error',
            type: 'component' as const
          });
        }
      }
      
      // Add small delay between batches to prevent blocking
      if (i + BATCH_SIZE < expandedRegistry.components.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    debugLog('general', `✅ ${components.length} components loaded from registry`);
    debugLog('general', `⚠️ ${errors.length} errors found`);
    
    // Log Monaco preload status when components finish loading
    const monacoStatus = getMonacoPreloadStatus();
    if (monacoStatus.isPreloaded) {
      console.log('🎉 [Monaco Preloader] Monaco Editor was ready before components finished loading - optimal performance!');
    } else if (monacoStatus.isLoading) {
      console.log('⏳ [Monaco Preloader] Monaco Editor still loading when components finished - good parallelization');
    } else {
      console.log('⚠️ [Monaco Preloader] Monaco Editor not started when components finished - preload may have failed');
    }
    
    return { components, errors };
  } catch (error) {
    console.error('❌ Failed to load components from registry:', error);
    
    // Provide fallback components if registry fails to load
    return getFallbackComponents(error);
  }
}

/**
 * Provide fallback components when registry loading fails
 */
function getFallbackComponents(error: any): ComponentDiscoveryResult {
  const fallbackComponents: LocalComponent[] = [
    {
      id: 'button-fallback',
      name: 'Button',
      category: 'form' as any,
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
      code: 'export default function Button(props) { return <button onClick={props.onClick}>{typeof props.children === "function" ? props.children() : props.children}</button>; }',
      examples: [],
      tags: ['fallback'],
      version: '1.0.0',
      author: 'Fallback',
      filePath: 'fallback',
      metaPath: 'fallback',
      examplesPath: 'fallback',
      lastModified: new Date(),
      isLocal: true,
      dependencies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
export async function loadComponentDetails(componentId: string): Promise<Partial<LocalComponent>> {
  const expandedRegistry = await loadRegistry();
  const registryComponent = expandedRegistry.components.find((comp: any) => comp.id === componentId);
  if (!registryComponent) {
    throw new Error(`Component ${componentId} not found in registry`);
  }

  try {
    debugLog('general', `📄 Loading details for component: ${componentId}`);
    
    // All data is already available in the expanded registry
    const details: Partial<LocalComponent> = {
      id: registryComponent.id,
      props: (registryComponent.props || []) as any,
      code: registryComponent.code || '',
      examples: (registryComponent.examples || []) as any,
      dependencies: registryComponent.dependencies || []
    };
    
    debugLog('general', `✅ Component details loaded for: ${componentId}`);
    return details;
  } catch (error) {
    console.error(`❌ Failed to load component details for ${componentId}:`, error);
    throw error;
  }
}

/**
 * Clear the registry cache (useful for development)
 */
export function clearRegistryCache(): void {
  registryCache = null;
  cacheTimestamp = 0;
  debugLog('general', '🗑️ Registry cache cleared');
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
  try {
    const { components } = await discoverLocalComponents();
    const categories = new Set(components.map(comp => comp.category));
    return Array.from(categories);
  } catch {
    return [];
  }
} 