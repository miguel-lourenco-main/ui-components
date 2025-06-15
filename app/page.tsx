'use client';

import ComponentSelector from '@/components/ComponentSelector';
import LocalComponentRenderer from '@/components/LocalComponentRenderer';
import CodeViewer from '@/components/CodeViewer';
import PropsPanel from '@/components/PropsPanel';
import ViewportControls from '@/components/ViewportControls';
import CodeButtons from '@/components/CodeButtons';

import { useLocalComponentState } from '@/lib/hooks/useLocalComponentState';
import { PlayIcon, SettingsIcon, XIcon } from 'lucide-react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"

export default function PlaygroundPage() {
  const {
    components,
    playgroundState,
    selectedExampleIndex,
    loading,
    error,
    selectComponent,
    selectExample,
    updateProps,
    setViewMode,
    togglePropsPanel,
    toggleCodePanel,
    setSearchQuery,
    setSelectedCategory,
    loadComponents
  } = useLocalComponentState();

  const togglePanel = (panel: 'props' | 'code') => {
    if (panel === 'props') {
      togglePropsPanel();
    } else {
      toggleCodePanel();
    }
  };

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
          {selectedExampleIndex > -1 && (
            <div 
              key={`header-controls-${playgroundState.selectedComponent?.name}`}
              className="flex items-center space-x-2 slide-in-left"
            >
              <button
                onClick={() => togglePanel('props')}
                className={`p-2 rounded transition-colors duration-200 ${playgroundState.showProps ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                title="Toggle Props Panel"
              >
                <SettingsIcon className="w-5 h-5" />
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
                  <div className="w-full flex items-center justify-between p-4 pb-0">
                    {/* Component Information Section */}
                    <ViewportControls
                      viewMode={playgroundState.viewMode}
                      onViewModeChange={setViewMode}
                    />
                    <CodeButtons
                      component={playgroundState.selectedComponent}
                      showCode={playgroundState.showCode}
                      onToggleCode={() => togglePanel('code')}
                    />
                  </div>
                  <div className="flex-1 p-6">
                    {playgroundState.selectedComponent ? (
                      <LocalComponentRenderer
                        component={playgroundState.selectedComponent}
                        props={playgroundState.currentProps}
                        viewMode={playgroundState.viewMode}
                        onRetry={() => selectComponent(playgroundState.selectedComponent!)}
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
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Code Viewer */}
                <ResizablePanel defaultSize={40} minSize={20} className="bg-white border-t border-gray-200">
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                      <h3 className="font-semibold">Generated Code</h3>
                      <button
                        onClick={() => togglePanel('code')}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
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
              <div className="h-full bg-gray-50 flex flex-col">
                <div className="w-full flex justify-end pt-4 pr-4">
                  {/* Component Information Section */}
                  <CodeButtons
                    component={playgroundState.selectedComponent}
                    showCode={playgroundState.showCode}
                    onToggleCode={() => togglePanel('code')}
                  />
                </div>
                <div className="flex-1 p-6">
                  {playgroundState.selectedComponent ? (
                    <LocalComponentRenderer
                      component={playgroundState.selectedComponent}
                      props={playgroundState.currentProps}
                      viewMode={playgroundState.viewMode}
                      onRetry={() => selectComponent(playgroundState.selectedComponent!)}
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
                <div className="h-full flex flex-col slide-in-right">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                    <h3 className="font-semibold">Props</h3>
                    <button
                      onClick={() => togglePanel('props')}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
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