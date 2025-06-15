'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { PropDefinition } from '@/types';
import { AlertTriangleIcon, CheckIcon, CodeIcon, Trash2Icon } from 'lucide-react';
import { parse as babelParse, ParserOptions } from '@babel/parser';
import { debugLog } from '@/lib/constants';
import { FunctionPropValue } from '@/types';
import { 
  isFunctionPropValue, 
  getFunctionSource, 
  setFunctionSource,
  functionPropValueToFunction 
} from '@/lib/utils/functionProps';

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
  warnings?: string[];
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
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

  // Professional validation using Babel parser for robust JSX/TSX support
  const validateFunction = useCallback((code: string): ValidationResult => {
    if (!code.trim()) {
      return { isValid: true }; // Empty is valid (will clear the function)
    }

    // More refined security validation
    const securityPatterns = [
      { pattern: /\beval\s*\(/, message: "eval() is not allowed" },
      { pattern: /\bnew\s+Function\s*\(/, message: "new Function() is not allowed" },
      { pattern: /document\.(cookie|write)/, message: "Dangerous document properties are not allowed" },
      { pattern: /(localStorage|sessionStorage)\.(setItem|clear)/, message: "Direct storage manipulation is restricted" },
      { pattern: /window\.location\s*=\s*/, message: "Redirects are not allowed" },
    ];

    for (const { pattern, message } of securityPatterns) {
      if (pattern.test(code)) {
        return {
          isValid: false,
          error: `Security violation: ${message}`
        };
      }
    }

    // 2. FUNCTION BODY VALIDATION - Check it's not a complete function declaration
    const bodyViolations = [
      { pattern: /^\s*function\s+\w+\s*\(/, message: "Don't write complete function declarations - just the body" },
      { pattern: /^\s*const\s+\w+\s*=\s*function/, message: "Don't write complete function declarations - just the body" },
      { pattern: /^\s*\w+\s*=>\s*{/, message: "Don't write arrow functions - just the body" },
      { pattern: /^\s*class\s+\w+/, message: "Class declarations are not allowed in function bodies" },
    ];

    for (const { pattern, message } of bodyViolations) {
      if (pattern.test(code)) {
        return {
          isValid: false,
          error: `Invalid function body: ${message}`
        };
      }
    }

    try {
      const signature = getFunctionSignature();
      const fullFunction = `(${signature.params}) => {\n${code}\n}`;
      
      // 3. SYNTAX VALIDATION using Babel parser for robust JSX/TSX support
      try {
        const parserOptions: ParserOptions = {
          sourceType: 'module',
          plugins: ['jsx', 'typescript'],
        };
        babelParse(fullFunction, parserOptions);
      } catch (parseError) {
        const error = parseError as Error & { loc?: { line: number; column: number } };
        const location = error.loc ? ` on line ${error.loc.line}, column ${error.loc.column}` : '';
        return {
          isValid: false,
          error: `Syntax error${location}: ${error.message.replace(/ \(\d+:\d+\)/, '')}`
        };
      }

      // If syntax is valid, we can consider it "good enough" for the editor.
      // The rest can be warnings or runtime checks.
      return { isValid: true };

    } catch (e) {
      // Catch-all for any unexpected validation errors
      return {
        isValid: false,
        error: `An unexpected validation error occurred: ${e instanceof Error ? e.message : String(e)}`,
      };
    }
  }, [getFunctionSignature]);

  // Handle code changes with debounced validation
  useEffect(() => {
    // Only call onChange after initial setup to prevent infinite loops
    if (!isInitialized) {
      debugLog('FUNCTION_EDITOR', '🛠️ FunctionPropEditor: Skipping onChange because not initialized yet', prop.name);
      return;
    }

    // Set typing flag
    setIsUserTyping(true);
    
    const timer = setTimeout(() => {
      debugLog('FUNCTION_EDITOR', '🛠️ FunctionPropEditor: Validating and calling onChange for', prop.name, 'functionBody:', functionBody.trim() ? 'has content' : 'empty', 'content preview:', functionBody.substring(0, 50));
      const result = validateFunction(functionBody);
      setValidationResult(result);
      
      // Only update if the validation result changed or if switching between valid/invalid states
      // This prevents unnecessary regeneration while typing
      const hasValidContent = result.isValid && functionBody.trim();
      const isEmpty = !functionBody.trim();
      
      // Update prop value based on validation and content
      if (result.isValid) {
        if (hasValidContent) {
          // Function has content and is valid - store as FunctionPropValue
          const signature = getFunctionSignature();
          const functionPropValue = setFunctionSource(functionBody, signature);
          
          debugLog('FUNCTION_EDITOR', '✅ FunctionPropEditor: Setting function prop value for', prop.name, 'content:', functionBody);
          
          // Only call onChange if the function content actually changed
          if (functionBody !== lastSentFunctionBody) {
            debugLog('FUNCTION_EDITOR', '✅ FunctionPropEditor: Function content changed from', `"${lastSentFunctionBody}"`, 'to', `"${functionBody}"`);
            setLastSentFunctionBody(functionBody);
            onChangeRef.current(functionPropValue);
          } else {
            debugLog('FUNCTION_EDITOR', '⏭️  FunctionPropEditor: Skipping onChange - content unchanged');
          }
        } else {
          // Function is empty - remove it from props
          const shouldRemoveFunction = lastSentFunctionBody !== '' || value !== undefined;
          
          if (shouldRemoveFunction) {
            debugLog('FUNCTION_EDITOR', '🛠️ FunctionPropEditor: Removing function for', prop.name, '(empty)');
            setLastSentFunctionBody('');
            onChangeRef.current(undefined);
          } else {
            debugLog('FUNCTION_EDITOR', '🛠️ FunctionPropEditor: Skipping onChange - already empty');
          }
        }
      } else {
        // Invalid function - don't update props, just show validation error
        debugLog('FUNCTION_EDITOR', '🛠️ FunctionPropEditor: Function invalid for', prop.name, '- not updating props');
      }

      // Reset typing flag after validation completes
      setIsUserTyping(false);
    }, 1000); // 1 second debounce as requested

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      // Don't reset typing flag here - let the timer handle it
    };
  }, [functionBody, validateFunction, isInitialized, prop.name]);

  // Clear function - resets the function body and removes it from props
  const handleClearFunction = useCallback(() => {
    debugLog('FUNCTION_EDITOR', '🗑️ FunctionPropEditor: Clearing function for', prop.name);
    
    // Clear the function body - this will trigger the validation useEffect
    // which will automatically call onChange(undefined) when it sees empty content
    setFunctionBody('');
    
    // Reset other state immediately  
    setValidationResult({ isValid: true });
    setLastSentFunctionBody('');
    setIsUserTyping(false);
    
    debugLog('FUNCTION_EDITOR', '🗑️ FunctionPropEditor: Clear complete for', prop.name);
  }, [prop.name]);

  const signature = getFunctionSignature();
  const functionPreview = `(${signature.params}) => ${signature.returnType}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
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
            {!validationResult.isValid && (
              <p className="text-sm text-red-600 mb-2">
                {validationResult.error}
              </p>
            )}
            {!validationResult.isValid && (
              <p className="text-xs text-red-500">
                Note: This function will not appear in the generated code until fixed.
              </p>
            )}
            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <div className="space-y-1">
                {validationResult.warnings.map((warning, index) => (
                  <p key={index} className="text-sm text-yellow-700">
                    ⚠️ {warning}
                  </p>
                ))}
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
            <div className="text-gray-500">
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
    </div>
  );
} 