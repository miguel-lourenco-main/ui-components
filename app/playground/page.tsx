'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ComponentSelector from '@/components/ComponentSelector';
import LocalComponentRenderer from '@/components/LocalComponentRenderer';
import CodeViewer from '@/components/code-viewer';
import PropsPanel from '@/components/PropsPanel';

import { useLocalComponentState } from '@/lib/hooks/useLocalComponentState';
import { PlayIcon, EyeIcon, Play, CodeIcon, Search as SearchIcon, List, X } from 'lucide-react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { ImperativePanelHandle } from 'react-resizable-panels'
import { FullComponentInfo } from '@/lib/interfaces';
import { Button } from '@/components/ui/button';
import { useScrollDirection } from '@/lib/hooks/use-scroll-direction';
import { useIsMobile } from '@/components/ui/use-mobile';
import { cn } from '@/lib/utils';

interface PanelToggleButtonProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  hoveredButton: string | null;
  setHoveredButton: (key: string | null) => void;
  variant?: 'desktop' | 'mobile';
}

/**
 * Shared button used to toggle the different playground panels on desktop and mobile.
 * Handles hover labels on desktop and pressed-state styles on mobile.
 */
function PanelToggleButton({
  id,
  icon,
  label,
  isActive,
  onClick,
  hoveredButton,
  setHoveredButton,
  variant = 'desktop',
}: PanelToggleButtonProps) {
  const isMobile = variant === 'mobile';
  const hoverKey = isMobile ? `${id}-mobile` : id;

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHoveredButton(hoverKey)}
      onMouseLeave={() => setHoveredButton(null)}
    >
      <Button
        onClick={onClick}
        variant={isMobile ? (isActive ? 'secondary' : 'ghost') : 'ghost'}
        className={cn(
          "min-w-10 h-10 px-2 m-.5 border rounded-lg text-muted-foreground relative",
          "transition-all duration-300 ease-in-out",
          "hover:scale-110 hover:shadow-md flex items-center justify-center",
          !isMobile && isActive && "bg-primary/5 border-primary/30 ring-2 ring-primary/50",
        )}
        aria-pressed={isMobile ? isActive : undefined}
        title={label === 'Properties' ? 'Show Properties' : `Show ${label}`}
      >
        <div className="flex items-center justify-center">
          {icon}
          <span
            className={cn(
              "text-xs font-medium whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden",
              hoveredButton === hoverKey
                ? "max-w-[100px] opacity-100 ml-2"
                : "w-0 opacity-0"
            )}
          >
            {label}
          </span>
        </div>
      </Button>
    </div>
  );
}

/**
 * Custom effect that opens/closes a side panel while resizing the center panel
 * so that the total width always roughly sums to 100%.
 */
function usePanelWithCenter(
  isOpen: boolean,
  panelRef: React.MutableRefObject<ImperativePanelHandle | null>,
  lastSizeRef: React.MutableRefObject<number>,
  centerPanelRef: React.MutableRefObject<ImperativePanelHandle | null>,
  defaultSize: number,
) {
  useEffect(() => {
    const panel = panelRef.current;
    const center = centerPanelRef.current;
    if (!panel) return;

    if (isOpen) {
      const target = lastSizeRef.current || defaultSize;
      const current = panel.getSize?.() ?? 0;
      if (current === 0 && center) {
        const centerSize = center.getSize?.() ?? 0;
        // When expanding a collapsed panel, shrink the center panel so the sum remains ~100%.
        const desiredCenter = Math.max(20, centerSize - target);
        if (desiredCenter !== centerSize) {
          center.resize?.(desiredCenter);
        }
      }
      panel.resize?.(target);
    } else {
      const currentSize = panel.getSize?.();
      if (typeof currentSize === 'number' && currentSize > 0) {
        lastSizeRef.current = currentSize;
        if (center) {
          const centerSize = center.getSize?.() ?? 0;
          const desiredCenter = Math.max(20, centerSize + currentSize);
          if (desiredCenter !== centerSize) {
            center.resize?.(desiredCenter);
          }
        }
      }
      panel.resize?.(0);
    }
  }, [isOpen, panelRef, lastSizeRef, centerPanelRef, defaultSize]);
}

/**
 * Basic panel toggler that just stores/restores the last open width.
 */
function useSimplePanel(
  isOpen: boolean,
  panelRef: React.MutableRefObject<ImperativePanelHandle | null>,
  lastSizeRef: React.MutableRefObject<number>,
  defaultSize: number,
) {
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (isOpen) {
      panel.resize?.(lastSizeRef.current || defaultSize);
    } else {
      const currentSize = panel.getSize?.();
      if (typeof currentSize === 'number' && currentSize > 0) {
        lastSizeRef.current = currentSize;
      }
      panel.resize?.(0);
    }
  }, [isOpen, panelRef, lastSizeRef, defaultSize]);
}

interface ComponentPreviewProps {
  selectedComponent: FullComponentInfo | null;
  currentProps: Record<string, any>;
  onRetry: () => void;
  onPropChange: (propName: string, value: any) => void;
  rendererButtons: React.ReactNode;
}

/**
 * Wrapper around `LocalComponentRenderer` that supplies preview chrome,
 * retry wiring, and the empty-state message.
 */
function ComponentPreview({ 
  selectedComponent, 
  currentProps, 
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

/**
 * Main interactive playground that lets users search, preview, edit props,
 * and inspect code for any component in the registry.
 */
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
    togglePropsPanel,
    toggleCodePanel,  
    toggleExamplesPanel,
    toggleSearchPanel,
    setSearchQuery,
    handlePropChange,
  } = useLocalComponentState();

  const propsPanelRef = useRef<ImperativePanelHandle | null>(null);
  const propsLastSizeRef = useRef<number>(25);
  const codePanelRef = useRef<ImperativePanelHandle | null>(null);
  const codeLastSizeRef = useRef<number>(40);
  const examplesPanelRef = useRef<ImperativePanelHandle | null>(null);
  const examplesLastSizeRef = useRef<number>(25);
  const searchPanelRef = useRef<ImperativePanelHandle | null>(null);
  const searchLastSizeRef = useRef<number>(45);
  const centerPanelRef = useRef<ImperativePanelHandle | null>(null);

  const searchParams = useSearchParams();

  const { scrollDirection, isScrolled } = useScrollDirection()

  const shouldSnap = useMemo(() => scrollDirection === 'down' && isScrolled, [scrollDirection, isScrolled])

  useEffect(() => {
    if (shouldSnap) {
      // Auto scroll to the editor area when the user swipes down quickly on mobile.
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [shouldSnap])

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

  // Keep the resizable panels in sync with the single source of truth
  usePanelWithCenter(
    playgroundState.showProps,
    propsPanelRef,
    propsLastSizeRef,
    centerPanelRef,
    25,
  );

  useSimplePanel(
    playgroundState.showCode,
    codePanelRef,
    codeLastSizeRef,
    40,
  );

  usePanelWithCenter(
    playgroundState.showExamples,
    examplesPanelRef,
    examplesLastSizeRef,
    centerPanelRef,
    25,
  );

  useSimplePanel(
    playgroundState.showSearch,
    searchPanelRef,
    searchLastSizeRef,
    45,
  );

  const isMobile = useIsMobile();
  const [activeTopPanel, setActiveTopPanel] = useState<'search' | 'props' | 'code' | 'examples'>('search');
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  
  const triggerSearchButton = () => {
    if (isMobile) setActiveTopPanel('search');
    else toggleSearchPanel();
  }

  const triggerPropsButton = () => {
    if (isMobile) setActiveTopPanel('props');
    else togglePropsPanel();
  }

  const triggerCodeButton = () => {
    if (isMobile) setActiveTopPanel('code');
    else toggleCodePanel();
  }

  const triggerExamplesButton = () => {
    if (isMobile) setActiveTopPanel('examples');
    else toggleExamplesPanel();
  }

  const panelConfigs = [
    {
      id: 'search',
      label: 'Search',
      Icon: SearchIcon,
      desktopActive: playgroundState.showSearch,
      mobileActive: activeTopPanel === 'search',
      onClick: triggerSearchButton,
    },
    {
      id: 'code',
      label: 'Code',
      Icon: CodeIcon,
      desktopActive: playgroundState.showCode,
      mobileActive: activeTopPanel === 'code',
      onClick: triggerCodeButton,
    },
    {
      id: 'props',
      label: 'Properties',
      Icon: EyeIcon,
      desktopActive: playgroundState.showProps,
      mobileActive: activeTopPanel === 'props',
      onClick: triggerPropsButton,
    },
    {
      id: 'examples',
      label: 'Examples',
      Icon: List,
      desktopActive: playgroundState.showExamples,
      mobileActive: activeTopPanel === 'examples',
      onClick: triggerExamplesButton,
    },
  ] as const;

  const rendererButtons = (): React.ReactNode => {
    return playgroundState.selectedComponent ? (
      <div className="flex w-full items-center justify-start">
        {!isMobile && (
          <div className="flex w-fit items-center justify-end space-x-2">
            {panelConfigs.map(({ id, label, Icon, desktopActive, onClick }) => (
              <PanelToggleButton
                key={id}
                id={id}
                icon={<Icon className="size-4 flex-shrink-0" />}
                label={label}
                isActive={desktopActive}
                onClick={onClick}
                hoveredButton={hoveredButton}
                setHoveredButton={setHoveredButton}
                variant="desktop"
              />
            ))}
          </div>
        )}
      </div>
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

  /**
   * Mobile-only toolbar that reuses the same panel toggle buttons but collapses them into a single row.
   */
  const MobileTopPanelToolbar = () => (
    <div className="w-full flex items-center justify-end gap-2 p-2 border-b border-border bg-muted/30">
      {panelConfigs.map(({ id, label, Icon, mobileActive, onClick }) => (
        <PanelToggleButton
          key={id}
          id={id}
          icon={<Icon className="size-4 flex-shrink-0" />}
          label={label}
          isActive={mobileActive}
          onClick={onClick}
          hoveredButton={hoveredButton}
          setHoveredButton={setHoveredButton}
          variant="mobile"
        />
      ))}
    </div>
  );

  
  return (
    <div className="flex flex-col justify-center items-center size-full">
      <div className="flex flex-col items-center justify-center gap-3 my-16">
        <div className="flex w-fit items-center space-x-2">
          <Play className="size-6" />
          <h1 className="text-4xl font-bold">Playground</h1>
        </div>
        <p className="text-muted-foreground">Play with components and see how they work</p>
      </div>
      <div className="relative h-[calc(100vh-2rem)] w-[calc(100vw-4rem)] flex flex-col bg-background justify-center snap-start">
        <div className="size-full overflow-hidden rounded-lg border-4 border-border bg-card">
          {isMobile ? (
            <div className="flex flex-col h-full size-full">
              <MobileTopPanelToolbar />
              <ResizablePanelGroup direction="vertical" className="size-full">
                <ResizablePanel id="search-mobile" defaultSize={45} minSize={30} className="bg-card border-b border-border">
                  <div className="size-full flex flex-col">
                    {activeTopPanel === 'search' && (
                      <ComponentSelector
                        components={components}
                        selectedComponent={playgroundState.selectedComponent}
                        onSelect={selectComponent}
                        searchQuery={playgroundState.searchQuery}
                        onSearchChange={setSearchQuery}
                      />
                    )}
                    {activeTopPanel === 'props' && playgroundState.selectedComponent && (
                      <div className="h-full flex flex-col" data-testid="props-panel">
                        <PropsPanel
                          component={playgroundState.selectedComponent}
                          values={playgroundState.currentProps}
                          onChange={updateProps}
                          onSelectExample={selectExample}
                          selectedExampleIndex={selectedExampleIndex}
                          triggerPropsButton={triggerPropsButton}
                        />
                      </div>
                    )}
                    {activeTopPanel === 'code' && playgroundState.selectedComponent && (
                      <div className="h-full flex flex-col">
                        <CodeViewer value={playgroundState.currentCode} language="typescript" title="Component Code" />
                      </div>
                    )}
                    {activeTopPanel === 'examples' && playgroundState.selectedComponent && (
                      <div className="h-full flex flex-col overflow-y-auto" data-testid="examples-panel-mobile">
                        <div className="p-4">
                          <h4 className="font-medium text-foreground mb-3">Examples</h4>
                          <div className="space-y-2">
                            {playgroundState.selectedComponent.examples?.map((example, index) => {
                              const isSelected = selectedExampleIndex === index;
                              return (
                                <button
                                  key={index}
                                  onClick={() => {
                                    if (selectExample) {
                                      selectExample(index);
                                    } else if (updateProps) {
                                      updateProps(example.props);
                                    }
                                  }}
                                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                    isSelected
                                      ? 'bg-primary/5 border-primary/30 ring-2 ring-primary/50'
                                      : 'bg-muted hover:bg-muted/80 border-border'
                                  }`}
                                >
                                  <div className="font-medium text-sm">{example.name}</div>
                                  {example.description && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {example.description}
                                    </div>
                                  )}
                                  {isSelected && (
                                    <div className="text-xs text-primary mt-1 font-medium">
                                      ✓ Currently selected
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                    {activeTopPanel !== 'search' && !playgroundState.selectedComponent && (
                      <div className="h-full flex items-center justify-center text-muted-foreground p-4">
                        Select a component to view {activeTopPanel}.
                      </div>
                    )}
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel id="preview-mobile" defaultSize={55} minSize={30} className="bg-muted flex flex-col">
                  <ComponentPreview
                    selectedComponent={playgroundState.selectedComponent}
                    currentProps={playgroundState.currentProps}
                    onRetry={() => {
                      if (playgroundState.selectedComponent) {
                        selectComponent(playgroundState.selectedComponent, selectedExampleIndex);
                      }
                    }}
                    onPropChange={handlePropChange}
                    rendererButtons={rendererButtons()}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          ) : (
            <ResizablePanelGroup direction="horizontal" className="">
              <ResizablePanel id="search-desktop" collapsible collapsedSize={0} ref={searchPanelRef} defaultSize={playgroundState.showSearch ? 25 : 0} minSize={0} maxSize={playgroundState.showSearch ? 40 : 0} className="bg-card border-r border-border">
                <div className="h-full">
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

              <ResizablePanel id="center"
                ref={centerPanelRef}
                minSize={20}
              >
                <ResizablePanelGroup direction="vertical" className="h-full">
                  <ResizablePanel id="preview" defaultSize={60} minSize={30} className="bg-muted flex flex-col">
                    <ComponentPreview
                      selectedComponent={playgroundState.selectedComponent}
                      currentProps={playgroundState.currentProps}
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

                  <ResizablePanel id="code-desktop" collapsible collapsedSize={0} ref={codePanelRef} defaultSize={playgroundState.showCode ? 40 : 0} minSize={0} maxSize={playgroundState.showCode ? 40 : 0} className="bg-card border-t border-border">
                    <div className="h-full flex flex-col">
                      <CodeViewer value={playgroundState.currentCode} language="typescript" title="Component Code" />
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>

              <ResizableHandle withHandle />
              <ResizablePanel id="props-desktop"
                ref={propsPanelRef}
                collapsedSize={0}
                defaultSize={playgroundState.showProps ? 25 : 0}
                minSize={0}
                collapsible
                maxSize={playgroundState.showProps ? 40 : 0}
                className="bg-card border-l border-border"
              >
                <div className="h-full flex flex-col" data-testid="props-panel">
                  {playgroundState.showProps && playgroundState.selectedComponent && (
                    <PropsPanel
                      component={playgroundState.selectedComponent}
                      values={playgroundState.currentProps}
                      onChange={updateProps}
                      onSelectExample={selectExample}
                      selectedExampleIndex={selectedExampleIndex}
                      triggerPropsButton={triggerPropsButton}
                    />
                  )}
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />
              <ResizablePanel id="examples-desktop"
                ref={examplesPanelRef}
                collapsible
                collapsedSize={0}
                defaultSize={playgroundState.showExamples ? 25 : 0}
                minSize={0}
                maxSize={playgroundState.showExamples ? 40 : 0}
                className="bg-card border-l border-border"
              >
                <div className="h-full flex flex-col overflow-y-auto" data-testid="examples-panel-desktop">
                  <div className="flex w-full items-center justify-between border-b border-border">
                    <div className="flex items-center gap-2 w-fit p-4">
                      <List className="size-4" />
                      <h4 className="font-medium text-foreground">Examples</h4>
                    </div>
                    <button onClick={triggerExamplesButton} className="text-muted-foreground hover:text-foreground w-fit p-4">
                      <X className="size-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {playgroundState.selectedComponent && playgroundState.showExamples && playgroundState.selectedComponent.examples?.map((example, index) => {
                        const isSelected = selectedExampleIndex === index;
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              if (selectExample) {
                                selectExample(index);
                              } else if (updateProps) {
                                updateProps(example.props);
                              }
                            }}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              isSelected
                                ? 'bg-primary/5 border-primary/30 ring-2 ring-primary/50'
                                : 'bg-muted hover:bg-muted/80 border-border'
                            }`}
                          >
                            <div className="font-medium text-sm">{example.name}</div>
                            {example.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {example.description}
                              </div>
                            )}
                            {isSelected && (
                              <div className="text-xs text-primary mt-1 font-medium">
                                ✓ Currently selected
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>
      </div>
    </div>
  );
}