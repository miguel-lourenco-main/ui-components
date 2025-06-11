import { ComponentDiscoveryResult, LocalComponent } from '@/types';
import { debugLog } from '@/lib/constants';
import expandedRegistry from '@/lib/generated-registry.json';

/**
 * Discover all local components from the registry
 */
export async function discoverLocalComponents(): Promise<ComponentDiscoveryResult> {
  debugLog('COMPONENT_REGISTRY', '🔍 Starting component discovery from registry...');
  
  try {
    const components: LocalComponent[] = [];
    const errors: any[] = expandedRegistry.buildErrors || [];
    
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
    
    debugLog('COMPONENT_REGISTRY', `✅ ${components.length} components loaded from registry`);
    debugLog('COMPONENT_REGISTRY', `⚠️ ${errors.length} errors found`);
    
    return { components, errors };
  } catch (error) {
    console.error('❌ Failed to load components from registry:', error);
    return {
      components: [],
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
  const registryComponent = expandedRegistry.components.find((comp: any) => comp.id === componentId);
  if (!registryComponent) {
    throw new Error(`Component ${componentId} not found in registry`);
  }

  try {
    debugLog('COMPONENT_REGISTRY', `📄 Loading details for component: ${componentId}`);
    
    // All data is already available in the expanded registry
    const details: Partial<LocalComponent> = {
      id: registryComponent.id,
      props: (registryComponent.props || []) as any,
      code: registryComponent.code || '',
      examples: (registryComponent.examples || []) as any,
      dependencies: registryComponent.dependencies || []
    };
    
    debugLog('COMPONENT_REGISTRY', `✅ Component details loaded for: ${componentId}`);
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