'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { PropDefinition } from '@/lib/interfaces';
import { AlertTriangleIcon, CheckIcon, CodeIcon, Trash2Icon, PencilIcon, Loader2 } from 'lucide-react';
import { parse as babelParse, ParserOptions } from '@babel/parser';
import { debugLog } from '@/lib/constants';
import { FunctionPropValue } from '@/lib/interfaces';
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
import { getPreloadedMonaco, isMonacoPreloaded } from '@/lib/monaco-preloader';

// Use preloaded Monaco Editor if available, otherwise load dynamically
const Editor = dynamic(
  () => getPreloadedMonaco().then(module => ({ default: module.default })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[120px] bg-muted rounded border border-border">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">
            {isMonacoPreloaded() ? 'Initializing editor...' : 'Loading editor...'}
          </span>
        </div>
      </div>
    )
  }
);

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
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const observerRef = useRef<MutationObserver | null>(null);
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
  const [initialFunctionBody, setInitialFunctionBody] = useState<string>('');
  
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
      setInitialFunctionBody(source);
      setLastSentFunctionBody(source);
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
  }, [functionBody, getFunctionSignature, isInitialized, lastSentFunctionBody, prop.name, value]);

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

  // Reset function - restores the initial/default value seen on mount
  const handleResetFunction = useCallback(() => {
    debugLog('FUNCTION_EDITOR', '🔄 FunctionPropEditor: Resetting function for', prop.name);

    setFunctionBody(initialFunctionBody || '');
    setLastSentFunctionBody(initialFunctionBody || '');
    setIsUserTyping(false);

    if (initialFunctionBody && initialFunctionBody.trim()) {
      const signature = getFunctionSignature();
      const functionPropValue = setFunctionSource(initialFunctionBody, signature);
      onChangeRef.current(functionPropValue);
    } else {
      onChangeRef.current(undefined);
    }
  }, [getFunctionSignature, initialFunctionBody, prop.name]);

  const signature = getFunctionSignature();
  const functionPreview = `(${signature.params}) => ${signature.returnType}`;

  return (
    <div
      className="border border-border rounded-lg"
      data-testid={`prop-control-${prop.name}`}
    >
      <div
        className="flex items-center justify-between bg-muted p-3 cursor-pointer"
      >
        <div className="flex items-center space-x-2">
          <label className="block text-sm font-medium text-foreground">
            {prop.name}
            {prop.required && <span className="text-destructive ml-1">*</span>}
            {prop.functionSignature && (
              <span className="ml-2 text-xs text-primary bg-primary/10 px-1 rounded">
                typed
              </span>
            )}
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground px-2 py-1 rounded font-mono max-w-xs truncate" title={functionPreview}>
              {functionPreview}
            </span>
            {isValidating ? (
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            ) : validationResult.isValid ? (
              <CheckIcon className="w-4 h-4 text-foreground" />
            ) : (
              <AlertTriangleIcon className="w-4 h-4 text-destructive" />
            )}
          </div>
        </div>
      </div>

      <div className="border border-input overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center space-x-2">
            <CodeIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Function Editor</span>
          </div>
          <div className="flex items-center space-x-2">
            {functionBody.trim() && (
              <button
                onClick={handleClearFunction}
                className="text-xs text-destructive hover:text-destructive/90 flex items-center space-x-1 px-2 py-1 rounded hover:bg-destructive/10 transition-colors"
                title="Clear function"
              >
                <Trash2Icon className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
            {initialFunctionBody !== functionBody && (
              <button
                onClick={handleResetFunction}
                className="text-xs text-primary hover:text-primary/90 flex items-center space-x-1 px-2 py-1 rounded hover:bg-primary/10 transition-colors"
                title="Reset to initial value"
              >
                <span>Reset</span>
              </button>
            )}
            <button
              onClick={onToggleExpansion}
              className="text-xs text-primary hover:text-primary/90 px-2 py-1 rounded hover:bg-primary/10 transition-colors"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>

        {/* Validation Status and Warnings */}
        {(!validationResult.isValid || (validationResult.warnings && validationResult.warnings.length > 0)) && (
          <div className="px-3 py-2 bg-accent border-b border-border">
            {!validationResult.isValid && (
              <div className="flex items-center space-x-2 text-destructive mb-2">
                <AlertTriangleIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Function Invalid</span>
              </div>
            )}
            {!validationResult.isValid && validationResult.errors.length > 0 && (
              <ul className="text-sm text-destructive mb-2 list-disc pl-5 space-y-1">
                {validationResult.errors.map((error, index) => (
                  <li key={index}>
                    {error.message} (line: {error.line})
                  </li>
                ))}
              </ul>
            )}
            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 text-accent-foreground mb-1">
                  <AlertTriangleIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Warnings</span>
                </div>
                <ul className="text-sm text-accent-foreground list-disc pl-5 space-y-1">
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

              // Define light and dark themes
              monaco.editor.defineTheme('function-editor-light', {
                base: 'vs',
                inherit: true,
                rules: [],
                colors: {
                  'editor.background': '#f8fafc',
                  'editor.lineHighlightBackground': '#f1f5f9',
                  'editorLineNumber.foreground': '#94a3b8',
                },
              });
              monaco.editor.defineTheme('function-editor-dark', {
                base: 'vs-dark',
                inherit: true,
                rules: [],
                colors: {
                  'editor.background': '#0b0f19',
                  'editor.lineHighlightBackground': '#111827',
                  'editorLineNumber.foreground': '#6b7280',
                },
              });
            }}
            onMount={(editor, monaco) => {
              editorRef.current = editor;
              monacoRef.current = monaco;
              const applyTheme = () => {
                const isDark = document.documentElement.classList.contains('dark');
                monaco.editor.setTheme(isDark ? 'function-editor-dark' : 'function-editor-light');
              };
              applyTheme();
              // Observe dark mode class changes
              const observer = new MutationObserver(applyTheme);
              observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
              observerRef.current = observer;
            }}
          />
        </div>

        {/* Status Footer */}
        <div className="px-3 py-2 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <div className="text-muted-foreground" data-testid="function-prop-status">
              Status: {isUserTyping ? (
                <span className="text-primary font-medium">✏️ Typing... (validation paused)</span>
              ) : validationResult.isValid ? (
                functionBody.trim() ? (
                  validationResult.warnings && validationResult.warnings.length > 0 ? (
                    <span className="text-accent-foreground font-medium">⚠️ Valid with warnings - will appear in generated code</span>
                  ) : (
                    <span className="text-foreground font-medium">✅ Valid function - will appear in generated code</span>
                  )
                ) : (
                  <span className="text-muted-foreground font-medium">📝 Empty function - will not appear in generated code</span>
                )
              ) : (
                <span className="text-destructive font-medium">❌ Invalid function - will not appear in generated code</span>
              )}
            </div>
            <div className="text-muted-foreground">
              {functionBody.split('\n').length} lines
              {validationResult.warnings && validationResult.warnings.length > 0 && (
                <span className="ml-2 text-accent-foreground">({validationResult.warnings.length} warning{validationResult.warnings.length > 1 ? 's' : ''})</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {(prop.description || prop.functionSignature) && (
        <div className="text-xs text-muted-foreground p-2 rounded space-y-1">
          {prop.description && (
            <div>
              <strong>Description:</strong> {prop.description}
            </div>
          )}
          {prop.functionSignature && (
            <div>
              <strong>Function Signature:</strong>
              <div className="font-mono text-xs mt-1 p-2 bg-card rounded border border-border">
                ({prop.functionSignature.params}) =&gt; {prop.functionSignature.returnType}
              </div>
            </div>
          )}
        </div>
      )}

      {isExpanded && (
        <div className="p-3 border-t border-border">
          <div
            className="text-xs text-muted-foreground mb-2"
          >
            {validationResult.isValid ? (
              <span className="text-foreground font-medium">✅ Valid function</span>
            ) : (
              <span className="text-destructive font-medium">❌ Invalid function</span>
            )}
          </div>
          <div className="text-muted-foreground">
            {functionBody.split('\n').length} lines
            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <span className="ml-2 text-accent-foreground">({validationResult.warnings.length} warning{validationResult.warnings.length > 1 ? 's' : ''})</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 