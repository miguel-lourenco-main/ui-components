import { ComponentDiscoveryResult } from '@/types';

/**
 * Discover all local components by calling the API
 */
export async function discoverLocalComponents(): Promise<ComponentDiscoveryResult> {
  console.log('🔍 Starting component discovery...');
  
  try {
    console.log('📡 Fetching from /api/components');
    const response = await fetch('/api/components');
    
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ComponentDiscoveryResult = await response.json();
    console.log('✅ Components loaded:', result.components.length);
    console.log('⚠️ Errors found:', result.errors.length);
    
    return result;
  } catch (error) {
    console.error('❌ Failed to discover components:', error);
    return {
      components: [],
      errors: [{
        filePath: '/api/components',
        error: error instanceof Error ? error.message : 'Failed to fetch components',
        type: 'component'
      }]
    };
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