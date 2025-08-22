'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Component, FullComponentInfo, PropDefinition } from '@/lib/interfaces';
import { RefreshCwIcon, InfoIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { debugLog } from '@/lib/constants';
import TooltipComponent from '@/components/ui/tooltip-component';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import FunctionPropEditor from './FunctionPropEditor';

interface PropsPanelProps {
  component: Component | FullComponentInfo;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onSelectExample?: (exampleIndex: number) => void;
  selectedExampleIndex?: number;
}

export default function PropsPanel({ component, values, onChange, onSelectExample, selectedExampleIndex = -1 }: PropsPanelProps) {
  const [expandedProps, setExpandedProps] = useState<Set<string>>(new Set());
  const [showOptionalProps, setShowOptionalProps] = useState<boolean>(true);

  debugLog('props', `PropsPanel receiving props for ${component.name}`, { values });

  const handlePropChange = useCallback((propName: string, value: any) => {
    onChange({
      ...values,
      [propName]: value,
    });
  }, [onChange, values]);

  const resetToDefaults = useCallback(() => {
    debugLog('state', '🎛️ PropsPanel resetToDefaults called');
    
    // If there's a selected example, reset to that example using selectExample
    // This ensures we use the same safe prop copying logic as the example selection
    if (selectedExampleIndex >= 0 && component.examples && component.examples[selectedExampleIndex] && onSelectExample) {
      const currentExample = component.examples[selectedExampleIndex];
      debugLog('state', '🎛️ Resetting to current example props via selectExample:', currentExample.name);
      onSelectExample(selectedExampleIndex);
      return;
    }
    
    // Otherwise, fall back to metadata defaults
    debugLog('state', '🎛️ Resetting to metadata defaults (no example selected)');
    const defaultValues = component.props.reduce((acc, prop) => {
      acc[prop.name] = prop.defaultValue;
      return acc;
    }, {} as Record<string, any>);
    onChange(defaultValues);
  }, [component.examples, component.props, onChange, onSelectExample, selectedExampleIndex]);

  const togglePropExpansion = useCallback((propName: string) => {
    const newExpanded = new Set(expandedProps);
    if (newExpanded.has(propName)) {
      newExpanded.delete(propName);
    } else {
      newExpanded.add(propName);
    }
    setExpandedProps(newExpanded);
  }, [expandedProps]);

  // Filter out specific props for DataTable component
  const shouldHideProp = useCallback((prop: PropDefinition) => {
    if (component.name === 'DataTable') {
      // Hide filters, initialSorting, and all function props for DataTable
      return prop.name === 'filters' || 
             prop.name === 'initialSorting' || 
             prop.type === 'function';
    }
    return false;
  }, [component.name]);

  const requiredProps = useMemo(() => component.props.filter(prop => prop.required && !shouldHideProp(prop)), [component.props]);
  const optionalProps = useMemo(() => component.props.filter(prop => !prop.required && !shouldHideProp(prop)), [component.props]);

  const hasExamples = component.examples && component.examples.length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Props Configuration</h3>
          <button
            onClick={resetToDefaults}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            title="Reset to defaults"
          >
            <RefreshCwIcon className="w-4 h-4 mr-1" />
            Reset
          </button>
        </div>
        
        <div className="flex items-center justify-start text-sm text-muted-foreground">
          <span>
            {component.props.length} props total
          </span>
        </div>
      </div>

      {/* Resizable Content Area */}
      <div className="flex-1 overflow-hidden">
        {hasExamples ? (
          <ResizablePanelGroup direction="vertical" className="h-full">
            {/* Props List Panel */}
            <ResizablePanel defaultSize={70} minSize={30}>
              <div className="h-full overflow-y-auto">
                <PropsList
                  requiredProps={requiredProps}
                  optionalProps={optionalProps}
                  values={values}
                  expandedProps={expandedProps}
                  showOptionalProps={showOptionalProps}
                  onPropChange={handlePropChange}
                  onToggleExpansion={togglePropExpansion}
                  onToggleOptionalProps={() => setShowOptionalProps(!showOptionalProps)}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Examples Panel */}
            <ResizablePanel defaultSize={30} minSize={20}>
              <div className="h-full overflow-y-auto border-t border-border" data-testid="examples-panel">
                <div className="p-4">
                  <h4 className="font-medium text-foreground mb-3">Examples</h4>
                  <div className="space-y-2">
                    {component.examples.map((example, index) => {
                      const isSelected = selectedExampleIndex === index;
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            debugLog('state', '🎛️ PropsPanel example button clicked:', {
                              exampleIndex: index,
                              exampleName: example.name,
                              hasOnSelectExample: !!onSelectExample,
                              selectedExampleIndex: selectedExampleIndex
                            });
                            onSelectExample ? onSelectExample(index) : onChange(example.props);
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
        ) : (
          /* Props List - Full Height when no examples */
          <div className="h-full overflow-y-auto">
            <PropsList
              requiredProps={requiredProps}
              optionalProps={optionalProps}
              values={values}
              expandedProps={expandedProps}
              showOptionalProps={showOptionalProps}
              onPropChange={handlePropChange}
              onToggleExpansion={togglePropExpansion}
              onToggleOptionalProps={() => setShowOptionalProps(!showOptionalProps)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// New component for rendering props list
interface PropsListProps {
  requiredProps: PropDefinition[];
  optionalProps: PropDefinition[];
  values: Record<string, any>;
  expandedProps: Set<string>;
  showOptionalProps: boolean;
  onPropChange: (propName: string, value: any) => void;
  onToggleExpansion: (propName: string) => void;
  onToggleOptionalProps: () => void;
}

function PropsList({ 
  requiredProps, 
  optionalProps, 
  values, 
  expandedProps, 
  showOptionalProps, 
  onPropChange, 
  onToggleExpansion, 
  onToggleOptionalProps 
}: PropsListProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Required Props */}
      {requiredProps.length > 0 && (
        <div>
          <div className="bg-destructive/10 border-l-4 border-destructive p-3 mb-4 rounded-r-lg">
            <h4 className="text-lg font-bold text-destructive flex items-center">
              <span className="mr-2">🔴</span>
              Required Props
              <span className="ml-3 text-sm bg-destructive/10 text-destructive px-3 py-1 rounded-full font-medium">
                {requiredProps.length}
              </span>
            </h4>
          </div>
          <div className="space-y-4 ml-2">
            {requiredProps.map(prop => (
              prop.type === 'function' ? (
                <FunctionPropEditor
                  key={prop.name}
                  prop={prop}
                  value={values[prop.name]}
                  onChange={(value) => onPropChange(prop.name, value)}
                  isExpanded={expandedProps.has(prop.name)}
                  onToggleExpansion={() => onToggleExpansion(prop.name)}
                />
              ) : (
                <PropControl
                  key={prop.name}
                  prop={prop}
                  value={values[prop.name]}
                  onChange={(value) => onPropChange(prop.name, value)}
                  isExpanded={expandedProps.has(prop.name)}
                  onToggleExpansion={() => onToggleExpansion(prop.name)}
                />
              )
            ))}
          </div>
        </div>
      )}

      {/* Optional Props */}
      {optionalProps.length > 0 && (
        <div>
          <div className="bg-primary/5 border-l-4 border-primary/40 p-3 mb-4 rounded-r-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-primary flex items-center">
                  <span className="mr-2">🔵</span>
                  Optional Props
                  <span className="ml-3 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                    {optionalProps.length}
                  </span>
                </h4>
              </div>
              <button
                onClick={onToggleOptionalProps}
                className="flex items-center text-sm text-primary hover:text-primary/90 bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-lg transition-colors"
                title={showOptionalProps ? "Hide optional props" : "Show optional props"}
              >
                {showOptionalProps ? (
                  <>
                    <EyeOffIcon className="w-4 h-4 mr-1" />
                    Hide
                  </>
                ) : (
                  <>
                    <EyeIcon className="w-4 h-4 mr-1" />
                    Show
                  </>
                )}
              </button>
            </div>
          </div>
          {showOptionalProps && (
            <div className="space-y-4 ml-2">
              {optionalProps.map(prop => (
                prop.type === 'function' ? (
                  <FunctionPropEditor
                    key={prop.name}
                    prop={prop}
                    value={values[prop.name]}
                    onChange={(value) => onPropChange(prop.name, value)}
                    isExpanded={expandedProps.has(prop.name)}
                    onToggleExpansion={() => onToggleExpansion(prop.name)}
                  />
                ) : (
                  <PropControl
                    key={prop.name}
                    prop={prop}
                    value={values[prop.name]}
                    onChange={(value) => onPropChange(prop.name, value)}
                    isExpanded={expandedProps.has(prop.name)}
                    onToggleExpansion={() => onToggleExpansion(prop.name)}
                  />
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface PropControlProps {
  prop: PropDefinition;
  value: any;
  onChange: (value: any) => void;
  isExpanded: boolean;
  onToggleExpansion: () => void;
}

function PropControl({ prop, value, onChange, isExpanded, onToggleExpansion }: PropControlProps) {
  const [jsonValidationError, setJsonValidationError] = useState<string | null>(null);
  const [jsonTextValue, setJsonTextValue] = useState<string>('');

  // Initialize JSON text value when component mounts or value changes
  useEffect(() => {
    if (prop.type === 'array' || prop.type === 'object') {
      setJsonTextValue(value ? JSON.stringify(value, null, 2) : '');
      setJsonValidationError(null);
    }
  }, [value, prop.type]);

  const renderControl = () => {
    switch (prop.type) {
      case 'boolean':
        return (
          <label 
            className="flex items-center"
          >
            <input
              type="checkbox"
              id={`prop-${prop.name}`}
              name={`prop-${prop.name}`}
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm">{value ? 'true' : 'false'}</span>
          </label>
        );

      case 'number':
        return (
          <input
            type="number"
            id={`prop-${prop.name}`}
            name={`prop-${prop.name}`}
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background border-input text-foreground"
          />
        );

      case 'enum':
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background border-input text-foreground"
          >
            <option value="">Select...</option>
            {prop.options?.map(option => (
              <option key={String(option)} value={String(option)}>
                {String(option)}
              </option>
            ))}
          </select>
        );

      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              id={`prop-${prop.name}-color`}
              name={`prop-${prop.name}-color`}
              data-testid={`prop-control-${prop.name}-color`}
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 h-8 border border-input rounded bg-background"
            />
            <input
              type="text"
              id={`prop-${prop.name}-text`}
              name={`prop-${prop.name}-text`}
              data-testid={`prop-control-${prop.name}-text`}
              value={value || ''}
              onChange={(e) => onChange(e.target.value || undefined)}
              placeholder="#000000"
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background border-input text-foreground"
            />
          </div>
        );

      case 'array':
      case 'object':
        const displayValue = () => {
          if (!value) return `${prop.type === 'array' ? '[]' : '{}'}`;
          if (Array.isArray(value)) {
            return `Array (${value.length} items)`;
          }
          if (typeof value === 'object') {
            const keys = Object.keys(value);
            return `Object (${keys.length} properties)`;
          }
          return String(value);
        };

        return (
          <div>
            <div className="w-full p-3 bg-muted border border-input rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-mono">
                  {displayValue()}
                </span>
                <button
                  onClick={onToggleExpansion}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  {isExpanded ? 'Hide details' : 'Show details'}
                </button>
              </div>
            </div>
            {isExpanded && (
              <div className="mt-2">
                <div className="text-xs text-muted-foreground mb-1">JSON Editor:</div>
                <textarea
                  id={`prop-${prop.name}`}
                  name={`prop-${prop.name}`}
                  value={jsonTextValue}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setJsonTextValue(newValue);
                    
                    // Clear previous validation error
                    setJsonValidationError(null);
                    
                    // If empty, set to undefined and return
                    if (!newValue.trim()) {
                      onChange(undefined);
                      return;
                    }
                    
                    // Validate JSON
                    try {
                      const parsed = JSON.parse(newValue);
                      
                      // Type-specific validation
                      if (prop.type === 'array' && !Array.isArray(parsed)) {
                        setJsonValidationError('Expected an array, but got ' + typeof parsed);
                        return;
                      }
                      
                      if (prop.type === 'object' && (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed))) {
                        setJsonValidationError('Expected an object, but got ' + (Array.isArray(parsed) ? 'array' : typeof parsed));
                        return;
                      }
                      
                      // Valid JSON and correct type
                      onChange(parsed);
                    } catch (error) {
                      const errorMessage = error instanceof Error ? error.message : 'Invalid JSON format';
                      setJsonValidationError(errorMessage);
                    }
                  }}
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent font-mono text-sm bg-background ${
                    jsonValidationError 
                      ? 'border-destructive focus:ring-destructive bg-destructive/10' 
                      : 'border-input focus:ring-primary'
                  }`}
                  placeholder={prop.type === 'array' ? '[]' : '{}'}
                />
                {jsonValidationError && (
                  <div 
                    className="mt-1 text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded px-2 py-1"
                    data-testid={`prop-control-${prop.name}-error`}
                  >
                    <span className="font-medium">Validation Error:</span> {jsonValidationError}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default: // string
        return (
          <input
            type="text"
            id={`prop-${prop.name}`}
            name={`prop-${prop.name}`}
            value={value || ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background border-input text-foreground"
            placeholder={prop.name === 'className' ? 'e.g. bg-blue-500 text-white p-4' : 'Enter value'}
          />
        );
    }
  };

  // Check if this is a className prop
  const isClassNameProp = prop.name === 'className';

  return (
    <div className="space-y-2" data-testid={`prop-control-${prop.name}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">
          {prop.name}
          {prop.required && <span className="text-destructive ml-1">*</span>}
          {isClassNameProp && (
            <TooltipComponent
              trigger={
                <span className="ml-2 text-xs text-primary bg-primary/10 px-1 underline hover:no-underline rounded cursor-help">
                  Tailwind CSS
                </span>
              }
              content={
                <div className="space-y-3 bg-primary/5 p-2 rounded-lg border border-primary/30">
                  <div className="flex items-center text-primary">
                    <span className="mr-1">🎨</span>
                    <strong>Tailwind CSS Styling</strong>
                  </div>
                  <div className="text-primary space-y-2">
                    <p>This component uses <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:no-underline">Tailwind CSS</a> utility classes for styling.</p>
                    <div>
                      <p><strong>✅ Standard classes work:</strong></p>
                      <code className="block bg-muted px-2 py-1 rounded text-xs mt-1">bg-primary text-primary-foreground p-4 w-full rounded-lg</code>
                    </div>
                    <div>
                      <p><strong>✅ Predefined scales:</strong></p>
                      <code className="block bg-muted px-2 py-1 rounded text-xs mt-1">w-64 w-80 w-96 h-32 p-8 text-xl</code>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded p-2 text-amber-700">
                    <div className="flex items-start">
                      <span className="mr-1 mt-0.5">⚠️</span>
                      <div>
                        <strong>Limitation:</strong> Arbitrary values like <code className="bg-white px-1 rounded text-xs">w-[220px]</code>, <code className="bg-white px-1 rounded text-xs">bg-[#123456]</code> are disabled.
                      </div>
                    </div>
                  </div>
                </div>
              }
              className="w-fit p-0 bg-transparent"
            />
          )}
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            {prop.type}
          </span>
          {prop.description && (
            <InfoIcon 
              className="w-4 h-4 text-muted-foreground cursor-help" 
            />
          )}
        </div>
      </div>
      
      {renderControl()}
      
      {prop.defaultValue !== undefined && (
        <div className="text-xs text-muted-foreground">
          Default: {String(prop.defaultValue)}
        </div>
      )}
    </div>
  );
} 