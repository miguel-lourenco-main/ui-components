'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { PropDefinition } from '@/types';
import { AlertTriangleIcon, CheckIcon, CodeIcon, Trash2Icon, PencilIcon, Loader2 } from 'lucide-react';
import { parse as babelParse, ParserOptions } from '@babel/parser';
import { debugLog } from '@/lib/constants';
import { FunctionPropValue } from '@/types';
import { 
  isFunctionPropValue, 
  getFunctionSource, 
  setFunctionSource,
  functionPropValueToFunction 
} from '@/lib/utils/functionProps';
import { 
  validateFunctionCode, 
  getValidationSummary,
  ValidationResult 
} from '@/lib/utils/codeValidation';

interface FunctionPropEditorProps {
  prop: PropDefinition;
  value: any;
  onChange: (value: any) => void;
  isExpanded: boolean;
  onToggleExpansion: () => void;
}

export default function FunctionPropEditor({
  prop,
  value,
  onChange,
  isExpanded,
  onToggleExpansion,
}: FunctionPropEditorProps) {
  const [functionBody, setFunctionBody] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult>({ 
    isValid: true, 
    errors: [], 
    warnings: [], 
    language: 'javascript' 
  });

  debugLog('FUNCTION_EDITOR', `[${prop.name}] receiving value:`, { value, isFunctionPropValue: isFunctionPropValue(value) });

  const [isInitialized, setIsInitialized] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [lastSentFunctionBody, setLastSentFunctionBody] = useState<string>('');
  
  // Use ref to store current onChange to avoid dependency loops
  const onChangeRef = useRef(onChange);
  
  // Update ref when onChange changes
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  
  // Extract function signature from prop definition, description, or generate default
  const getFunctionSignature = useCallback(() => {
    // First priority: Use functionSignature from prop definition if available
    if (prop.functionSignature) {
      return {
        params: prop.functionSignature.params,
        returnType: prop.functionSignature.returnType
      };
    }
    
    // Second priority: Try to extract signature from description
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
    
    // Last resort: Default signatures for common function prop patterns
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
  }, [prop.functionSignature, prop.description, prop.name]);

  // Initialize function body from current value
  useEffect(() => {
    const source = getFunctionSource(value);
    setFunctionBody(source);
    
    // Mark as initialized after processing the value
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [value, isInitialized, prop.name]);

  // Handle code changes with debounced validation
  useEffect(() => {
    // Only call onChange after initial setup to prevent infinite loops
    if (!isInitialized) {
      debugLog('FUNCTION_EDITOR', '🛠️ FunctionPropEditor: Skipping onChange because not initialized yet', prop.name);
      return;
    }

    const timer = setTimeout(() => {
      const runValidation = async () => {
        setIsValidating(true);
        debugLog('FUNCTION_EDITOR', '🛠️ FunctionPropEditor: Validating for', prop.name, 'content:', functionBody.substring(0, 50));
        
        const signature = getFunctionSignature();
        const validation = await validateFunctionCode(
          functionBody, 
          prop.name, 
          prop,
          signature.params
        );
        setValidationResult(validation);
        setIsValidating(false);
        
        debugLog('FUNCTION_EDITOR', '🛠️ Validation result for', prop.name, ':', getValidationSummary(validation));

        if (validation.isValid) {
          if (functionBody.trim()) {
            const functionPropValue = setFunctionSource(functionBody, signature);
            if (functionBody !== lastSentFunctionBody) {
              debugLog('FUNCTION_EDITOR', '✅ FunctionPropEditor: Content valid and changed for', prop.name, '- updating props.');
              setLastSentFunctionBody(functionBody);
              onChangeRef.current(functionPropValue);
            } else {
              debugLog('FUNCTION_EDITOR', '⏭️  FunctionPropEditor: Skipping onChange - content unchanged');
            }
          } else {
            // If body is empty, remove the function prop
            if (value !== undefined) {
              debugLog('FUNCTION_EDITOR', '🗑️ FunctionPropEditor: Content empty for', prop.name, '- removing prop.');
              setLastSentFunctionBody('');
              onChangeRef.current(undefined);
            }
          }
        } else {
          // If not valid, don't update the prop value
          debugLog('FUNCTION_EDITOR', '❌ FunctionPropEditor: Content invalid for', prop.name, '- not updating props.');
        }
      };

      runValidation();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [functionBody, getFunctionSignature, isInitialized, lastSentFunctionBody, prop, value]);

  // Clear function - resets the function body and removes it from props
  const handleClearFunction = useCallback(() => {
    debugLog('FUNCTION_EDITOR', '🗑️ FunctionPropEditor: Clearing function for', prop.name);
    
    // Clear the function body - this will trigger the validation useEffect
    // which will automatically call onChange(undefined) when it sees empty content
    setFunctionBody('');
    
    // Reset other state immediately  
    setValidationResult({ isValid: true, errors: [], warnings: [], language: 'javascript' });
    setLastSentFunctionBody('');
    setIsUserTyping(false);
    
    debugLog('FUNCTION_EDITOR', '🗑️ FunctionPropEditor: Clear complete for', prop.name);
  }, [prop.name]);

  const signature = getFunctionSignature();
  const functionPreview = `(${signature.params}) => ${signature.returnType}`;

  return (
    <div
      className="border border-gray-200 rounded-lg"
      data-testid={`prop-control-${prop.name}`}
    >
      <div
        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
      >
        <div className="flex items-center space-x-2">
          <label className="block text-sm font-medium text-gray-700">
            {prop.name}
            {prop.required && <span className="text-red-500 ml-1">*</span>}
            {prop.functionSignature && (
              <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-1 rounded">
                typed
              </span>
            )}
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-mono max-w-xs truncate" title={functionPreview}>
              {functionPreview}
            </span>
            {isValidating ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            ) : validationResult.isValid ? (
              <CheckIcon className="w-4 h-4 text-green-500" />
            ) : (
              <AlertTriangleIcon className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <CodeIcon className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Function Editor</span>
          </div>
          <div className="flex items-center space-x-2">
            {functionBody.trim() && (
              <button
                onClick={handleClearFunction}
                className="text-xs text-red-600 hover:text-red-800 flex items-center space-x-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                title="Clear function"
              >
                <Trash2Icon className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={onToggleExpansion}
              className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>

        {/* Validation Status and Warnings */}
        {(!validationResult.isValid || (validationResult.warnings && validationResult.warnings.length > 0)) && (
          <div className="px-3 py-2 bg-yellow-50 border-b border-yellow-200">
            {!validationResult.isValid && (
              <div className="flex items-center space-x-2 text-red-700 mb-2">
                <AlertTriangleIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Function Invalid</span>
              </div>
            )}
            {!validationResult.isValid && validationResult.errors.length > 0 && (
              <ul className="text-sm text-red-600 mb-2 list-disc pl-5 space-y-1">
                {validationResult.errors.map((error, index) => (
                  <li key={index}>
                    {error.message} (line: {error.line})
                  </li>
                ))}
              </ul>
            )}
            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 text-yellow-800 mb-1">
                  <AlertTriangleIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Warnings</span>
                </div>
                <ul className="text-sm text-yellow-700 list-disc pl-5 space-y-1">
                  {validationResult.warnings.map((warning, index) => (
                    <li key={index}>
                      {warning.message} (line: {warning.line})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <Editor
            height={isExpanded ? '400px' : '120px'}
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
        </div>

        {/* Status Footer */}
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <div className="text-gray-500" data-testid="function-prop-status">
              Status: {isUserTyping ? (
                <span className="text-blue-600 font-medium">✏️ Typing... (validation paused)</span>
              ) : validationResult.isValid ? (
                functionBody.trim() ? (
                  validationResult.warnings && validationResult.warnings.length > 0 ? (
                    <span className="text-yellow-600 font-medium">⚠️ Valid with warnings - will appear in generated code</span>
                  ) : (
                    <span className="text-green-600 font-medium">✅ Valid function - will appear in generated code</span>
                  )
                ) : (
                  <span className="text-gray-500 font-medium">📝 Empty function - will not appear in generated code</span>
                )
              ) : (
                <span className="text-red-600 font-medium">❌ Invalid function - will not appear in generated code</span>
              )}
            </div>
            <div className="text-gray-400">
              {functionBody.split('\n').length} lines
              {validationResult.warnings && validationResult.warnings.length > 0 && (
                <span className="ml-2 text-yellow-600">({validationResult.warnings.length} warning{validationResult.warnings.length > 1 ? 's' : ''})</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {(prop.description || prop.functionSignature) && (
        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded space-y-1">
          {prop.description && (
            <div>
              <strong>Description:</strong> {prop.description}
            </div>
          )}
          {prop.functionSignature && (
            <div>
              <strong>Function Signature:</strong>
              <div className="font-mono text-xs mt-1 p-2 bg-white rounded border">
                ({prop.functionSignature.params}) =&gt; {prop.functionSignature.returnType}
              </div>
            </div>
          )}
        </div>
      )}

      {isExpanded && (
        <div className="p-3 border-t border-gray-200">
          <div
            className="text-xs text-gray-500 mb-2"
          >
            {validationResult.isValid ? (
              <span className="text-green-600 font-medium">✅ Valid function</span>
            ) : (
              <span className="text-red-600 font-medium">❌ Invalid function</span>
            )}
          </div>
          <div className="text-gray-400">
            {functionBody.split('\n').length} lines
            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <span className="ml-2 text-yellow-600">({validationResult.warnings.length} warning{validationResult.warnings.length > 1 ? 's' : ''})</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 