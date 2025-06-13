'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { PropDefinition } from '@/types';
import { AlertTriangleIcon, CheckIcon, CodeIcon, Trash2Icon } from 'lucide-react';
import { parse } from 'acorn';
import { simple as walkSimple } from 'acorn-walk';
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
    const source = getFunctionSource(value);
    setFunctionBody(source);
    
    // Mark as initialized after processing the value
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [value, isInitialized, prop.name]);

      // Professional validation using Acorn AST parser
  const validateFunction = useCallback((code: string): ValidationResult => {
    if (!code.trim()) {
      return { isValid: true }; // Empty is valid (will clear the function)
    }

    // 1. SECURITY VALIDATION - Block dangerous patterns
    const securityPatterns = [
      { pattern: /\beval\s*\(/, message: "eval() is not allowed for security reasons" },
      { pattern: /\bFunction\s*\(/, message: "Function constructor is not allowed for security reasons" },
      { pattern: /\bnew\s+Function\s*\(/, message: "new Function() is not allowed for security reasons" },
      { pattern: /\bdocument\.cookie/, message: "Accessing document.cookie is not allowed" },
      { pattern: /\blocalStorage\s*\./, message: "Accessing localStorage directly is not recommended" },
      { pattern: /\bsessionStorage\s*\./, message: "Accessing sessionStorage directly is not recommended" },
      { pattern: /\bwindow\s*\.\s*location/, message: "Modifying window.location is not allowed" },
      { pattern: /\b(import|require)\s*\(/, message: "Dynamic imports are not allowed" },
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
      
      // 3. SYNTAX VALIDATION using Acorn AST parser
      let ast;
      try {
        // For JSX content, skip AST parsing entirely and use simple validation
        if (code.includes('<') && code.includes('>')) {
          // This looks like JSX, so we'll do a simpler validation
          // Just check for basic syntax issues without full parsing
          const jsxValidationErrors = [];
          
          // Check for unmatched brackets
          const openBrackets = (code.match(/</g) || []).length;
          const closeBrackets = (code.match(/>/g) || []).length;
          if (openBrackets !== closeBrackets) {
            jsxValidationErrors.push('Unmatched JSX brackets');
          }
          
          // Check for unmatched braces
          const openBraces = (code.match(/\{/g) || []).length;
          const closeBraces = (code.match(/\}/g) || []).length;
          if (openBraces !== closeBraces) {
            jsxValidationErrors.push('Unmatched braces in JSX');
          }
          
          // Check for unmatched parentheses
          const openParens = (code.match(/\(/g) || []).length;
          const closeParens = (code.match(/\)/g) || []).length;
          if (openParens !== closeParens) {
            jsxValidationErrors.push('Unmatched parentheses in JSX');
          }
          
          if (jsxValidationErrors.length > 0) {
            return {
              isValid: false,
              error: `JSX syntax error: ${jsxValidationErrors.join(', ')}`
            };
          }
          
          // If basic JSX validation passes, skip AST validation and proceed
          ast = null;
        } else {
          // For non-JSX content, use normal AST parsing
          ast = parse(fullFunction, { 
            ecmaVersion: 2020, 
            sourceType: 'script',
            locations: false // We don't need location info for validation
          });
        }
      } catch (parseError) {
        return {
          isValid: false,
          error: `Syntax error: ${parseError instanceof Error ? parseError.message : 'Invalid JavaScript'}`
        };
      }

      // 4. VARIABLE SCOPE ANALYSIS using AST (skip if JSX detected)
      const warnings: string[] = [];
      const undefinedVars = new Set<string>();
      
      if (ast) {
        // Define allowed global variables
        const allowedGlobals = new Set([
          // JavaScript built-ins
          'console', 'Math', 'Date', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean',
          'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent',
          'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Promise',
          // Literals and special values
          'undefined', 'null', 'NaN', 'Infinity',
          // Common parameters (these should mainly come from function parameters, not globals)
          'value', 'data', 'index', 'item', 'error', 'response', 'result',
          'props', 'state', 'ref', 'key',
          // Note: 'event' removed from globals since it should be a parameter
        ]);

        // Add function parameters to allowed globals
        const params = signature.params.split(',').map(p => p.trim().split(/\s+/).pop() || '').filter(Boolean);
        params.forEach(param => allowedGlobals.add(param));

        // Walk the AST to find undefined variables
        walkSimple(ast, {
          Identifier(node: any) {
            const name = node.name;
            
            // Skip if it's an allowed global
            if (allowedGlobals.has(name)) return;
            
            // Skip if it's a property access (will be handled by MemberExpression)
            // This is a simple heuristic - Acorn gives us proper context
            undefinedVars.add(name);
          },
          
          MemberExpression(node: any) {
            // Remove the object from undefined vars if it's a member expression
            // e.g., in "console.log", "console" is not undefined
            if (node.object && node.object.type === 'Identifier') {
              const objectName = node.object.name;
              if (allowedGlobals.has(objectName)) {
                // It's a known global, so this is fine
                undefinedVars.delete(objectName);
              }
            }
          }
        });

        // Process undefined variables
        Array.from(undefinedVars).forEach(varName => {
          // Single character variables (except common loop vars) are likely typos - make them errors
          if (/^[a-z]$/.test(varName) && !['i', 'j', 'x', 'y', 'n'].includes(varName)) {
            warnings.push(`BLOCKING: Undefined variable '${varName}' - this looks like a typo. Did you mean 'event' or another variable?`);
            return;
          }
          
          // Other undefined variables are warnings
          warnings.push(`Unknown variable '${varName}' - this may cause runtime errors`);
        });

        // Check for blocking errors after processing all variables
        const blockingErrors = warnings.filter(w => w.startsWith('BLOCKING:'));
        if (blockingErrors.length > 0) {
          return {
            isValid: false,
            error: blockingErrors[0].replace('BLOCKING: ', '')
          };
        }
      }

      // 5. SIMPLE EXPRESSION VALIDATION
      const trimmedCode = code.trim();
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(trimmedCode) && undefinedVars.has(trimmedCode)) {
        return {
          isValid: false,
          error: `Undefined variable '${trimmedCode}'. Did you mean to call a function like '${trimmedCode}()' or access a property like 'event.${trimmedCode}'?`
        };
      }

      // 6. RETURN TYPE VALIDATION (warnings only, skip if no AST)
      if (ast && signature.returnType !== 'any' && signature.returnType !== 'void') {
        walkSimple(ast, {
          ReturnStatement(node: any) {
            if (node.argument) {
              // This is a simplified check - in a real implementation you'd evaluate the expression type
              const returnValueSource = code.slice(node.argument.start, node.argument.end);
              
              if (signature.returnType === 'boolean') {
                if (/^["'`]/.test(returnValueSource) || /^\d+(\.\d+)?$/.test(returnValueSource)) {
                  warnings.push(`Expected boolean return, but found: ${returnValueSource}`);
                }
              } else if (signature.returnType === 'string') {
                if (/^(true|false|\d+(\.\d+)?|null|undefined)$/.test(returnValueSource)) {
                  warnings.push(`Expected string return, but found: ${returnValueSource}`);
                }
              } else if (signature.returnType === 'number') {
                if (/^(true|false|["'`].*["'`]|null|undefined)$/.test(returnValueSource)) {
                  warnings.push(`Expected number return, but found: ${returnValueSource}`);
                }
              }
            }
          }
        });
      }

      // Create the actual function without executing it (skip for JSX)
      if (ast) {
        // Only create function for non-JSX content
        const actualFunction = new Function('return ' + fullFunction)();
        
        // Add debugging to track where execution comes from
        const wrappedFunction = (...args: any[]) => {
          debugLog('FUNCTION_EDITOR', `🚀 FUNCTION CALLED: ${prop.name} with args:`, args);
          if (process.env.NODE_ENV === 'development') {
            console.trace('Function call stack:');
          }
          return actualFunction(...args);
        };
        
        // Copy properties to maintain function identity
        Object.defineProperty(wrappedFunction, 'name', { value: actualFunction.name });
        (wrappedFunction as any).__originalSource = code;
        (wrappedFunction as any).__propName = prop.name;
        
        return {
          isValid: true,
          compiledFunction: wrappedFunction,
          warnings: warnings.length > 0 ? warnings : undefined
        };
      } else {
        // For JSX content, return valid without compiled function
        // The actual function will be created later by functionPropValueToFunction
        return {
          isValid: true,
          warnings: warnings.length > 0 ? warnings : undefined
        };
      }
      
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Validation error'
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

      {prop.description && (
        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
          <strong>Description:</strong> {prop.description}
        </div>
      )}
    </div>
  );
} 