import { ComponentDiscoveryResult, LocalComponent } from '@/types';
import { debugLog } from '@/lib/constants';

// Cache for the loaded registry
let registryCache: any = null;

/**
 * Get the base path for the current deployment environment
 * This matches the basePath logic from next.config.js
 */
function getBasePath(): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // Server-side: check environment variables (same logic as next.config.js)
    if (process.env.NODE_ENV === 'production' && 
        process.env.CI_COMMIT_REF_SLUG && 
        process.env.CI_COMMIT_REF_SLUG !== 'main') {
      return `/${process.env.CI_COMMIT_REF_SLUG}`;
    }
    return '';
  }
  
  // Client-side: detect from current URL path
  const currentPath = window.location.pathname;
  
  // If we're in a subdirectory (branch deployment), extract the base path
  const pathSegments = currentPath.split('/').filter(Boolean);
  if (pathSegments.length > 0 && pathSegments[0] !== '_next') {
    // Check if first segment looks like a branch name (common GitLab branch patterns)
    const firstSegment = pathSegments[0];
    if (firstSegment.includes('-') || firstSegment.match(/^(feat|feature|fix|hotfix|develop|staging)/)) {
      return `/${firstSegment}`;
    }
  }
  
  return '';
}

/**
 * Load the component registry from the generated JSON file
 * This works in both development and static export environments
 */
async function loadRegistry(): Promise<any> {
  if (registryCache) {
    debugLog('general', '📋 Using cached registry');
    return registryCache;
  }

  debugLog('general', '🔄 Loading registry...');

  try {
    // Get the correct base path for the current environment
    const basePath = getBasePath();
    const registryPath = `${basePath}/generated-registry.json`;
    debugLog('general', `🌐 Fetching registry from: ${registryPath}`);
    debugLog('general', `🔍 Base path detected: "${basePath}"`);
    debugLog('general', `🔍 Environment: NODE_ENV=${process.env.NODE_ENV}, CI_COMMIT_REF_SLUG=${process.env.CI_COMMIT_REF_SLUG}`);
    
    const response = await fetch(registryPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch registry: ${response.status} ${response.statusText}`);
    }
    
    const registry = await response.json();
    debugLog('general', '✅ Registry loaded via fetch');
    
    registryCache = registry;
    return registry;
  } catch (fetchError) {
    debugLog('general', '⚠️ Failed to fetch registry via HTTP:', fetchError);
    
    try {
      // Fallback: try dynamic import (works in development)
      debugLog('general', '🔄 Trying dynamic import fallback...');
      const module = await import('@/lib/generated-registry.json');
      const registry = module.default || module;
      debugLog('general', '✅ Registry loaded via dynamic import');
      
      registryCache = registry;
      return registry;
    } catch (importError) {
      debugLog('general', '❌ Failed to load registry via dynamic import:', importError);
      throw new Error(`Failed to load component registry. Fetch error: ${fetchError}. Import error: ${importError}`);
    }
  }
}

/**
 * Discover all local components from the registry
 */
export async function discoverLocalComponents(): Promise<ComponentDiscoveryResult> {
  debugLog('general', '🔍 Starting component discovery from registry...');
  
  try {
    // Load the registry asynchronously
    const expandedRegistry = await loadRegistry();
    
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
    
    for (const registryComponent of expandedRegistry.components) {
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
    
    debugLog('general', `✅ ${components.length} components loaded from registry`);
    debugLog('general', `⚠️ ${errors.length} errors found`);
    
    return { components, errors };
  } catch (error) {
    console.error('❌ Failed to load components from registry:', error);
    
    // Provide fallback components if registry fails to load
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
}

/**
 * Load detailed component data (code, props, examples) for a specific component
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