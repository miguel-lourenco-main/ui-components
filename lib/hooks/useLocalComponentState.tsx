'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Component, LocalComponent, LocalPlaygroundState } from '@/types';
import { discoverLocalComponents } from '@/lib/localComponents';
import { debugLog } from '@/lib/constants';
import { parse } from 'acorn';
import { simple as walkSimple } from 'acorn-walk';
import { 
  isFunctionPropValue, 
  getFunctionSource, 
  convertFunctionPropValuesToFunctions,
  convertFunctionsToFunctionPropValues,
  extractFunctionSource,
  setFunctionSource
} from '@/lib/utils/functionProps';

interface UseLocalComponentStateReturn {
  // State
  components: LocalComponent[];
  playgroundState: LocalPlaygroundState;
  selectedExampleIndex: number;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadComponents: () => Promise<void>;
  selectComponent: (component: LocalComponent, exampleIndex?: number) => void;
  selectExample: (exampleIndex: number) => void;
  updateProps: (props: Record<string, any>) => void;
  resetToDefaults: () => void;
  
  // UI State Actions
  setViewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  togglePropsPanel: () => void;
  toggleCodePanel: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  
  // New handlePropChange action
  handlePropChange: (propName: string, value: any) => void;
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

  // Track which example is currently selected (0 for first example, -1 for none/default)
  const [selectedExampleIndex, setSelectedExampleIndex] = useState<number>(-1);
  
  // Track whether the last props update came from example selection or manual editing
  // Removed isUpdatingFromExample flag - simpler logic preserves example selection

  // Add effect to track state changes
  useEffect(() => {
    debugLog('state', '📊 State changed - selectedExampleIndex:', selectedExampleIndex);
  }, [selectedExampleIndex]);



  useEffect(() => {
    debugLog('state', '📊 State changed - playgroundState.selectedComponent:', playgroundState.selectedComponent?.name);
  }, [playgroundState.selectedComponent]);

  /**
   * Generate component code with current props, including validation warnings
   */
  const generateCodeWithProps = (component: LocalComponent, props: Record<string, any>) => {
    debugLog('props', '🏗️ generateCodeWithProps called for:', component.name);
    
    // Convert FunctionPropValues to actual functions for code generation
    const propsWithFunctions = convertFunctionPropValuesToFunctions(props, component.props);
    
    // Check for missing function props that are required
    const functionPropDefs = component.props.filter(p => p.type === 'function');
    const missingFunctionProps = functionPropDefs.filter(propDef => 
      propDef.required && (!props[propDef.name] || (typeof props[propDef.name] !== 'function' && !isFunctionPropValue(props[propDef.name])))
    );
    const optionalMissingFunctionProps = functionPropDefs.filter(propDef => 
      !propDef.required && (!props[propDef.name] || (typeof props[propDef.name] !== 'function' && !isFunctionPropValue(props[propDef.name])))
    );

    // Generate warnings for missing or invalid functions
    const warnings: string[] = [];
    if (missingFunctionProps.length > 0) {
      warnings.push(`⚠️  Required function props missing: ${missingFunctionProps.map(p => p.name).join(', ')}`);
    }
    if (optionalMissingFunctionProps.length > 0) {
      warnings.push(`ℹ️  Optional function props not defined: ${optionalMissingFunctionProps.map(p => p.name).join(', ')}`);
    }
    
    // Generate JSX usage code with current props
    const propsString = Object.entries(propsWithFunctions)
      .filter(([key, value]) => {
        // Only include props that have actual values
        if (value === undefined || value === null) return false;
        // For functions, only include if they're actually defined and not empty
        if (typeof value === 'function') return true;
        return true;
      })
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `  ${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          return value ? `  ${key}` : '';
        } else if (typeof value === 'function') {
          // For functions, show a more meaningful representation
          const funcName = key || 'handleEvent';
          return `  ${key}={${funcName}}`;
        } else if (Array.isArray(value) || typeof value === 'object') {
          return `  ${key}={${JSON.stringify(value, null, 2).replace(/\n/g, '\n    ')}}`;
        } else {
          return `  ${key}={${value}}`;
        }
      })
      .filter(prop => prop !== '')
      .join('\n');

    // Generate function declarations for any function props
    const functionDeclarations = Object.entries(propsWithFunctions)
      .filter(([key, value]) => typeof value === 'function' && value !== undefined)
      .map(([key, value]) => {
        const funcName = key; // Use the prop name as the function name
        const propDef = component.props.find(p => p.name === key);

        debugLog('props', '🔍 Generating function declarations for:', key);
        
        // Get the function source from the original FunctionPropValue
        const originalPropValue = props[key];
        let functionBody = '';
        
        if (isFunctionPropValue(originalPropValue)) {
          functionBody = originalPropValue.source;
          debugLog('props', `🔍 Using FunctionPropValue source for ${key}:`, functionBody);
        } else {
          debugLog('props', `⚠️ No FunctionPropValue found for ${key}, using fallback`);
        }

        // If we have user-defined function body, use it
        if (functionBody && functionBody.trim()) {
          // Extract function signature from prop description or use default
          let params = '...args';
          const signatureMatch = propDef?.description?.match(/\((.*?)\)\s*=>/);
          
          if (propDef?.functionSignature?.params) {
            params = propDef.functionSignature.params;
          } else if (signatureMatch) {
            params = signatureMatch[1].trim();
          } else {
            // Default parameters for common prop patterns
            const defaultParams: Record<string, string> = {
              'onClick': 'event',
              'onChange': 'value',
              'onSubmit': 'event',
              'onFocus': 'event',
              'onBlur': 'event',
            };
            params = defaultParams[key] || ''; // Default to no params
          }
          
          return `  const ${funcName} = (${params}) => {\n${functionBody.split('\n').map(line => line ? '    ' + line : '').join('\n')}\n  };`;
        }
        
        // Fall back to default function generation if no user body
        if (propDef?.description) {
          // Try to extract signature from description
          const signatureMatch = propDef.description.match(/\((.*?)\)\s*=>\s*(.+)/);
          if (signatureMatch) {
            const [, params, returnType] = signatureMatch;
            return `  const ${funcName} = (${params.trim()}) => {\n    // ${propDef.description}\n    console.log('${key} called:', arguments);\n  };`;
          }
        }
        
        // Ultimate fallback
        return `  const ${funcName} = (...args) => {\n    console.log('${key} called:', args);\n  };`;
      });

    // Generate function stubs for missing required functions
    const missingFunctionStubs = missingFunctionProps.map(propDef => {
      const signature = propDef.description?.match(/\((.*?)\)\s*=>\s*(.+)/);
      const params = signature ? signature[1].trim() : '...args';
      const returnType = signature ? signature[2].trim() : 'void';
      
      const stubName = `handle${propDef.name.charAt(0).toUpperCase() + propDef.name.slice(1)}`;
      
      return `  const ${stubName} = (${params}) => {\n    // TODO: Implement ${propDef.name} handler\n    // Expected return type: ${returnType}\n    console.log('${propDef.name} called with:', ${params});\n  };`;
    });

    const allFunctionDeclarations = [...functionDeclarations, ...missingFunctionStubs];
    const functionDeclarationsCode = allFunctionDeclarations.length > 0 
      ? '\n' + allFunctionDeclarations.join('\n\n') + '\n'
      : '';

    // Generate missing props for the JSX
    const missingPropsString = missingFunctionProps.map(propDef => {
      const stubName = `handle${propDef.name.charAt(0).toUpperCase() + propDef.name.slice(1)}`;
      return `  ${propDef.name}={${stubName}} // ⚠️ Required prop - implement this function`;
    }).join('\n');

    const allPropsString = [propsString, missingPropsString].filter(Boolean).join('\n');

    // Add warnings as comments at the top
    const warningsCode = warnings.length > 0 
      ? `/*\n * VALIDATION WARNINGS:\n * ${warnings.join('\n * ')}\n */\n\n`
      : '';

    const usageCode = `${warningsCode}import { ${component.name} } from './components/${component.name}';

export default function Example() {${functionDeclarationsCode}
  return (
    <${component.name}${allPropsString ? '\n' + allPropsString + '\n    ' : ' '}/>
  );
}`;

    return usageCode;
  };



  /**
   * Load all local components
   */
  const loadComponents = useCallback(async () => {
    debugLog('state', '🚀 Hook: Starting loadComponents...');
    
    try {
      setLoading(true);
      setError(null);
      
      debugLog('state', '🚀 Hook: Calling discoverLocalComponents...');
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Component loading timed out after 10 seconds'));
        }, 10000);
      });
      
      const result = await Promise.race([
        discoverLocalComponents(),
        timeoutPromise
      ]);
      
      debugLog('state', '🚀 Hook: Got result:', {
        components: result.components.length,
        errors: result.errors.length
      });
      
      setComponents(result.components);
      
      if (result.errors.length > 0) {
        console.warn('⚠️ Hook: Component discovery errors:', result.errors);
        setError(`Found ${result.errors.length} component errors. Check console for details.`);
      }
      
      debugLog('state', '✅ Hook: Components loaded successfully');
    } catch (err) {
      console.error('❌ Hook: Failed to load components:', err);
      
      // If it's a timeout, provide more helpful error
      if (err instanceof Error && err.message.includes('timed out')) {
        setError('Component loading timed out. This might be a static export configuration issue. Check browser console for details.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load components');
      }
      
      // Even on error, set an empty array so the UI can render
      setComponents([]);
    } finally {
      debugLog('state', '🏁 Hook: Setting loading to false');
      setLoading(false);
    }
  }, []);

  /**
   * Select a component and initialize its state
   */
  const selectComponent = useCallback((component: LocalComponent | null, exampleIndex: number = 0) => {
    if (!component) {
      setPlaygroundState(prevState => ({
        ...prevState,
        selectedComponent: null,
        currentProps: {},
        currentCode: '',
      }));
      setSelectedExampleIndex(-1);
      return;
    }

    debugLog('state', '🎯 selectComponent called:', {
      componentName: component.name,
      exampleIndex,
    });

    const defaultProps = component.props.reduce((acc, prop) => {
      if (prop.defaultValue !== undefined) {
        acc[prop.name] = prop.defaultValue === "[]" ? [] : prop.defaultValue;
      }
      return acc;
    }, {} as Record<string, any>);

    let initialProps: Record<string, any> = { ...defaultProps };
    let selectedExampleIdx = -1;

    if (component.examples?.length > 0 && exampleIndex >= 0 && component.examples[exampleIndex]) {
      const example = component.examples[exampleIndex];
      debugLog('props', `🔍 Found example "${example.name}" to apply.`, { props: example.props });
      
      const exampleProps = example.props;
      if (exampleProps) {
        for (const key in exampleProps) {
          if (Object.prototype.hasOwnProperty.call(exampleProps, key)) {
            const propDef = component.props.find(p => p.name === key);
            const value = exampleProps[key];

            if (propDef?.type === 'function' && typeof value === 'string') {
              debugLog('props', `  🔄 Converting string to FunctionPropValue for: ${key}`);
              initialProps[key] = setFunctionSource(value, propDef.functionSignature);
            } else {
              initialProps[key] = value;
            }
            debugLog('props', `  ➡️ Copying prop: ${key}`, { value: initialProps[key] });
          }
        }
      }
      selectedExampleIdx = exampleIndex;
    }
    
    debugLog('props', `🎯 Using initial props for ${component.name}:`, { ...initialProps });

    const childrenProp = initialProps.children;
    debugLog('props', '🔍 Children Prop Details:', {
      children: childrenProp,
      isFunctionPropValue: isFunctionPropValue(childrenProp),
      type: typeof childrenProp,
      source: childrenProp ? (childrenProp as any).source : 'N/A'
    });

    setPlaygroundState(prevState => {
      // Avoid unnecessary re-renders if nothing has changed
      if (prevState.selectedComponent?.name === component.name && prevState.currentProps === initialProps) {
        return prevState;
      }
      return {
        ...prevState,
        selectedComponent: component,
        currentProps: initialProps,
        currentCode: generateCodeWithProps(component, initialProps),
      };
    });
    
    setSelectedExampleIndex(selectedExampleIdx);
  }, []);

  /**
   * Select a specific example
   */
  const selectExample = useCallback((exampleIndex: number) => {
    if (playgroundState.selectedComponent) {
      debugLog('state', '🎛️ selectExample called with index:', exampleIndex);
      // Directly call selectComponent, which now safely handles this
      selectComponent(playgroundState.selectedComponent, exampleIndex);
    }
  }, [playgroundState.selectedComponent, selectComponent]);

  /**
   * Update props
   */
  const updateProps = useCallback((newProps: Record<string, any>) => {
    if (!playgroundState.selectedComponent) return;

    // Prevent infinite loops by checking if props actually changed
    const currentProps = playgroundState.currentProps;
    
    // Better comparison that handles FunctionPropValues properly
    const propsChanged = (() => {
      const currentKeys = Object.keys(currentProps).sort();
      const newKeys = Object.keys(newProps).sort();
      
      // Different number of props
      if (currentKeys.length !== newKeys.length) return true;
      
      // Different prop names
      if (JSON.stringify(currentKeys) !== JSON.stringify(newKeys)) return true;
      
      // Check each prop value
      for (const key of currentKeys) {
        const currentValue = currentProps[key];
        const newValue = newProps[key];
        
        // Both are FunctionPropValues - compare by source
        if (isFunctionPropValue(currentValue) && isFunctionPropValue(newValue)) {
          if (currentValue.source !== newValue.source) return true;
        }
        // One is FunctionPropValue, other is not
        else if (isFunctionPropValue(currentValue) || isFunctionPropValue(newValue)) {
          return true;
        }
        // Neither is FunctionPropValue - use JSON comparison
        else if (JSON.stringify(currentValue) !== JSON.stringify(newValue)) {
          return true;
        }
      }
      
      return false;
    })();
    
    if (!propsChanged) {
      debugLog('state', '🔄 updateProps: Props unchanged, skipping update to prevent infinite loop');
      return;
    }
    
    debugLog('state', '🔄 updateProps: Props actually changed, proceeding with update');
    
    // Log function prop changes specifically
    const currentFunctionProps = Object.entries(playgroundState.currentProps).filter(([k, v]) => isFunctionPropValue(v));
    const newFunctionProps = Object.entries(newProps).filter(([k, v]) => isFunctionPropValue(v));
    if (currentFunctionProps.length !== newFunctionProps.length || 
        currentFunctionProps.some(([key, funcProp]) => {
          if (!newProps[key]) return true;
          const currentSource = (funcProp as any).source || '';
          const newSource = isFunctionPropValue(newProps[key]) ? newProps[key].source : '';
          return currentSource !== newSource;
        })) {
      debugLog('props', '🔄 updateProps: Function props changed!', {
        before: currentFunctionProps.map(([k, v]) => `${k}: ${isFunctionPropValue(v) ? v.source.substring(0, 50) + '...' : 'unknown'}`),
        after: newFunctionProps.map(([k, v]) => `${k}: ${isFunctionPropValue(v) ? v.source.substring(0, 50) + '...' : 'unknown'}`)
      });
    }

    // Keep the example selection unless the props have deviated significantly from the selected example
    // The key insight: if you're viewing an example, you should stay on that example
    const shouldKeepExampleSelection = (() => {
      // If no example is selected, nothing to preserve
      if (selectedExampleIndex < 0) return false;
      
      // If no examples exist, can't preserve
      if (!playgroundState.selectedComponent?.examples?.[selectedExampleIndex]) return false;
      
      // Always preserve the example selection - let the user explicitly choose when to go "custom"
      // The example serves as the base context, and clearing functions is just a variation of that example
      return true;
    })();

    if (shouldKeepExampleSelection) {
      debugLog('state', '🔄 updateProps: Keeping selectedExampleIndex (example-based editing)');
    } else {
      debugLog('state', '🔄 updateProps: No example to preserve');
    }

    setPlaygroundState(prev => ({
      ...prev,
      currentProps: newProps,
      currentCode: generateCodeWithProps(prev.selectedComponent!, newProps)
    }));
  }, [playgroundState.selectedComponent, generateCodeWithProps, selectedExampleIndex]);





  /**
   * Reset to default props (currently selected example if available)
   */
  const resetToDefaults = useCallback(() => {
    debugLog('state', '🔄 resetToDefaults called:', {
      componentName: playgroundState.selectedComponent?.name,
      currentSelectedExampleIndex: selectedExampleIndex,
      hasExamples: playgroundState.selectedComponent?.examples?.length || 0
    });
    
    if (!playgroundState.selectedComponent) {
      debugLog('state', '🔄 resetToDefaults: No selected component, returning');
      return;
    }

    // If an example is selected, reset to that example's props
    if (selectedExampleIndex >= 0 && playgroundState.selectedComponent.examples && playgroundState.selectedComponent.examples[selectedExampleIndex]) {
      debugLog('state', '🔄 resetToDefaults: Resetting to currently selected example:', selectedExampleIndex);
      selectExample(selectedExampleIndex);
      return;
    }

    // Otherwise, reset to first example if available
    if (playgroundState.selectedComponent.examples && playgroundState.selectedComponent.examples.length > 0) {
      debugLog('state', '🔄 resetToDefaults: No example selected, resetting to first example (index 0)');
      selectExample(0);
      return;
    }

    // Fall back to metadata defaults
    debugLog('state', '🔄 resetToDefaults: No examples available, using metadata defaults');
    const defaultProps = playgroundState.selectedComponent.props.reduce((acc, prop) => {
      if (prop.defaultValue !== undefined) {
        acc[prop.name] = prop.defaultValue;
      }
      return acc;
    }, {} as Record<string, any>);

    debugLog('state', '🔄 resetToDefaults: Calling updateProps with defaults');
    updateProps(defaultProps);
  }, [playgroundState.selectedComponent, selectedExampleIndex, selectExample, updateProps]);

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

  /**
   * Handle prop changes from interactive components
   */
  const handlePropChange = useCallback((propName: string, value: any) => {
    if (!playgroundState.selectedComponent) {
      debugLog('state', '⚠️ handlePropChange: No selected component');
      return;
    }

    debugLog('state', '🔄 handlePropChange called:', {
      component: playgroundState.selectedComponent.name,
      propName,
      value,
      currentProps: Object.keys(playgroundState.currentProps)
    });

    const newProps = {
      ...playgroundState.currentProps,
      [propName]: value
    };

    // Preserve example selection when user interacts with component
    // This ensures the selected example remains active even when component state changes
    debugLog('state', '🔄 handlePropChange: Maintaining example selection (preserving user context)');

    updateProps(newProps);
  }, [playgroundState.selectedComponent, playgroundState.currentProps, updateProps]);

  // Load components on mount
  useEffect(() => {
    loadComponents();
  }, [loadComponents]);

  return {
    components,
    playgroundState,
    selectedExampleIndex,
    loading,
    error,
    loadComponents,
    selectComponent,
    selectExample,
    updateProps,
    resetToDefaults,
    setViewMode,
    togglePropsPanel,
    toggleCodePanel,
    setSearchQuery,
    setSelectedCategory,
    handlePropChange,
  };
} 