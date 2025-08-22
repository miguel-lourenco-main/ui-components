'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useSearchParams } from 'next/navigation';
import ComponentSelector from '@/components/ComponentSelector';
import LocalComponentRenderer from '@/components/LocalComponentRenderer';
import CodeViewer from '@/components/code-viewer';
import PropsPanel from '@/components/PropsPanel';
import ViewportControls from '@/components/ViewportControls';
import CodeButtons from '@/components/code-buttons';

import { useLocalComponentState } from '@/lib/hooks/useLocalComponentState';
import { PlayIcon, EyeOffIcon, EyeIcon, ArrowLeft, Sun, Moon } from 'lucide-react';
import { getMonacoPreloadStatus } from '@/lib/monaco-preloader';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { FullComponentInfo } from '@/lib/interfaces';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

  const { setTheme } = useTheme();

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
    selectComponent(target, exIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [components, searchParams]);

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
      </>
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
    <div className="h-screen flex flex-col bg-background">
      <div className="bg-card border-b border-border px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold flex items-center">
              <PlayIcon className="w-6 h-6 mr-2 text-primary" />
              Components Playground
            </h1>
            {playgroundState.selectedComponent && (
              <span className="text-lg font-medium text-muted-foreground">
                {playgroundState.selectedComponent.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/components" className="flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Components
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-1">
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {playgroundState.selectedComponent && (
              <div 
                key={`header-controls-${playgroundState.selectedComponent?.name}`}
                className="flex items-center space-x-2 slide-in-left"
              >
                <button
                  onClick={() => togglePropsPanel()}
                  className={`p-2 rounded transition-colors duration-200 ${playgroundState.showProps ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
                  title={`${playgroundState.showProps ? 'Hide' : 'Show'} Props Panel`}
                >
                  {playgroundState.showProps ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={playgroundState.showProps ? 25 : 35} minSize={15} className="bg-card border-r border-border">
            <div className="h-full flex flex-col">
                <div className="p-4 border-b border-border flex-shrink-0">
                <h2 className="text-lg font-semibold text-foreground">Components</h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <ComponentSelector
                  components={components}
                  selectedComponent={playgroundState.selectedComponent}
                  onSelect={selectComponent}
                  searchQuery={playgroundState.searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
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
                    <div className="p-4 border-b border-border flex items-center justify-start flex-shrink-0">
                      <h3 className="font-semibold">Generated Code</h3>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <CodeViewer value={playgroundState.currentCode} language="typescript" title="Component Code" />
                    </div>
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

          {playgroundState.showProps && playgroundState.selectedComponent && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel key={`props-panel-${playgroundState.selectedComponent.name}-${playgroundState.showProps}`} defaultSize={25} minSize={15} className="bg-card border-l border-border">
                <div className="h-full flex flex-col slide-in-right" data-testid="props-panel">
                  <div className="p-4 border-b border-border flex items-center justify-start flex-shrink-0">
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




