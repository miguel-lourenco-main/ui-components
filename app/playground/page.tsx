'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import ComponentSelector from '@/components/ComponentSelector';
import LocalComponentRenderer from '@/components/LocalComponentRenderer';
import CodeViewer from '@/components/code-viewer';
import PropsPanel from '@/components/PropsPanel';
import ViewportControls from '@/components/ViewportControls';
import CodeButtons from '@/components/code-buttons';

import { useLocalComponentState } from '@/lib/hooks/useLocalComponentState';
import { PlayIcon, EyeOffIcon, EyeIcon, Play, CodeIcon } from 'lucide-react';
import { getMonacoPreloadStatus } from '@/lib/monaco-preloader';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { ImperativePanelHandle } from 'react-resizable-panels'
import { FullComponentInfo } from '@/lib/interfaces';
import { Button } from '@/components/ui/button';
import { BASE_REPO_URL } from '@/lib/constants';
import { GitLabIconSingle } from '@/lib/icons';
// Header removed in favor of global site header

interface ComponentPreviewProps {
  selectedComponent: FullComponentInfo | null;
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
    <div className="h-full bg-muted flex flex-col">
      <div className="w-full flex items-center justify-between p-4 pb-0">
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
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <PlayIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
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
    handlePropChange,
  } = useLocalComponentState();

  const propsPanelRef = useRef<ImperativePanelHandle | null>(null);
  const propsOpen = playgroundState.showProps;
  const propsLastSizeRef = useRef<number>(25);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (!components || components.length === 0) return;
    const componentParam = searchParams.get('component');
    const exampleParam = searchParams.get('example');
    if (!componentParam) return;
    const target = components.find(c =>
      c.id.toLowerCase() === componentParam.toLowerCase() ||
      c.name.toLowerCase() === componentParam.toLowerCase()
    );
    if (!target) return;
    const exIdx = exampleParam ? Math.max(0, parseInt(exampleParam, 10) || 0) : 0;
    // Avoid redundant reselection that can cause remounts/state resets
    if (playgroundState.selectedComponent?.id === target.id && selectedExampleIndex === exIdx) return;
    selectComponent(target, exIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [components, searchParams]);

  // Keep the resizable panel in sync with the single source of truth
  useEffect(() => {
    const ref = propsPanelRef.current;
    if (!ref) return;
    if (propsOpen) {
      const currentSize = ref.getSize?.() ?? 0;
      if (currentSize === 0) {
        // Expand from collapsed state to last remembered size
        ref.resize?.(propsLastSizeRef.current || 25);
      } else {
        ref.expand?.();
      }
    } else {
      const currentSize = ref.getSize?.();
      if (typeof currentSize === 'number' && currentSize > 0) {
        propsLastSizeRef.current = currentSize;
      }
      ref.collapse?.();
    }
  }, [propsOpen]);

  const [monacoStatus, setMonacoStatus] = useState(() => getMonacoPreloadStatus());
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const shallowEqual = (a: any, b: any) => {
      if (a === b) return true;
      if (!a || !b) return false;
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length) return false;
      for (const key of aKeys) {
        if (a[key] !== b[key]) return false;
      }
      return true;
    };
    const interval = setInterval(() => {
      const next = getMonacoPreloadStatus();
      setMonacoStatus(prev => (shallowEqual(prev, next) ? prev : next));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const rendererButtons = (): React.ReactNode => {
    return playgroundState.selectedComponent ?(
      <ViewportControls
        viewMode={playgroundState.viewMode}
        onViewModeChange={setViewMode}
      />
    ) : null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading components...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <button
            onClick={loadComponents}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center size-full">
      <div className="flex flex-col items-center justify-center gap-3 my-8 mb-4">
        <div className="flex w-fit items-center space-x-2">
          <Play className="size-6" />
          <h1 className="text-4xl font-bold">Playground</h1>
        </div>
        <p className="text-muted-foreground">Play with components and see how they work</p>
      </div>
      <div className="relative min-h-[calc(100vh-14rem)] max-w-[calc(100vw-4rem)] flex flex-col bg-background justify-center">
        <div className="absolute -top-12 right-0 flex w-full flex-row items-center justify-end my-1">
          <div className={`${playgroundState.selectedComponent ? 'flex' : 'hidden'}`}>
            <Button
              onClick={toggleCodePanel}
              variant="ghost"
              className="p-2 m-1 border size-fit rounded-lg transition-colors duration-200 text-muted-foreground"
              title={playgroundState.showCode ? 'Hide Code' : 'Show Code'}
            >
              <CodeIcon className="size-5" />
            </Button>
          </div>
          <Button
            onClick={togglePropsPanel}
            variant="ghost"
            className={`p-2 m-1 border size-fit rounded-lg transition-colors duration-200 text-muted-foreground`}
            title={`Expand Props Panel`}
            size={'lg'}
          >
            {playgroundState.showProps ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
          </Button>
        </div>
        <div className="overflow-hidden rounded-lg border-4 border-border bg-card">
          <ResizablePanelGroup direction="horizontal" className="">
            <ResizablePanel defaultSize={playgroundState.showProps ? 25 : 35} minSize={15} className="bg-card border-r border-border">
              <div className="h-[calc(100vh-16rem)] overflow-hidden">
                <ComponentSelector
                  components={components}
                  selectedComponent={playgroundState.selectedComponent}
                  onSelect={selectComponent}
                  searchQuery={playgroundState.searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={playgroundState.showProps ? 50 : 65} minSize={20}>
              {playgroundState.showCode && playgroundState.selectedComponent ? (
                <ResizablePanelGroup direction="vertical" className="h-full">
                  <ResizablePanel defaultSize={60} minSize={30} className="bg-muted flex flex-col">
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

                  <ResizablePanel defaultSize={40} minSize={20} className="bg-card border-t border-border">
                    <div className="h-full flex flex-col">
                      <CodeViewer value={playgroundState.currentCode} language="typescript" title="Component Code" />
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              ) : (
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

            {playgroundState.selectedComponent && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel
                  ref={propsPanelRef}
                  defaultSize={propsOpen ? (propsLastSizeRef.current || 25) : 0}
                  minSize={0}
                  collapsible
                  collapsedSize={0}
                  className="bg-card border-l border-border"
                >
                  <div className="h-full flex flex-col" data-testid="props-panel">
                    <PropsPanel
                      component={playgroundState.selectedComponent}
                      values={playgroundState.currentProps}
                      onChange={updateProps}
                      onSelectExample={selectExample}
                      selectedExampleIndex={selectedExampleIndex}
                    />
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
}




