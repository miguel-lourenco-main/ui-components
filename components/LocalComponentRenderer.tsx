'use client';

import React, { Component as ComponentType, useState, useEffect, Suspense } from 'react';
import { LocalComponent } from '@/types';
import { AlertTriangleIcon, RefreshCwIcon, LoaderIcon } from 'lucide-react';
import { getComponentByName } from '@/lib/componentRegistry';

interface LocalComponentRendererProps {
  component: LocalComponent;
  props: Record<string, any>;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  onRetry: () => void;
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
}: LocalComponentRendererProps) {
  const [ComponentToRender, setComponentToRender] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComponent = () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔄 Loading component: ${component.name}`);
        
        // Get component from static registry
        const loadedComponent = getComponentByName(component.name);
        
        if (loadedComponent) {
          setComponentToRender(() => loadedComponent);
          console.log(`✅ Component ${component.name} loaded successfully`);
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
  }, [component.name, props]);

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
      return <ComponentToRender {...props} />;
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
    <div className="h-full flex flex-col">
      {/* Viewport Frame */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="h-full flex items-center justify-center p-6">
          <div 
            style={getViewportStyles()}
            className="w-fit transition-all duration-300"
          >
            <ComponentErrorBoundary onRetry={onRetry}>
              {renderContent()}
            </ComponentErrorBoundary>
          </div>
        </div>
      </div>

      {/* Component Info */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">Component Info</h4>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              Viewport: {viewMode}
            </span>
            {loading && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Loading...
              </span>
            )}
            {error && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                Error
              </span>
            )}
            {ComponentToRender && !loading && !error && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Loaded
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Category:</span>
            <span className="ml-2 capitalize">{component.category}</span>
          </div>
          <div>
            <span className="text-gray-600">Props:</span>
            <span className="ml-2">{component.props.length}</span>
          </div>
          {component.version && (
            <div>
              <span className="text-gray-600">Version:</span>
              <span className="ml-2">v{component.version}</span>
            </div>
          )}
          <div>
            <span className="text-gray-600">Type:</span>
            <span className="ml-2 text-blue-600">Local</span>
          </div>
        </div>

        
      </div>
    </div>
  );
} 