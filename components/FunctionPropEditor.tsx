'use client';

import { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { PropDefinition } from '@/types';
import { AlertTriangleIcon, CheckIcon, CodeIcon } from 'lucide-react';

interface FunctionPropEditorProps {
  prop: PropDefinition;
  value: any;
  onChange: (value: any) => void;
  isExpanded: boolean;
  onToggleExpansion: () => void;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  compiledFunction?: Function;
}

export default function FunctionPropEditor({
  prop,
  value,
  onChange,
  isExpanded,
  onToggleExpansion,
}: FunctionPropEditorProps) {
  const [functionBody, setFunctionBody] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true });
  
  // Extract function signature from prop description or generate default
  const getFunctionSignature = useCallback(() => {
    // Try to extract signature from description
    if (prop.description) {
      const signatureMatch = prop.description.match(/\((.*?)\)\s*=>\s*(.+)/);
      if (signatureMatch) {
        const [, params, returnType] = signatureMatch;
        return {
          params: params.trim(),
          returnType: returnType.trim()
        };
      }
    }
    
    // Default signatures for common function prop patterns
    const commonSignatures: Record<string, { params: string; returnType: string }> = {
      onClick: { params: 'event', returnType: 'void' },
      onChange: { params: 'value', returnType: 'void' },
      onSubmit: { params: 'event', returnType: 'void' },
      onSelect: { params: 'value', returnType: 'void' },
      onError: { params: 'error', returnType: 'void' },
      onInput: { params: 'event', returnType: 'void' },
      onFocus: { params: 'event', returnType: 'void' },
      onBlur: { params: 'event', returnType: 'void' },
      validator: { params: 'value', returnType: 'boolean' },
      formatter: { params: 'value', returnType: 'string' },
      filter: { params: 'item', returnType: 'boolean' },
      transform: { params: 'value', returnType: 'any' },
    };
    
    return commonSignatures[prop.name] || { params: '...args: any[]', returnType: 'any' };
  }, [prop.description, prop.name]);

  // Initialize function body from current value
  useEffect(() => {
    if (value && typeof value === 'function') {
      // Extract function body from existing function
      const funcString = value.toString();
      const bodyMatch = funcString.match(/\{([\s\S]*)\}/);
      if (bodyMatch) {
        const body = bodyMatch[1].trim();
        setFunctionBody(body);
      }
    } else if (!functionBody) {
      // Set default function body
      const signature = getFunctionSignature();
      const propSpecificBodies: Record<string, string> = {
        'onChange': '// Handle input change\nconsole.log("Value changed:", value);',
        'onClick': '// Handle click event\nconsole.log("Clicked:", event);',
        'onSubmit': '// Handle form submission\nevent.preventDefault();\nconsole.log("Form submitted:", event);',
        'onSelect': '// Handle selection\nconsole.log("Selected:", value);',
        'validator': '// Validate the value\nreturn value && value.length > 0;',
        'formatter': '// Format the value\nreturn String(value);',
        'filter': '// Filter items\nreturn true;',
      };
      
      const defaultBodies: Record<string, string> = {
        'void': '// Handle the event\nconsole.log(arguments);',
        'boolean': '// Return validation result\nreturn true;',
        'string': '// Return formatted value\nreturn String(arguments[0]);',
        'any': '// Process and return value\nreturn arguments[0];'
      };
      
      const defaultBody = propSpecificBodies[prop.name] || 
                       defaultBodies[signature.returnType] || 
                       defaultBodies['any'];
      setFunctionBody(defaultBody);
    }
  }, [value, functionBody, getFunctionSignature]);

  // Validate function code
  const validateFunction = useCallback((code: string): ValidationResult => {
    if (!code.trim()) {
      return { isValid: true }; // Empty is valid (will clear the function)
    }

    try {
      const signature = getFunctionSignature();
      const fullFunction = `(${signature.params}) => {\n${code}\n}`;
      
      // Try to create the function - this validates syntax
      const compiledFunction = new Function('return ' + fullFunction)();
      
      // For return type validation, only check if we have explicit return statements
      // and the return type is not 'any' or 'void'
      if (signature.returnType !== 'any' && signature.returnType !== 'void') {
        // Only validate return type if the code contains explicit return statements
        const hasExplicitReturn = /\breturn\b/.test(code);
        
        if (hasExplicitReturn) {
          try {
            // Create dummy arguments based on parameter count, not types
            const paramCount = signature.params ? 
              signature.params.split(',').filter(p => p.trim()).length : 0;
            const dummyArgs = Array(paramCount).fill(undefined);
            
            const result = compiledFunction(...dummyArgs);
            const actualType = typeof result;
            
            // Type checking for explicit return types
            if (signature.returnType === 'boolean' && actualType !== 'boolean' && result !== undefined) {
              return {
                isValid: false,
                error: `Expected function to return ${signature.returnType}, but got ${actualType}`
              };
            }
            if (signature.returnType === 'string' && actualType !== 'string' && result !== undefined) {
              return {
                isValid: false,
                error: `Expected function to return ${signature.returnType}, but got ${actualType}`
              };
            }
            if (signature.returnType === 'number' && actualType !== 'number' && result !== undefined) {
              return {
                isValid: false,
                error: `Expected function to return ${signature.returnType}, but got ${actualType}`
              };
            }
          } catch (execError) {
            // Execution errors during validation are acceptable
            // We're just checking syntax, not runtime behavior
          }
        }
      }
      
      return {
        isValid: true,
        compiledFunction
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid function syntax'
      };
    }
  }, [getFunctionSignature]);

  // Handle code changes with debounced validation
  useEffect(() => {
    const timer = setTimeout(() => {
      const result = validateFunction(functionBody);
      setValidationResult(result);
      
      // Update prop value if valid
      if (result.isValid) {
        if (result.compiledFunction) {
          onChange(result.compiledFunction);
        } else if (!functionBody.trim()) {
          onChange(undefined);
        }
      }
      // Don't update if invalid - keep the user's code for editing
    }, 500);

    return () => clearTimeout(timer);
  }, [functionBody, validateFunction, onChange]);

  const signature = getFunctionSignature();
  const functionPreview = `(${signature.params}) => ${signature.returnType}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {prop.name}
          {prop.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-mono">
            {functionPreview}
          </span>
          {validationResult.isValid ? (
            <CheckIcon className="w-4 h-4 text-green-500" />
          ) : (
            <AlertTriangleIcon className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <CodeIcon className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Function Editor</span>
          </div>
          <button
            onClick={onToggleExpansion}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>

        <div className="relative">
          <Editor
            height={isExpanded ? '200px' : '120px'}
            language="typescript"
            value={functionBody}
            onChange={(value) => setFunctionBody(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: isExpanded ? 'on' : 'off',
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              folding: false,
              glyphMargin: false,
              lineDecorationsWidth: 0,
              lineNumbersMinChars: 3,
              padding: { top: 8, bottom: 8 },
              contextmenu: false,
              quickSuggestions: {
                other: 'inline',
                comments: 'off',
                strings: 'off',
              },
              suggestOnTriggerCharacters: true,
              tabSize: 2,
              insertSpaces: true,
            }}
            beforeMount={(monaco) => {
              // Configure TypeScript compiler options
              monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.Latest,
                allowNonTsExtensions: true,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                module: monaco.languages.typescript.ModuleKind.CommonJS,
                noEmit: true,
                esModuleInterop: true,
                allowJs: true,
                strict: false,
              });

              // Define custom theme
              monaco.editor.defineTheme('function-editor', {
                base: 'vs',
                inherit: true,
                rules: [],
                colors: {
                  'editor.background': '#fefefe',
                  'editor.lineHighlightBackground': '#f8fafc',
                  'editorLineNumber.foreground': '#94a3b8',
                },
              });

              monaco.editor.setTheme('function-editor');
            }}
          />
          
          {/* Validation overlay */}
          {!validationResult.isValid && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-50 border-t border-red-200 p-2">
              <div className="flex items-start space-x-2">
                <AlertTriangleIcon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <div className="font-medium">Validation Error:</div>
                  <div className="text-xs mt-1">{validationResult.error}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {prop.description && (
        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
          <strong>Description:</strong> {prop.description}
        </div>
      )}

      {/* Function status */}
      <div className="flex items-center justify-between text-xs">
        <div className="text-gray-500">
          Status: {validationResult.isValid ? (
            <span className="text-green-600 font-medium">Valid function</span>
          ) : (
            <span className="text-red-600 font-medium">Invalid function</span>
          )}
        </div>
        <div className="text-gray-400">
          {functionBody.split('\n').length} lines
        </div>
      </div>
    </div>
  );
} 