import React from 'react';
import { debugLog } from '@/lib/constants';

// Static imports for all components
import { DataTable } from '@/components/display_components/data-display/DataTable/DataTable';
import Button from '@/components/display_components/buttons/Button/Button';
import Card from '@/components/display_components/layout/Card/Card';
import Input from '@/components/display_components/forms/Input/Input';

// Global types for debugging
declare global {
  interface Window {
    COMPONENT_REGISTRY?: Record<string, React.ComponentType<any>>;
    DataTable?: React.ComponentType<any>;
    Button?: React.ComponentType<any>;
    Card?: React.ComponentType<any>;
    Input?: React.ComponentType<any>;
  }
}

// Component registry with static imports
export const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  DataTable,
  Button,
  Card,
  Input,
};

// Debug: Log registry contents
debugLog('general', '🏛️ Component Registry initialized with:', Object.keys(COMPONENT_REGISTRY));
debugLog('general', '🧩 All components loaded:');
debugLog('general', '  - DataTable:', DataTable);
debugLog('general', '  - Button:', Button);
debugLog('general', '  - Card:', Card);
debugLog('general', '  - Input:', Input);

// Make registry available globally for debugging
if (typeof window !== 'undefined') {
  window.COMPONENT_REGISTRY = COMPONENT_REGISTRY;
  window.DataTable = DataTable;
  window.Button = Button;
  window.Card = Card;
  window.Input = Input;
  debugLog('general', '🌍 All components exposed globally for debugging');
}

/**
 * Get a component by name from the static registry
 */
export function getComponentByName(name: string): React.ComponentType<any> | null {
  debugLog('general', `🔍 Looking for component: ${name} in registry with keys:`, Object.keys(COMPONENT_REGISTRY));
  const component = COMPONENT_REGISTRY[name] || null;
  debugLog('general', `${component ? '✅' : '❌'} Component ${name} ${component ? 'found' : 'not found'}`);
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