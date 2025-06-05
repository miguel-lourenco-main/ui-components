'use client';

import { useState } from 'react';
import { Component, LocalComponent, PropDefinition } from '@/types';
import { RefreshCwIcon, InfoIcon, EyeIcon, EyeOffIcon } from 'lucide-react';

interface PropsPanelProps {
  component: Component | LocalComponent;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
}

export default function PropsPanel({ component, values, onChange }: PropsPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedProps, setExpandedProps] = useState<Set<string>>(new Set());

  const handlePropChange = (propName: string, value: any) => {
    onChange({
      ...values,
      [propName]: value,
    });
  };

  const resetToDefaults = () => {
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
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{component.props.length} props total</span>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center hover:text-gray-900"
          >
            {showAdvanced ? <EyeOffIcon className="w-4 h-4 mr-1" /> : <EyeIcon className="w-4 h-4 mr-1" />}
            {showAdvanced ? 'Hide' : 'Show'} advanced
          </button>
        </div>
      </div>

      {/* Props List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Required Props */}
          {requiredProps.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                Required Props
                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  {requiredProps.length}
                </span>
              </h4>
              <div className="space-y-4">
                {requiredProps.map(prop => (
                  <PropControl
                    key={prop.name}
                    prop={prop}
                    value={values[prop.name]}
                    onChange={(value) => handlePropChange(prop.name, value)}
                    isExpanded={expandedProps.has(prop.name)}
                    onToggleExpansion={() => togglePropExpansion(prop.name)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Optional Props */}
          {optionalProps.length > 0 && (showAdvanced || optionalProps.some(prop => values[prop.name] !== undefined)) && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                Optional Props
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {optionalProps.length}
                </span>
              </h4>
              <div className="space-y-4">
                {optionalProps.map(prop => (
                  <PropControl
                    key={prop.name}
                    prop={prop}
                    value={values[prop.name]}
                    onChange={(value) => handlePropChange(prop.name, value)}
                    isExpanded={expandedProps.has(prop.name)}
                    onToggleExpansion={() => togglePropExpansion(prop.name)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Examples */}
      {component.examples && component.examples.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-3">Examples</h4>
          <div className="space-y-2">
            {component.examples.map((example, index) => (
              <button
                key={index}
                onClick={() => onChange(example.props)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border"
              >
                <div className="font-medium text-sm">{example.name}</div>
                {example.description && (
                  <div className="text-xs text-gray-600 mt-1">
                    {example.description}
                  </div>
                )}
              </button>
            ))}
          </div>
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
  const renderControl = () => {
    switch (prop.type) {
      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
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
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 h-8 border border-gray-300 rounded"
            />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value || undefined)}
              placeholder="#000000"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case 'array':
      case 'object':
        return (
          <div>
            <button
              onClick={onToggleExpansion}
              className="w-full text-left p-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {isExpanded ? 'Hide JSON editor' : 'Show JSON editor'}
            </button>
            {isExpanded && (
              <textarea
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
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder={prop.type === 'array' ? '[]' : '{}'}
              />
            )}
          </div>
        );

      default: // string
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {prop.name}
          {prop.required && <span className="text-red-500 ml-1">*</span>}
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