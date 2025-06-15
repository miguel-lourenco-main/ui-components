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
  selectComponent: (component: LocalComponent | Component) => void;
  selectExample: (exampleIndex: number) => void;
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

  // Track which example is currently selected (0 for first example, -1 for none/default)
  const [selectedExampleIndex, setSelectedExampleIndex] = useState<number>(-1);
  
  // Track whether the last props update came from example selection or manual editing
  // Removed isUpdatingFromExample flag - simpler logic preserves example selection

  // Add effect to track state changes
  useEffect(() => {
    debugLog('COMPONENT_STATE', '📊 State changed - selectedExampleIndex:', selectedExampleIndex);
  }, [selectedExampleIndex]);



  useEffect(() => {
    debugLog('COMPONENT_STATE', '📊 State changed - playgroundState.selectedComponent:', playgroundState.selectedComponent?.name);
  }, [playgroundState.selectedComponent]);

  /**
   * Generate component code with current props, including validation warnings
   */
  const generateCodeWithProps = (component: LocalComponent, props: Record<string, any>) => {
    debugLog('COMPONENT_PROPS', '🏗️ generateCodeWithProps called for:', component.name);
    
    // Convert FunctionPropValues to actual functions for code generation
    const propsWithFunctions = convertFunctionPropValuesToFunctions(props, component.props);
    
    // Filter out function props for the main props display
    const functionProps = Object.entries(propsWithFunctions).filter(([key, value]) => typeof value === 'function');
    
    // Check for missing function props that are required
    const functionPropDefs = component.props.filter(p => p.type === 'function');
    const missingFunctionProps = functionPropDefs.filter(propDef => 
      propDef.required && (!props[propDef.name] || typeof props[propDef.name] !== 'function')
    );
    const optionalMissingFunctionProps = functionPropDefs.filter(propDef => 
      !propDef.required && (!props[propDef.name] || typeof props[propDef.name] !== 'function')
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

        debugLog('COMPONENT_PROPS', '🔍 Generating function declarations for:', key);
        
        // Get the function source from the original FunctionPropValue
        const originalPropValue = props[key];
        let functionBody = '';
        
        if (isFunctionPropValue(originalPropValue)) {
          functionBody = originalPropValue.source;
          debugLog('COMPONENT_PROPS', `🔍 Using FunctionPropValue source for ${key}:`, functionBody);
        } else {
          debugLog('COMPONENT_PROPS', `⚠️ No FunctionPropValue found for ${key}, using fallback`);
        }

        // If we have user-defined function body, use it
        if (functionBody && functionBody.trim()) {
          // Extract function signature from prop description or use default
          let params = '...args';
          const signatureMatch = propDef?.description?.match(/\((.*?)\)\s*=>/);
          
          if (signatureMatch) {
            params = signatureMatch[1].trim();
          } else {
            // Default parameters for common prop patterns
            const defaultParams: Record<string, string> = {
              'onClick': 'event',
              'onChange': 'value',
              'onSubmit': 'event',
              'onFocus': 'event',
              'onBlur': 'event',
              'createToolbarButtons': 'rowSelection, setRowSelection, hasSelected',
            };
            params = defaultParams[key] || '...args';
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
      const params = signature ? signature[1].trim() : '...3';
      const returnType = signature ? signature[2].trim() : 'void';
      
      const defaultHandlers: Record<string, string> = {
        'onClick': `  const handle${propDef.name.charAt(2).toUpperCase() + propDef.name.slice(3)} = (event) => {\n    // TODO: Implement click handler\n    console.log('${propDef.name} called:', event);\n  };`,
        'onChange': `  const handle${propDef.name.charAt(2).toUpperCase() + propDef.name.slice(3)} = (value) => {\n    // TODO: Implement change handler\n    console.log('${propDef.name} called:', value);\n  };`,
        'onSubmit': `  const handle${propDef.name.charAt(2).toUpperCase() + propDef.name.slice(3)} = (event) => {\n    // TODO: Implement submit handler\n    event.preventDefault();\n    console.log('${propDef.name} called:', event);\n  };`,
      };
      
      const stubName = `handle${propDef.name.charAt(2).toUpperCase() + propDef.name.slice(3)}`;
      return defaultHandlers[propDef.name] || `  const ${stubName} = (${params}) => {\n    // TODO: Implement ${propDef.name} handler\n    // Expected return type: ${returnType}\n    console.log('${propDef.name} called:', arguments);\n  };`;
    });

    const allFunctionDeclarations = [...functionDeclarations, ...missingFunctionStubs];
    const functionDeclarationsCode = allFunctionDeclarations.length > 0 
      ? '\n' + allFunctionDeclarations.join('\n\n') + '\n'
      : '';

    // Generate missing props for the JSX
    const missingPropsString = missingFunctionProps.map(propDef => {
      const stubName = `handle${propDef.name.charAt(2).toUpperCase() + propDef.name.slice(3)}`;
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
    debugLog('COMPONENT_STATE', '🚀 Hook: Starting loadComponents...');
    
    try {
      setLoading(true);
      setError(null);
      
      debugLog('COMPONENT_STATE', '🚀 Hook: Calling discoverLocalComponents...');
      const result = await discoverLocalComponents();
      
      debugLog('COMPONENT_STATE', '🚀 Hook: Got result:', {
        components: result.components.length,
        errors: result.errors.length
      });
      
      setComponents(result.components);
      
      if (result.errors.length > 0) {
        console.warn('⚠️ Hook: Component discovery errors:', result.errors);
        setError(`Found ${result.errors.length} component errors. Check console for details.`);
      }
      
      debugLog('COMPONENT_STATE', '✅ Hook: Components loaded successfully');
    } catch (err) {
      console.error('❌ Hook: Failed to load components:', err);
      setError(err instanceof Error ? err.message : 'Failed to load components');
    } finally {
      debugLog('COMPONENT_STATE', '🏁 Hook: Setting loading to false');
      setLoading(false);
    }
  }, []);

  /**
   * Select a component and initialize its state
   */
  const selectComponent = useCallback((component: LocalComponent | Component) => {
    debugLog('COMPONENT_STATE', '🎯 selectComponent called:', {
      componentName: component.name,
      currentSelectedExampleIndex: selectedExampleIndex
    });
    
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
        
                 // Handle components that need special prop handling
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
          
          // Create function as FunctionPropValue
          const createToolbarButtonsSource = `return (
  <div className="flex gap-2">
    <button 
      key="add"
      className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
    >
      Add User
    </button>
    {hasSelected && (
      <button 
        key="delete"
        className="px-3 py-1 text-sm border rounded bg-red-600 text-white hover:bg-red-700"
      >
        Delete Selected
      </button>
    )}
  </div>
);`;
          
          initialProps = {
            columns: sampleColumns,
            data: sampleData,
            tableLabel: "Users",
            filters: sampleFilters,
            createToolbarButtons: setFunctionSource(createToolbarButtonsSource, {
              params: 'rowSelection, setRowSelection, hasSelected',
              returnType: 'JSX.Element'
            })
          };
         } else {
          // For other components, copy all props converting functions to FunctionPropValues
          initialProps = {};
          for (const [key, value] of Object.entries(exampleProps)) {
            if (typeof value !== 'function') {
              // Deep clone non-function values to avoid reference issues
              initialProps[key] = JSON.parse(JSON.stringify(value));
            } else {
              // Convert function to FunctionPropValue
              const functionSource = extractFunctionSource(value);
              initialProps[key] = setFunctionSource(functionSource);
            }
          }
        }
        
        debugLog('COMPONENT_PROPS', `🎯 Using safe props for ${localComponent.name}:`, {
          ...initialProps,
          createToolbarButtons: initialProps.createToolbarButtons ? '[Function]' : undefined
        });
        
        // Log function props specifically
        const functionProps = Object.entries(initialProps).filter(([key, value]) => isFunctionPropValue(value));
        if (functionProps.length > 0) {
          debugLog('COMPONENT_PROPS', `🎯 Function props for ${localComponent.name}:`, functionProps.map(([key, value]) => `${key}: ${isFunctionPropValue(value) ? value.source.substring(0, 30) + '...' : 'unknown'}`));
          debugLog('COMPONENT_PROPS', `🎯 These functions WILL be applied to the component and appear in generated code`);
        } else {
          debugLog('COMPONENT_PROPS', `🎯 No function props found for ${localComponent.name} - checking metadata for defaults...`);
          const functionPropDefs = localComponent.props.filter(prop => prop.type === 'function');
          functionPropDefs.forEach(prop => {
            debugLog('COMPONENT_PROPS', `🎯 Function prop "${prop.name}" - defaultValue:`, prop.defaultValue !== undefined ? 'HAS DEFAULT' : 'NO DEFAULT');
          });
        }
      } else {
        // Fall back to default props from metadata
        initialProps = localComponent.props.reduce((acc, prop) => {
          if (prop.defaultValue !== undefined) {
            acc[prop.name] = prop.defaultValue;
          }
          return acc;
        }, {} as Record<string, any>);
        debugLog('COMPONENT_PROPS', `📝 Using default props for ${localComponent.name}:`, initialProps);
        
        // Log function props specifically
        const functionProps = Object.entries(initialProps).filter(([key, value]) => isFunctionPropValue(value));
        if (functionProps.length > 0) {
          debugLog('COMPONENT_PROPS', `📝 Function props from metadata for ${localComponent.name}:`, functionProps.map(([key, value]) => `${key}: ${isFunctionPropValue(value) ? value.source.substring(0, 30) + '...' : 'unknown'}`));
          debugLog('COMPONENT_PROPS', `📝 These functions WILL be applied to the component and appear in generated code`);
        } else {
          debugLog('COMPONENT_PROPS', `📝 No function props with defaultValues found for ${localComponent.name}`);
          const functionPropDefs = localComponent.props.filter(prop => prop.type === 'function');
          functionPropDefs.forEach(prop => {
            debugLog('COMPONENT_PROPS', `📝 Function prop "${prop.name}" - will be EMPTY and NOT appear in generated code`);
          });
        }
      }

      setPlaygroundState(prev => ({
        ...prev,
        selectedComponent: localComponent,
        currentProps: initialProps,
        currentCode: generateCodeWithProps(localComponent, initialProps)
      }));

      // Set the selected example index (0 for first example if available, -1 for default)
      const exampleIndex = localComponent.examples && localComponent.examples.length > 0 ? 0 : -1;
      debugLog('COMPONENT_STATE', '🎯 selectComponent setting example index:', {
        componentName: localComponent.name,
        exampleIndex,
        hasExamples: localComponent.examples?.length || 0
      });
      setSelectedExampleIndex(exampleIndex);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select component');
    }
  }, []);

  /**
   * Select a specific example
   */
  const selectExample = useCallback((exampleIndex: number) => {
    debugLog('COMPONENT_STATE', '📋 selectExample called:', {
      exampleIndex,
      currentSelectedExampleIndex: selectedExampleIndex,
      componentName: playgroundState.selectedComponent?.name,
      hasExamples: playgroundState.selectedComponent?.examples?.length || 0
    });
    
    if (!playgroundState.selectedComponent || !playgroundState.selectedComponent.examples) {
      debugLog('COMPONENT_STATE', '📋 selectExample: No component or examples available');
      return;
    }

    const example = playgroundState.selectedComponent.examples[exampleIndex];
    if (!example) {
      debugLog('COMPONENT_STATE', '📋 selectExample: Example not found at index', exampleIndex);
      return;
    }
    
    debugLog('COMPONENT_STATE', '📋 selectExample: Found example:', {
      exampleName: example.name,
      exampleProps: Object.keys(example.props)
    });

    let safeProps: Record<string, any> = {};
    
    // Handle components that need special prop handling (like DataTable)
    if (playgroundState.selectedComponent.name === 'DataTable') {
      // Use the same safe props handling as in selectComponent
      const sampleData = [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
        { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'Manager', status: 'Active' },
        { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'Pending' }
      ];
      
      const sampleColumns = [
        { accessorKey: 'name', header: 'Name', id: 'name' },
        { accessorKey: 'email', header: 'Email', id: 'email' },
        { accessorKey: 'role', header: 'Role', id: 'role' },
        { accessorKey: 'status', header: 'Status', id: 'status' }
      ];
      
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
      
      const createToolbarButtonsSource = `return (
  <div className="flex gap-2">
    <button 
      key="add"
      className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
    >
      Add User
    </button>
    {hasSelected && (
      <button 
        key="delete"
        className="px-3 py-1 text-sm border rounded bg-red-600 text-white hover:bg-red-700"
      >
        Delete Selected
      </button>
    )}
  </div>
);`;
      
      safeProps = {
        columns: sampleColumns,
        data: sampleData,
        tableLabel: "Users",
        filters: sampleFilters,
        createToolbarButtons: setFunctionSource(createToolbarButtonsSource, {
          params: 'rowSelection, setRowSelection, hasSelected',
          returnType: 'JSX.Element'
        })
      };
    } else {
       // For other components, copy all props converting functions to FunctionPropValues
       for (const [key, value] of Object.entries(example.props)) {
         if (typeof value !== 'function') {
           safeProps[key] = JSON.parse(JSON.stringify(value));
         } else {
           // Convert function to FunctionPropValue
           const functionSource = extractFunctionSource(value);
           safeProps[key] = setFunctionSource(functionSource);
         }
       }
     }

    debugLog('COMPONENT_STATE', '📋 selectExample: Setting state:', {
      exampleIndex,
      safePropsKeys: Object.keys(safeProps)
    });
    
    setSelectedExampleIndex(exampleIndex);
    setPlaygroundState(prev => ({
      ...prev,
      currentProps: safeProps,
      currentCode: generateCodeWithProps(prev.selectedComponent!, safeProps)
    }));
  }, [playgroundState.selectedComponent, generateCodeWithProps]);

  /**
   * Update props
   */
  const updateProps = useCallback((props: Record<string, any>) => {
    debugLog('COMPONENT_STATE', '🔄 updateProps called:', {
      currentSelectedExampleIndex: selectedExampleIndex,
      componentName: playgroundState.selectedComponent?.name,
      propsKeys: Object.keys(props),
      functionProps: Object.entries(props)
        .filter(([key, value]) => typeof value === 'function')
        .map(([key, value]) => `${key}: ${value.name || 'anonymous'}`)
    });
    
    if (!playgroundState.selectedComponent) {
      debugLog('COMPONENT_STATE', '🔄 updateProps: No selected component, returning');
      return;
    }

    // Prevent infinite loops by checking if props actually changed
    const currentProps = playgroundState.currentProps;
    
    // Better comparison that handles FunctionPropValues properly
    const propsChanged = (() => {
      const currentKeys = Object.keys(currentProps).sort();
      const newKeys = Object.keys(props).sort();
      
      // Different number of props
      if (currentKeys.length !== newKeys.length) return true;
      
      // Different prop names
      if (JSON.stringify(currentKeys) !== JSON.stringify(newKeys)) return true;
      
      // Check each prop value
      for (const key of currentKeys) {
        const currentValue = currentProps[key];
        const newValue = props[key];
        
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
      debugLog('COMPONENT_STATE', '🔄 updateProps: Props unchanged, skipping update to prevent infinite loop');
      return;
    }
    
    debugLog('COMPONENT_STATE', '🔄 updateProps: Props actually changed, proceeding with update');
    
    // Log function prop changes specifically
    const currentFunctionProps = Object.entries(playgroundState.currentProps).filter(([k, v]) => isFunctionPropValue(v));
    const newFunctionProps = Object.entries(props).filter(([k, v]) => isFunctionPropValue(v));
    if (currentFunctionProps.length !== newFunctionProps.length || 
        currentFunctionProps.some(([key, funcProp]) => {
          if (!props[key]) return true;
          const currentSource = (funcProp as any).source || '';
          const newSource = isFunctionPropValue(props[key]) ? props[key].source : '';
          return currentSource !== newSource;
        })) {
      debugLog('COMPONENT_PROPS', '🔄 updateProps: Function props changed!', {
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
      debugLog('COMPONENT_STATE', '🔄 updateProps: Keeping selectedExampleIndex (example-based editing)');
    } else {
      debugLog('COMPONENT_STATE', '🔄 updateProps: No example to preserve');
    }

    setPlaygroundState(prev => ({
      ...prev,
      currentProps: props,
      currentCode: generateCodeWithProps(prev.selectedComponent!, props)
    }));
  }, [playgroundState.selectedComponent, generateCodeWithProps, selectedExampleIndex]);





  /**
   * Reset to default props (currently selected example if available)
   */
  const resetToDefaults = useCallback(() => {
    debugLog('COMPONENT_STATE', '🔄 resetToDefaults called:', {
      componentName: playgroundState.selectedComponent?.name,
      currentSelectedExampleIndex: selectedExampleIndex,
      hasExamples: playgroundState.selectedComponent?.examples?.length || 0
    });
    
    if (!playgroundState.selectedComponent) {
      debugLog('COMPONENT_STATE', '🔄 resetToDefaults: No selected component, returning');
      return;
    }

    // If an example is selected, reset to that example's props
    if (selectedExampleIndex >= 0 && playgroundState.selectedComponent.examples && playgroundState.selectedComponent.examples[selectedExampleIndex]) {
      debugLog('COMPONENT_STATE', '🔄 resetToDefaults: Resetting to currently selected example:', selectedExampleIndex);
      selectExample(selectedExampleIndex);
      return;
    }

    // Otherwise, reset to first example if available
    if (playgroundState.selectedComponent.examples && playgroundState.selectedComponent.examples.length > 0) {
      debugLog('COMPONENT_STATE', '🔄 resetToDefaults: No example selected, resetting to first example (index 0)');
      selectExample(0);
      return;
    }

    // Fall back to metadata defaults
    debugLog('COMPONENT_STATE', '🔄 resetToDefaults: No examples available, using metadata defaults');
    const defaultProps = playgroundState.selectedComponent.props.reduce((acc, prop) => {
      if (prop.defaultValue !== undefined) {
        acc[prop.name] = prop.defaultValue;
      }
      return acc;
    }, {} as Record<string, any>);

    debugLog('COMPONENT_STATE', '🔄 resetToDefaults: Calling updateProps with defaults');
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
    setSelectedCategory
  };
} 