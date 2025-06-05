'use client';

import { useState, useCallback, useEffect } from 'react';
import { Component, LocalComponent, LocalPlaygroundState, ComponentCompilationResult } from '@/types';
import { discoverLocalComponents } from '@/lib/localComponents';
import { compileComponent } from '../_utils/componentCompiler';

import { generateCodeFromProps } from '../_utils/codeGenerator';

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
    compiledComponent: null,
    currentProps: {},
    currentCode: '',
    viewMode: 'desktop',
    showProps: true,
    showCode: true,
    searchQuery: '',
    selectedCategory: null,
    compileErrors: [],
    isCompiling: false
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
  const selectComponent = useCallback(async (component: LocalComponent | Component) => {
    try {
      // Check if it's a LocalComponent
      const isLocalComponent = 'isLocal' in component && component.isLocal;
      
      if (!isLocalComponent) {
        // Handle regular Component - for now, we'll just show an error
        setError('Regular components are not supported in local mode. Please use local components.');
        return;
      }

      const localComponent = component as LocalComponent;

      // Initialize default props from component metadata
      const defaultProps = localComponent.props.reduce((acc, prop) => {
        if (prop.defaultValue !== undefined) {
          acc[prop.name] = prop.defaultValue;
        }
        return acc;
      }, {} as Record<string, any>);

      // Compile the component
      setPlaygroundState(prev => ({ ...prev, isCompiling: true }));
      const compilationResult = await compileComponent(localComponent.code);

      setPlaygroundState(prev => ({
        ...prev,
        selectedComponent: localComponent,
        currentProps: defaultProps,
        currentCode: localComponent.code,
        compiledComponent: compilationResult.success ? compilationResult.component || null : null,
        compileErrors: compilationResult.success ? [] : [compilationResult.error || 'Compilation failed'],
        isCompiling: false
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select component');
      setPlaygroundState(prev => ({ 
        ...prev, 
        isCompiling: false,
        compileErrors: [err instanceof Error ? err.message : 'Unknown error']
      }));
    }
  }, []);

  /**
   * Update props and sync with code
   */
  const updateProps = useCallback(async (props: Record<string, any>) => {
    if (!playgroundState.selectedComponent) {
      return;
    }

    try {
      // Generate new code based on props
      const newCode = generateCodeFromProps(
        playgroundState.selectedComponent,
        props,
        playgroundState.currentCode
      );

      // Recompile component with new code
      setPlaygroundState(prev => ({ ...prev, isCompiling: true }));
      const compilationResult = await compileComponent(newCode);

      setPlaygroundState(prev => ({
        ...prev,
        currentProps: props,
        currentCode: newCode,
        compiledComponent: compilationResult.success ? compilationResult.component || null : null,
        compileErrors: compilationResult.success ? [] : [compilationResult.error || 'Compilation failed'],
        isCompiling: false
      }));
    } catch (err) {
      console.error('Failed to update props:', err);
      setPlaygroundState(prev => ({
        ...prev,
        compileErrors: [err instanceof Error ? err.message : 'Failed to update props'],
        isCompiling: false
      }));
    }
  }, [playgroundState.selectedComponent, playgroundState.currentCode]);





  /**
   * Reset to default props
   */
  const resetToDefaults = useCallback(() => {
    if (!playgroundState.selectedComponent) {
      return;
    }

    const defaultProps = playgroundState.selectedComponent.props.reduce((acc, prop) => {
      if (prop.defaultValue !== undefined) {
        acc[prop.name] = prop.defaultValue;
      }
      return acc;
    }, {} as Record<string, any>);

    updateProps(defaultProps);
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