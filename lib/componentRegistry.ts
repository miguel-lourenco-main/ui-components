import React from 'react';

// Static imports for all components
import { DataTable } from '@/components/display_components/data-display/DataTable/DataTable';

// Global types for debugging
declare global {
  interface Window {
    COMPONENT_REGISTRY?: Record<string, React.ComponentType<any>>;
    DataTable?: React.ComponentType<any>;
  }
}

// Component registry with static imports
export const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  DataTable,
};

// Debug: Log registry contents
console.log('🏛️ Component Registry initialized with:', Object.keys(COMPONENT_REGISTRY));
console.log('🧩 DataTable component:', DataTable);
console.log('🧩 DataTable type:', typeof DataTable);

// Make registry available globally for debugging
if (typeof window !== 'undefined') {
  window.COMPONENT_REGISTRY = COMPONENT_REGISTRY;
  window.DataTable = DataTable;
  console.log('🌍 Registry exposed globally for debugging');
}

/**
 * Get a component by name from the static registry
 */
export function getComponentByName(name: string): React.ComponentType<any> | null {
  console.log(`🔍 Looking for component: ${name} in registry with keys:`, Object.keys(COMPONENT_REGISTRY));
  const component = COMPONENT_REGISTRY[name] || null;
  console.log(`${component ? '✅' : '❌'} Component ${name} ${component ? 'found' : 'not found'}`);
  return component;
}

/**
 * Check if a component exists in the registry
 */
export function hasComponent(name: string): boolean {
  return name in COMPONENT_REGISTRY;
}

/**
 * Get all registered component names
 */
export function getRegisteredComponentNames(): string[] {
  return Object.keys(COMPONENT_REGISTRY);
} 