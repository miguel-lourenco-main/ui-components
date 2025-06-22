'use client';

import { useState, useEffect } from 'react';
import ComponentSelector from '@/components/ComponentSelector';
import LocalComponentRenderer from '@/components/LocalComponentRenderer';
import CodeViewer from '@/components/CodeViewer';
import PropsPanel from '@/components/PropsPanel';
import ViewportControls from '@/components/ViewportControls';
import CodeButtons from '@/components/CodeButtons';

import { useLocalComponentState } from '@/lib/hooks/useLocalComponentState';
import { PlayIcon, SettingsIcon, XIcon, EyeOffIcon, EyeIcon } from 'lucide-react';
import { getMonacoPreloadStatus } from '@/lib/monaco-preloader';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { LocalComponent } from '@/types';

// New component for the preview section
interface ComponentPreviewProps {
  selectedComponent: LocalComponent | null;
  currentProps: Record<string, any>;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  selectedExampleIndex: number;
  onRetry: () => void;
  onPropChange: (propName: string, value: any) => void;
  rendererButtons: React.ReactNode;
}

function ComponentPreview({ 
  selectedComponent, 
  currentProps, 
  viewMode, 
  selectedExampleIndex, 
  onRetry, 
  onPropChange,
  rendererButtons 
}: ComponentPreviewProps) {
  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="w-full flex items-center justify-between p-4 pb-0">
        {/* Component Information Section */}
        {rendererButtons}
      </div>
      <div className="flex-1 p-6" data-testid="component-preview">
        {selectedComponent ? (
          <LocalComponentRenderer
            component={selectedComponent}
            props={currentProps}
            viewMode={viewMode}
            onRetry={onRetry}
            onPropChange={onPropChange}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <PlayIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Select a component to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlaygroundPage() {
  const {
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
  } = useLocalComponentState();

  // Track Monaco preload status for debugging (development only)
  const [monacoStatus, setMonacoStatus] = useState(() => getMonacoPreloadStatus());
  
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const interval = setInterval(() => {
      setMonacoStatus(getMonacoPreloadStatus());
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  const rendererButtons = (): React.ReactNode => {
    return playgroundState.selectedComponent ?(
      <>
        <ViewportControls
          viewMode={playgroundState.viewMode}
          onViewModeChange={setViewMode}
        />
        <CodeButtons
          component={playgroundState.selectedComponent}
          showCode={playgroundState.showCode}
          onToggleCode={() => toggleCodePanel()}
        />
        {/* Monaco Preload Status Debug (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
            Monaco: {(() => {
              if (monacoStatus.isPreloaded) return '✅ Ready';
              if (monacoStatus.isLoading) return '⏳ Loading';
              if (monacoStatus.preloadStarted) return '🔄 Starting';
              return '❌ Not Started';
            })()}
          </div>
        )}
      </>
    ) : null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading components...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <button
            onClick={loadComponents}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold flex items-center">
              <PlayIcon className="w-6 h-6 mr-2 text-blue-600" />
              Components Playground
            </h1>
            {playgroundState.selectedComponent && (
              <span className="text-lg font-medium text-gray-700">
                {playgroundState.selectedComponent.name}
              </span>
            )}
          </div>
          {playgroundState.selectedComponent && (
            <div 
              key={`header-controls-${playgroundState.selectedComponent?.name}`}
              className="flex items-center space-x-2 slide-in-left"
            >
              <button
                onClick={() => togglePropsPanel()}
                className={`p-2 rounded transition-colors duration-200 ${playgroundState.showProps ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                title={`${playgroundState.showProps ? 'Hide' : 'Show'} Props Panel`}
              >
                {playgroundState.showProps ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Resizable Layout */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Sidebar - Component Selector */}
          <ResizablePanel 
            defaultSize={playgroundState.showProps ? 25 : 35} 
            minSize={15} 
            className="bg-white border-r border-gray-200"
          >
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800">Components</h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <ComponentSelector
                  components={components}
                  selectedComponent={playgroundState.selectedComponent}
                  onSelect={selectComponent}
                  searchQuery={playgroundState.searchQuery}
                  selectedCategory={playgroundState.selectedCategory}
                  onSearchChange={setSearchQuery}
                  onCategoryChange={setSelectedCategory}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main Content Area */}
          <ResizablePanel 
            defaultSize={playgroundState.showProps ? 50 : 65} 
            minSize={20}
          >
            {playgroundState.showCode && playgroundState.selectedComponent ? (
              <ResizablePanelGroup direction="vertical" className="h-full">
                {/* Component Preview */}
                <ResizablePanel 
                  defaultSize={60} 
                  minSize={30}
                  className="bg-gray-50 flex flex-col"
                >
                  <ComponentPreview
                    selectedComponent={playgroundState.selectedComponent}
                    currentProps={playgroundState.currentProps}
                    viewMode={playgroundState.viewMode}
                    selectedExampleIndex={selectedExampleIndex}
                    onRetry={() => {
                      if (playgroundState.selectedComponent) {
                        selectComponent(playgroundState.selectedComponent, selectedExampleIndex);
                      }
                    }}
                    onPropChange={handlePropChange}
                    rendererButtons={rendererButtons()}
                  />
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Code Viewer */}
                <ResizablePanel defaultSize={40} minSize={20} className="bg-white border-t border-gray-200">
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-start flex-shrink-0">
                      <h3 className="font-semibold">Generated Code</h3>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <CodeViewer
                        value={playgroundState.currentCode}
                        language="typescript"
                        title="Component Code"
                      />
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            ) : (
              /* Component Preview - Full Height when Code Editor is hidden */
              <ComponentPreview
                selectedComponent={playgroundState.selectedComponent}
                currentProps={playgroundState.currentProps}
                viewMode={playgroundState.viewMode}
                selectedExampleIndex={selectedExampleIndex}
                onRetry={() => {
                  if (playgroundState.selectedComponent) {
                    selectComponent(playgroundState.selectedComponent, selectedExampleIndex);
                  }
                }}
                onPropChange={handlePropChange}
                rendererButtons={rendererButtons()}
              />
            )}
          </ResizablePanel>

          {/* Props Panel */}
          {playgroundState.showProps && playgroundState.selectedComponent && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel 
                key={`props-panel-${playgroundState.selectedComponent.name}-${playgroundState.showProps}`}
                defaultSize={25} 
                minSize={15} 
                className="bg-white border-l border-gray-200"
              >
                <div className="h-full flex flex-col slide-in-right" data-testid="props-panel">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-start flex-shrink-0">
                    <h3 className="font-semibold">Props</h3>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <PropsPanel
                      component={playgroundState.selectedComponent}
                      values={playgroundState.currentProps}
                      onChange={updateProps}
                      onSelectExample={selectExample}
                      selectedExampleIndex={selectedExampleIndex}
                    />
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
} 