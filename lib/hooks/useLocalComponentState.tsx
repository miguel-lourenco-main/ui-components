'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Component, LocalComponent, LocalPlaygroundState } from '@/types';
import { discoverLocalComponents } from '@/lib/localComponents';

interface UseLocalComponentStateReturn {
  // State
  components: LocalComponent[];
  playgroundState: LocalPlaygroundState;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadComponents: () => Promise<void>;
  selectComponent: (component: LocalComponent | Component) => void;
  updateProps: (props: Record<string, any>) => void;
  resetToDefaults: () => void;
  
  // UI State Actions
  setViewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  togglePropsPanel: () => void;
  toggleCodePanel: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
}

export function useLocalComponentState(): UseLocalComponentStateReturn {
  const [components, setComponents] = useState<LocalComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [playgroundState, setPlaygroundState] = useState<LocalPlaygroundState>({
    selectedComponent: null,
    currentProps: {},
    currentCode: '',
    viewMode: 'desktop',
    showProps: true,
    showCode: true,
    searchQuery: '',
    selectedCategory: null
  });



  /**
   * Load all local components
   */
  const loadComponents = useCallback(async () => {
    console.log('🚀 Hook: Starting loadComponents...');
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Hook: Calling discoverLocalComponents...');
      const result = await discoverLocalComponents();
      
      console.log('🚀 Hook: Got result:', {
        components: result.components.length,
        errors: result.errors.length
      });
      
      setComponents(result.components);
      
      if (result.errors.length > 0) {
        console.warn('⚠️ Hook: Component discovery errors:', result.errors);
        setError(`Found ${result.errors.length} component errors. Check console for details.`);
      }
      
      console.log('✅ Hook: Components loaded successfully');
    } catch (err) {
      console.error('❌ Hook: Failed to load components:', err);
      setError(err instanceof Error ? err.message : 'Failed to load components');
    } finally {
      console.log('🏁 Hook: Setting loading to false');
      setLoading(false);
    }
  }, []);

  /**
   * Select a component and initialize its state
   */
  const selectComponent = useCallback((component: LocalComponent | Component) => {
    try {
      // Check if it's a LocalComponent
      const isLocalComponent = 'isLocal' in component && component.isLocal;
      
      if (!isLocalComponent) {
        // Handle regular Component - for now, we'll just show an error
        setError('Regular components are not supported in local mode. Please use local components.');
        return;
      }

      const localComponent = component as LocalComponent;

      // Use first example's props if available, otherwise fall back to default props
      let initialProps: Record<string, any> = {};
      
      if (localComponent.examples && localComponent.examples.length > 0) {
        // Create safe props by re-importing the examples to get fresh function references
        const exampleProps = localComponent.examples[0].props;
        
                 // For DataTable, create fresh props to avoid serialization issues
         if (localComponent.name === 'DataTable') {
          
          // Sample data - safe to copy
          const sampleData = [
            { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
            { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
            { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'Manager', status: 'Active' },
            { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'Pending' }
          ];
          
          // Sample columns - safe to copy
          const sampleColumns = [
            { accessorKey: 'name', header: 'Name', id: 'name' },
            { accessorKey: 'email', header: 'Email', id: 'email' },
            { accessorKey: 'role', header: 'Role', id: 'role' },
            { accessorKey: 'status', header: 'Status', id: 'status' }
          ];
          
          // Sample filters - safe to copy
          const sampleFilters = [
            {
              id: 'role',
              options: [
                { label: 'Admin', value: 'Admin' },
                { label: 'Manager', value: 'Manager' },
                { label: 'User', value: 'User' }
              ]
            },
            {
              id: 'status',
              options: [
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' },
                { label: 'Pending', value: 'Pending' }
              ]
            }
          ];
          
          // Fresh function - won't be corrupted by serialization
          const createToolbarButtons = (rowSelection: any, setRowSelection: any, hasSelected: boolean) => {
            return React.createElement('div', { className: 'flex gap-2' }, [
              React.createElement('button', { 
                key: 'add', 
                className: 'px-3 py-1 text-sm border rounded hover:bg-gray-50'
              }, 'Add User'),
              hasSelected && React.createElement('button', { 
                key: 'delete', 
                className: 'px-3 py-1 text-sm border rounded bg-red-600 text-white hover:bg-red-700'
              }, 'Delete Selected')
            ].filter(Boolean));
          };
          
          initialProps = {
            columns: sampleColumns,
            data: sampleData,
            tableLabel: "Users",
            filters: sampleFilters,
            createToolbarButtons: createToolbarButtons
          };
        } else {
          // For other components, do a careful copy avoiding functions
          initialProps = {};
          for (const [key, value] of Object.entries(exampleProps)) {
            if (typeof value !== 'function') {
              // Deep clone non-function values to avoid reference issues
              initialProps[key] = JSON.parse(JSON.stringify(value));
            }
          }
        }
        
        console.log(`🎯 Using safe props for ${localComponent.name}:`, {
          ...initialProps,
          createToolbarButtons: initialProps.createToolbarButtons ? '[Function]' : undefined
        });
      } else {
        // Fall back to default props from metadata
        initialProps = localComponent.props.reduce((acc, prop) => {
          if (prop.defaultValue !== undefined) {
            acc[prop.name] = prop.defaultValue;
          }
          return acc;
        }, {} as Record<string, any>);
        console.log(`📝 Using default props for ${localComponent.name}:`, initialProps);
      }

      setPlaygroundState(prev => ({
        ...prev,
        selectedComponent: localComponent,
        currentProps: initialProps,
        currentCode: localComponent.code
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select component');
    }
  }, []);

  /**
   * Update props
   */
  const updateProps = useCallback((props: Record<string, any>) => {
    if (!playgroundState.selectedComponent) {
      return;
    }

    setPlaygroundState(prev => ({
      ...prev,
      currentProps: props
    }));
  }, [playgroundState.selectedComponent]);





  /**
   * Reset to default props (first example if available)
   */
  const resetToDefaults = useCallback(() => {
    if (!playgroundState.selectedComponent) {
      return;
    }

    let initialProps: Record<string, any> = {};
    
    if (playgroundState.selectedComponent.examples && playgroundState.selectedComponent.examples.length > 0) {
      // Reset to first example's props
      initialProps = { ...playgroundState.selectedComponent.examples[0].props };
    } else {
      // Fall back to metadata defaults
      initialProps = playgroundState.selectedComponent.props.reduce((acc, prop) => {
        if (prop.defaultValue !== undefined) {
          acc[prop.name] = prop.defaultValue;
        }
        return acc;
      }, {} as Record<string, any>);
    }

    updateProps(initialProps);
  }, [playgroundState.selectedComponent, updateProps]);

  /**
   * Set viewport mode
   */
  const setViewMode = useCallback((mode: 'desktop' | 'tablet' | 'mobile') => {
    setPlaygroundState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  /**
   * Toggle props panel visibility
   */
  const togglePropsPanel = useCallback(() => {
    setPlaygroundState(prev => ({ ...prev, showProps: !prev.showProps }));
  }, []);

  /**
   * Toggle code panel visibility
   */
  const toggleCodePanel = useCallback(() => {
    setPlaygroundState(prev => ({ ...prev, showCode: !prev.showCode }));
  }, []);

  /**
   * Set search query
   */
  const setSearchQuery = useCallback((query: string) => {
    setPlaygroundState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  /**
   * Set selected category
   */
  const setSelectedCategory = useCallback((category: string | null) => {
    setPlaygroundState(prev => ({ ...prev, selectedCategory: category }));
  }, []);

  // Load components on mount
  useEffect(() => {
    loadComponents();
  }, [loadComponents]);

  return {
    components,
    playgroundState,
    loading,
    error,
    loadComponents,
    selectComponent,
    updateProps,
    resetToDefaults,
    setViewMode,
    togglePropsPanel,
    toggleCodePanel,
    setSearchQuery,
    setSelectedCategory
  };
} 