'use client';

import { useState } from 'react';
import { Component, LocalComponent, PropDefinition } from '@/types';
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
  component: Component | LocalComponent;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onSelectExample?: (exampleIndex: number) => void;
  selectedExampleIndex?: number;
}

export default function PropsPanel({ component, values, onChange, onSelectExample, selectedExampleIndex = -1 }: PropsPanelProps) {
  const [expandedProps, setExpandedProps] = useState<Set<string>>(new Set());
  const [showOptionalProps, setShowOptionalProps] = useState<boolean>(true);

  debugLog('COMPONENT_PROPS', `PropsPanel receiving props for ${component.name}`, { values });

  const handlePropChange = (propName: string, value: any) => {
    onChange({
      ...values,
      [propName]: value,
    });
  };

  console.log("values", values);

  const resetToDefaults = () => {
    debugLog('COMPONENT_STATE', '🎛️ PropsPanel resetToDefaults called');
    
    // If there's a selected example, reset to that example using selectExample
    // This ensures we use the same safe prop copying logic as the example selection
    if (selectedExampleIndex >= 0 && component.examples && component.examples[selectedExampleIndex] && onSelectExample) {
      const currentExample = component.examples[selectedExampleIndex];
      debugLog('COMPONENT_STATE', '🎛️ Resetting to current example props via selectExample:', currentExample.name);
      onSelectExample(selectedExampleIndex);
      return;
    }
    
    // Otherwise, fall back to metadata defaults
    debugLog('COMPONENT_STATE', '🎛️ Resetting to metadata defaults (no example selected)');
    const defaultValues = component.props.reduce((acc, prop) => {
      acc[prop.name] = prop.defaultValue;
      return acc;
    }, {} as Record<string, any>);
    onChange(defaultValues);
  };

  const togglePropExpansion = (propName: string) => {
    const newExpanded = new Set(expandedProps);
    if (newExpanded.has(propName)) {
      newExpanded.delete(propName);
    } else {
      newExpanded.add(propName);
    }
    setExpandedProps(newExpanded);
  };

  const requiredProps = component.props.filter(prop => prop.required);
  const optionalProps = component.props.filter(prop => !prop.required);

  const hasExamples = component.examples && component.examples.length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Props Configuration</h3>
          <button
            onClick={resetToDefaults}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            title="Reset to defaults"
          >
            <RefreshCwIcon className="w-4 h-4 mr-1" />
            Reset
          </button>
        </div>
        
        <div className="flex items-center justify-start text-sm text-gray-600">
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
                <div className="p-4 space-y-6">
                  {/* Required Props */}
                  {requiredProps.length > 0 && (
                    <div>
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4 rounded-r-lg">
                        <h4 className="text-lg font-bold text-red-800 flex items-center">
                          <span className="mr-2">🔴</span>
                          Required Props
                          <span className="ml-3 text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
                            {requiredProps.length}
                          </span>
                        </h4>
                        <p className="text-sm text-red-600 mt-1">These props must be provided</p>
                      </div>
                      <div className="space-y-4 ml-2">
                        {requiredProps.map(prop => (
                          prop.type === 'function' ? (
                            <FunctionPropEditor
                              key={prop.name}
                              prop={prop}
                              value={values[prop.name]}
                              onChange={(value) => handlePropChange(prop.name, value)}
                              isExpanded={expandedProps.has(prop.name)}
                              onToggleExpansion={() => togglePropExpansion(prop.name)}
                            />
                          ) : (
                            <PropControl
                              key={prop.name}
                              prop={prop}
                              value={values[prop.name]}
                              onChange={(value) => handlePropChange(prop.name, value)}
                              isExpanded={expandedProps.has(prop.name)}
                              onToggleExpansion={() => togglePropExpansion(prop.name)}
                            />
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {optionalProps.length > 0 && (
                    <div>
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 rounded-r-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-bold text-blue-800 flex items-center">
                              <span className="mr-2">🔵</span>
                              Optional Props
                              <span className="ml-3 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                                {optionalProps.length}
                              </span>
                            </h4>
                            <p className="text-sm text-blue-600 mt-1">Customize these props as needed</p>
                          </div>
                          <button
                            onClick={() => setShowOptionalProps(!showOptionalProps)}
                            className="flex items-center text-sm text-blue-700 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-lg transition-colors"
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
                                onChange={(value) => handlePropChange(prop.name, value)}
                                isExpanded={expandedProps.has(prop.name)}
                                onToggleExpansion={() => togglePropExpansion(prop.name)}
                              />
                            ) : (
                              <PropControl
                                key={prop.name}
                                prop={prop}
                                value={values[prop.name]}
                                onChange={(value) => handlePropChange(prop.name, value)}
                                isExpanded={expandedProps.has(prop.name)}
                                onToggleExpansion={() => togglePropExpansion(prop.name)}
                              />
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Examples Panel */}
            <ResizablePanel defaultSize={30} minSize={20}>
              <div className="h-full overflow-y-auto border-t border-gray-200">
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Examples</h4>
                  <div className="space-y-2">
                    {component.examples.map((example, index) => {
                      const isSelected = selectedExampleIndex === index;
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            debugLog('COMPONENT_STATE', '🎛️ PropsPanel example button clicked:', {
                              exampleIndex: index,
                              exampleName: example.name,
                              hasOnSelectExample: !!onSelectExample,
                              selectedExampleIndex: selectedExampleIndex
                            });
                            onSelectExample ? onSelectExample(index) : onChange(example.props);
                          }}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            isSelected
                              ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500'
                              : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                          }`}
                        >
                          <div className="font-medium text-sm">{example.name}</div>
                          {example.description && (
                            <div className="text-xs text-gray-600 mt-1">
                              {example.description}
                            </div>
                          )}
                          {isSelected && (
                            <div className="text-xs text-blue-600 mt-1 font-medium">
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
            <div className="p-4 space-y-6">
              {/* Required Props */}
              {requiredProps.length > 0 && (
                <div>
                  <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4 rounded-r-lg">
                    <h4 className="text-lg font-bold text-red-800 flex items-center">
                      <span className="mr-2">🔴</span>
                      Required Props
                      <span className="ml-3 text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
                        {requiredProps.length}
                      </span>
                    </h4>
                    <p className="text-sm text-red-600 mt-1">These props must be provided</p>
                  </div>
                  <div className="space-y-4 ml-2">
                    {requiredProps.map(prop => (
                      prop.type === 'function' ? (
                        <FunctionPropEditor
                          key={prop.name}
                          prop={prop}
                          value={values[prop.name]}
                          onChange={(value) => handlePropChange(prop.name, value)}
                          isExpanded={expandedProps.has(prop.name)}
                          onToggleExpansion={() => togglePropExpansion(prop.name)}
                        />
                      ) : (
                        <PropControl
                          key={prop.name}
                          prop={prop}
                          value={values[prop.name]}
                          onChange={(value) => handlePropChange(prop.name, value)}
                          isExpanded={expandedProps.has(prop.name)}
                          onToggleExpansion={() => togglePropExpansion(prop.name)}
                        />
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Props */}
              {optionalProps.length > 0 && (
                <div>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 rounded-r-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-blue-800 flex items-center">
                          <span className="mr-2">🔵</span>
                          Optional Props
                          <span className="ml-3 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                            {optionalProps.length}
                          </span>
                        </h4>
                        <p className="text-sm text-blue-600 mt-1">Customize these props as needed</p>
                      </div>
                      <button
                        onClick={() => setShowOptionalProps(!showOptionalProps)}
                        className="flex items-center text-sm text-blue-700 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-lg transition-colors"
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
                            onChange={(value) => handlePropChange(prop.name, value)}
                            isExpanded={expandedProps.has(prop.name)}
                            onToggleExpansion={() => togglePropExpansion(prop.name)}
                          />
                        ) : (
                          <PropControl
                            key={prop.name}
                            prop={prop}
                            value={values[prop.name]}
                            onChange={(value) => handlePropChange(prop.name, value)}
                            isExpanded={expandedProps.has(prop.name)}
                            onToggleExpansion={() => togglePropExpansion(prop.name)}
                          />
                        )
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
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
  const renderControl = () => {
    switch (prop.type) {
      case 'boolean':
        return (
          <label 
            className="flex items-center"
            data-testid={`prop-control-${prop.name}`}
          >
            <input
              type="checkbox"
              id={`prop-${prop.name}`}
              name={`prop-${prop.name}`}              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'enum':
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            data-testid={`prop-control-${prop.name}`}
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
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 h-8 border border-gray-300 rounded"
            />
            <input
              type="text"
              id={`prop-${prop.name}-text`}
              name={`prop-${prop.name}-text`}
              value={value || ''}
              onChange={(e) => onChange(e.target.value || undefined)}
              placeholder="#000000"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 font-mono">
                  {displayValue()}
                </span>
                <button
                  onClick={onToggleExpansion}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {isExpanded ? 'Hide details' : 'Show details'}
                </button>
              </div>
            </div>
            {isExpanded && (
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1">JSON Editor:</div>
                <textarea
                  id={`prop-${prop.name}`}
                  name={`prop-${prop.name}`}
                  value={value ? JSON.stringify(value, null, 2) : ''}
                  onChange={(e) => {
                    try {
                      const parsed = e.target.value ? JSON.parse(e.target.value) : undefined;
                      onChange(parsed);
                    } catch {
                      // Invalid JSON, don't update
                    }
                  }}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder={prop.type === 'array' ? '[]' : '{}'}
                />
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={prop.name === 'className' ? 'e.g. bg-blue-500 text-white p-4' : 'Enter value'}
          />
        );
    }
  };

  // Check if this is a className prop
  const isClassNameProp = prop.name === 'className';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {prop.name}
          {prop.required && <span className="text-red-500 ml-1">*</span>}
          {isClassNameProp && (
            <TooltipComponent
              trigger={
                <span className="ml-2 text-xs text-cyan-600 bg-cyan-50 px-1 underline hover:no-underline rounded cursor-help">
                  Tailwind CSS
                </span>
              }
              content={
                <div className="space-y-3 bg-blue-50 p-2 rounded-lg border">
                  <div className="flex items-center text-blue-700">
                    <span className="mr-1">🎨</span>
                    <strong>Tailwind CSS Styling</strong>
                  </div>
                  <div className="text-blue-600 space-y-2">
                    <p>This component uses <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:no-underline">Tailwind CSS</a> utility classes for styling.</p>
                    <div>
                      <p><strong>✅ Standard classes work:</strong></p>
                      <code className="block bg-gray-100 px-2 py-1 rounded text-xs mt-1">bg-red-500 text-white p-4 w-full rounded-lg</code>
                    </div>
                    <div>
                      <p><strong>✅ Predefined scales:</strong></p>
                      <code className="block bg-gray-100 px-2 py-1 rounded text-xs mt-1">w-64 w-80 w-96 h-32 p-8 text-xl</code>
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
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {prop.type}
          </span>
          {prop.description && (
            <InfoIcon 
              className="w-4 h-4 text-gray-400 cursor-help" 
            />
          )}
        </div>
      </div>
      
      {renderControl()}
      
      {prop.defaultValue !== undefined && (
        <div className="text-xs text-gray-500">
          Default: {String(prop.defaultValue)}
        </div>
      )}
    </div>
  );
} 