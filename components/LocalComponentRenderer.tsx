'use client';

import React, { Component as ComponentType, useState, useEffect, Suspense } from 'react';
import { LocalComponent } from '@/types';
import { AlertTriangleIcon, RefreshCwIcon, LoaderIcon } from 'lucide-react';
import { getComponentByName } from '@/lib/componentRegistry';
import { debugLog } from '@/lib/constants';
import { convertFunctionPropValuesToFunctions } from '@/lib/utils/functionProps';

interface LocalComponentRendererProps {
  component: LocalComponent;
  props: Record<string, any>;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  onRetry: () => void;
  onPropChange?: (propName: string, value: any) => void;
}

interface ComponentErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ComponentErrorBoundary extends ComponentType<
  { children: React.ReactNode; onRetry: () => void },
  ComponentErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; onRetry: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border-2 border-dashed border-red-300 rounded-lg p-8">
          <div className="text-center">
            <AlertTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Component Runtime Error
            </h3>
            <p className="text-red-600 mb-4">
              {this.state.error?.message || 'An error occurred while rendering the component'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.onRetry();
              }}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Retry
            </button>
          </div>
          {this.state.error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-red-600">
                Show error details
              </summary>
              <pre className="mt-2 text-xs bg-red-50 p-4 rounded overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default function LocalComponentRenderer({
  component,
  props,
  viewMode,
  onRetry,
  onPropChange,
}: LocalComponentRendererProps) {
  const [ComponentToRender, setComponentToRender] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComponent = () => {
      try {
        setLoading(true);
        setError(null);
        
        debugLog('general', `🔄 Loading component: ${component.name}`);
        
        // Get component from static registry
        const loadedComponent = getComponentByName(component.name);
        
        if (loadedComponent) {
          setComponentToRender(() => loadedComponent);
          debugLog('general', `✅ Component ${component.name} loaded successfully`);
        } else {
          throw new Error(`Component ${component.name} not found in registry`);
        }
      } catch (err) {
        console.error(`❌ Failed to load component ${component.name}:`, err);
        setError(err instanceof Error ? err.message : 'Failed to load component');
      } finally {
        setLoading(false);
      }
    };
    
    loadComponent();
  }, [component.name]); // Only reload when component name changes, not props

  const getViewportStyles = () => {
    switch (viewMode) {
      case 'mobile':
        return { maxWidth: '375px' };
      case 'tablet':
        return { maxWidth: '768px' };
      default:
        return { maxWidth: '100%' };
    }
  };

  const renderContent = () => {
    // Show loading state
    if (loading) {
      return (
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8">
          <div className="text-center">
            <LoaderIcon className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-blue-700 mb-2">
              Loading Component
            </h3>
            <p className="text-blue-600">
              Loading {component.name}...
            </p>
          </div>
        </div>
      );
    }

    // Show import errors
    if (error) {
      return (
        <div className="border-2 border-dashed border-red-300 rounded-lg p-8">
          <div className="text-center">
            <AlertTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Registry Error
            </h3>
            <p className="text-red-600 text-sm font-mono bg-red-50 p-2 rounded mb-4">
              {error}
            </p>
            <button
              onClick={onRetry}
              className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Retry Load
            </button>
          </div>
        </div>
      );
    }

    // Show message if no component loaded
    if (!ComponentToRender) {
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🧩</span>
            </div>
            <h3 className="font-semibold mb-2">{component.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{component.description}</p>
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Load Component
            </button>
          </div>
        </div>
      );
    }

    // Render the actual component
    try {
      // Convert FunctionPropValues to actual functions before passing to component
      const propsWithFunctions = convertFunctionPropValuesToFunctions(props, component.props);
      
      // Inject onChange callbacks for interactive components
      const propsWithCallbacks = injectChangeCallbacks(propsWithFunctions, component, onPropChange);
      
      debugLog('state', `🎬 Rendering ${component.name} with props:`, {
        propKeys: Object.keys(propsWithCallbacks),
        functionProps: Object.entries(propsWithCallbacks)
          .filter(([key, value]) => typeof value === 'function')
          .map(([key, value]) => `${key}: ${value.name || 'function'}`)
      });

      return <ComponentToRender {...propsWithCallbacks} />;
    } catch (renderError) {
      console.error('Component render error:', renderError);
      return (
        <div className="border-2 border-dashed border-red-300 rounded-lg p-8">
          <div className="text-center">
            <AlertTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Render Error
            </h3>
            <p className="text-red-600 mb-4">
              {renderError instanceof Error ? renderError.message : 'Failed to render the component with current props'}
            </p>
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Retry
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      {/* Viewport Frame */}
      <div 
        style={getViewportStyles()}
        className="size-full flex items-center justify-center p-6 bg-white rounded-lg border transition-all duration-300 border-gray-200 overflow-hidden"
      >
        <ComponentErrorBoundary onRetry={onRetry}>
            {renderContent()}
          </ComponentErrorBoundary>
        </div>
    </div>
  );
}

/**
 * Inject onChange callbacks for interactive components to enable bidirectional state flow
 */
function injectChangeCallbacks(
  props: Record<string, any>,
  component: LocalComponent,
  onPropChange?: (propName: string, value: any) => void
): Record<string, any> {
  if (!onPropChange) return props;

  const enhancedProps = { ...props };

  // Define common interactive prop patterns
  const interactivePatterns = [
    {
      // Pattern for controlled inputs (value + onChange)
      valueProp: 'value',
      changeProp: 'onChange',
      extractor: (event: any) => {
        // Handle different event types
        if (event?.target?.value !== undefined) return event.target.value;
        if (event?.target?.checked !== undefined) return event.target.checked;
        return event;
      }
    },
    {
      // Pattern for checked inputs (checked + onCheckedChange) 
      valueProp: 'checked',
      changeProp: 'onCheckedChange',
      extractor: (value: any) => value
    },
    {
      // Pattern for defaultValue inputs (defaultValue + onChange)
      valueProp: 'defaultValue',
      changeProp: 'onChange',
      extractor: (event: any) => {
        if (event?.target?.value !== undefined) return event.target.value;
        return event;
      }
    }
  ];

  // Check each pattern to see if this component uses it
  for (const pattern of interactivePatterns) {
    const hasValueProp = component.props.some(p => p.name === pattern.valueProp);
    const hasChangeProp = component.props.some(p => p.name === pattern.changeProp);

    if (hasValueProp && hasChangeProp) {
      // Only inject if the component expects this pattern
      if (!enhancedProps[pattern.changeProp]) {
        enhancedProps[pattern.changeProp] = (eventOrValue: any) => {
          const newValue = pattern.extractor(eventOrValue);
          debugLog('state', `🔄 Component state change detected:`, {
            component: component.name,
            prop: pattern.valueProp,
            newValue: newValue
          });
          onPropChange(pattern.valueProp, newValue);
        };
      }
    }
  }

  // Special handling for specific component types based on common patterns
  const componentName = component.name.toLowerCase();

  // Slider-specific handling
  if (componentName.includes('slider')) {
    if (!enhancedProps.onValueChange && component.props.some(p => p.name === 'value')) {
      enhancedProps.onValueChange = (value: number[]) => {
        debugLog('state', `🔄 Slider value change:`, value);
        onPropChange('value', value);
      };
    }
  }

  // Switch-specific handling  
  if (componentName.includes('switch')) {
    if (!enhancedProps.onCheckedChange && component.props.some(p => p.name === 'checked')) {
      enhancedProps.onCheckedChange = (checked: boolean) => {
        debugLog('state', `🔄 Switch checked change:`, checked);
        onPropChange('checked', checked);
      };
    }
  }

  // Toggle-specific handling (uses pressed + onPressedChange)
  if (componentName.includes('toggle')) {
    if (!enhancedProps.onPressedChange && component.props.some(p => p.name === 'pressed')) {
      enhancedProps.onPressedChange = (pressed: boolean) => {
        debugLog('state', `🔄 Toggle pressed change:`, pressed);
        onPropChange('pressed', pressed);
      };
    }
  }

  // Progress doesn't need callbacks (read-only)

  debugLog('state', `🔧 Enhanced props for ${component.name}:`, {
    originalProps: Object.keys(props),
    enhancedProps: Object.keys(enhancedProps),
    addedCallbacks: Object.keys(enhancedProps).filter(key => !props.hasOwnProperty(key))
  });

  return enhancedProps;
} 