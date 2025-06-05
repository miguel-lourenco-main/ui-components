'use client';

import { Component as ComponentType } from 'react';
import { Component, LocalComponent } from '@/types';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';

interface ComponentRendererProps {
  component: Component | LocalComponent;
  props: Record<string, any>;
  code: string;
  viewMode: 'desktop' | 'tablet' | 'mobile';
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
              Component Error
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

export default function ComponentRenderer({
  component,
  props,
  code,
  viewMode,
}: ComponentRendererProps) {
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

  const handleRetry = () => {
    // Force re-render by updating a key
    window.location.reload();
  };

  // Dynamic component rendering would need to be implemented based on your component loading strategy
  // For now, we'll show a placeholder that demonstrates the structure
  const renderDynamicComponent = () => {
    try {
      // This is where you would implement the dynamic component compilation
      // For example, using babel-standalone or similar
      
      // Placeholder implementation
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="text-center text-gray-600">
            <div className="bg-blue-100 w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🧩</span>
            </div>
            <h3 className="font-semibold mb-2">{component.name}</h3>
            <p className="text-sm mb-4">{component.description}</p>
            <div className="text-xs bg-gray-100 rounded p-3">
              <p className="font-medium mb-2">Current Props:</p>
              <pre>{JSON.stringify(props, null, 2)}</pre>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      throw new Error(`Failed to render component: ${error}`);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Viewport Frame */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="h-full flex items-center justify-center p-6">
          <div 
            style={getViewportStyles()}
            className="w-full transition-all duration-300"
          >
            <ComponentErrorBoundary onRetry={handleRetry}>
              {renderDynamicComponent()}
            </ComponentErrorBoundary>
          </div>
        </div>
      </div>

      {/* Component Info */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">Component Info</h4>
          <span className="text-xs text-gray-500">
            Viewport: {viewMode}
          </span>
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
          {component.author && (
            <div>
              <span className="text-gray-600">Author:</span>
              <span className="ml-2">{component.author}</span>
            </div>
          )}
        </div>

        {component.examples && component.examples.length > 0 && (
          <div className="mt-3">
            <span className="text-sm text-gray-600">Examples:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {component.examples.map((example, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                >
                  {example.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 