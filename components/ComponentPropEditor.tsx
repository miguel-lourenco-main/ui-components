'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { AlertTriangleIcon, CheckIcon, CodeIcon, Trash2Icon, Loader2 } from 'lucide-react';
import { PropDefinition, FunctionPropValue } from '@/lib/interfaces';
import { debugLog } from '@/lib/constants';
import { 
  isFunctionPropValue, 
  setFunctionSource,
} from '@/lib/utils/functionProps';
import { 
  validateComponentPropCode,
  getValidationSummary,
  ValidationResult,
  getMonacoLanguage,
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

interface ComponentPropEditorProps {
  prop: PropDefinition;
  value: any;
  onChange: (value: any) => void;
  isExpanded: boolean;
  onToggleExpansion: () => void;
}

/**
 * ComponentPropEditor
 *
 * Editor for "component" props where the user writes JSX/TSX directly (no function wrapper).
 * Internally we still store the value as a FunctionPropValue to reuse the existing runtime pipeline.
 */
export default function ComponentPropEditor({
  prop,
  value,
  onChange,
  isExpanded,
  onToggleExpansion,
}: ComponentPropEditorProps) {
  const [componentSource, setComponentSource] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
    language: 'tsx',
  });
  const [isValidating, setIsValidating] = useState(false);
  const [lastSentSource, setLastSentSource] = useState<string>('');

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);

  // Use ref to store current onChange to avoid dependency loops
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Initialize editor content from current value
  useEffect(() => {
    let initialSource = '';

    if (isFunctionPropValue(value)) {
      initialSource = value.source || '';
    } else if (typeof value === 'string') {
      initialSource = value;
    }

    debugLog('FUNCTION_EDITOR', `[${prop.name}] (component) initializing with source:`, initialSource);
    setComponentSource(initialSource);

    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [value, isInitialized, prop.name]);

  // Debounced validation and value propagation
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const timer = setTimeout(() => {
      const runValidation = async () => {
        setIsValidating(true);
        debugLog(
          'FUNCTION_EDITOR',
          `🛠️ Validating component prop "${prop.name}" with content:`,
          componentSource.substring(0, 80)
        );

        const validation = await validateComponentPropCode(
          componentSource,
          prop.name,
          prop
        );
        setValidationResult(validation);
        setIsValidating(false);
        setIsUserTyping(false);

        debugLog(
          'FUNCTION_EDITOR',
          '🛠️ Validation result for',
          prop.name,
          ':',
          getValidationSummary(validation)
        );

        if (validation.isValid) {
          if (componentSource.trim()) {
            const componentValue: FunctionPropValue = setFunctionSource(componentSource, {
              params: '',
              returnType: 'React.ReactNode',
            });

            if (componentSource !== lastSentSource) {
              debugLog(
                'FUNCTION_EDITOR',
                '✅ ComponentPropEditor: Content valid and changed for',
                prop.name,
                '- updating props.'
              );
              setLastSentSource(componentSource);
              onChangeRef.current(componentValue);
            }
          } else {
            // Empty input removes the prop
            if (value !== undefined) {
              debugLog(
                'FUNCTION_EDITOR',
                '🗑️ ComponentPropEditor: Content empty for',
                prop.name,
                '- removing prop.'
              );
              setLastSentSource('');
              onChangeRef.current(undefined);
            }
          }
        } else {
          debugLog(
            'FUNCTION_EDITOR',
            '❌ ComponentPropEditor: Content invalid for',
            prop.name,
            '- not updating props.'
          );
        }
      };

      runValidation();
    }, 500);

    return () => clearTimeout(timer);
  }, [componentSource, isInitialized, lastSentSource, prop, value]);

  // Clear component JSX - resets the editor and removes the value from props
  const handleClearComponent = useCallback(() => {
    debugLog('FUNCTION_EDITOR', '🗑️ Clearing component JSX for', prop.name);

    setComponentSource('');
    setValidationResult({
      isValid: true,
      errors: [],
      warnings: [],
      language: 'tsx',
    });
    setLastSentSource('');
    setIsUserTyping(false);
  }, [prop.name]);

  const monacoLanguage = getMonacoLanguage(validationResult);

  return (
    <div
      className="border border-border rounded-lg"
      data-testid={`prop-control-${prop.name}`}
    >
      <div className="flex items-center justify-between bg-muted p-3 cursor-pointer">
        <div className="flex items-center space-x-2">
          <label className="block text-sm font-medium text-foreground">
            {prop.name}
            {prop.required && <span className="text-destructive ml-1">*</span>}
          </label>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            React.ReactNode
          </span>
        </div>
      </div>

      <div className="border border-input overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center space-x-2">
            <CodeIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Component JSX
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {componentSource.trim() && (
              <button
                onClick={handleClearComponent}
                className="text-xs text-destructive hover:text-destructive/90 flex items-center space-x-1 px-2 py-1 rounded hover:bg-destructive/10 transition-colors"
                title="Clear component"
              >
                <Trash2Icon className="w-3 h-3" />
                <span>Clear</span>
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
        {(!validationResult.isValid ||
          (validationResult.warnings && validationResult.warnings.length > 0)) && (
          <div className="px-3 py-2 bg-accent border-b border-border">
            {!validationResult.isValid && (
              <div className="flex items-center space-x-2 text-destructive mb-2">
                <AlertTriangleIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Component JSX Invalid</span>
              </div>
            )}
            {!validationResult.isValid &&
              validationResult.errors.length > 0 && (
                <ul className="text-sm text-destructive mb-2 list-disc pl-5 space-y-1">
                  {validationResult.errors.map((error, index) => (
                    <li key={index}>
                      {error.message} (line: {error.line})
                    </li>
                  ))}
                </ul>
              )}
            {validationResult.warnings &&
              validationResult.warnings.length > 0 && (
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
            language={monacoLanguage}
            value={componentSource}
            onChange={(value) => {
              setIsUserTyping(true);
              setComponentSource(value || '');
            }}
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
              // Configure TypeScript/TSX compiler options
              monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.Latest,
                allowNonTsExtensions: true,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                module: monaco.languages.typescript.ModuleKind.CommonJS,
                noEmit: true,
                esModuleInterop: true,
                allowJs: true,
                jsx: monaco.languages.typescript.JsxEmit.React,
                jsxFactory: 'React.createElement',
                jsxFragmentFactory: 'React.Fragment',
                strict: false,
              });

              // Define light and dark themes
              monaco.editor.defineTheme('component-editor-light', {
                base: 'vs',
                inherit: true,
                rules: [],
                colors: {
                  'editor.background': '#f8fafc',
                  'editor.lineHighlightBackground': '#f1f5f9',
                  'editorLineNumber.foreground': '#94a3b8',
                },
              });
              monaco.editor.defineTheme('component-editor-dark', {
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
                monaco.editor.setTheme(
                  isDark ? 'component-editor-dark' : 'component-editor-light'
                );
              };
              applyTheme();
              // Observe dark mode class changes
              const observer = new MutationObserver(applyTheme);
              observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class'],
              });
              observerRef.current = observer;
            }}
          />
        </div>

        {/* Status Footer */}
        <div className="px-3 py-2 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <div className="text-muted-foreground" data-testid="component-prop-status">
              Status:{' '}
              {isUserTyping ? (
                <span className="text-primary font-medium">
                  ✏️ Typing... (validation paused)
                </span>
              ) : validationResult.isValid ? (
                componentSource.trim() ? (
                  validationResult.warnings &&
                  validationResult.warnings.length > 0 ? (
                    <span className="text-accent-foreground font-medium">
                      ⚠️ Valid with warnings - will appear in generated code
                    </span>
                  ) : (
                    <span className="text-foreground font-medium">
                      ✅ Valid component - will appear in generated code
                    </span>
                  )
                ) : (
                  <span className="text-muted-foreground font-medium">
                    📝 Empty component - will not appear in generated code
                  </span>
                )
              ) : (
                <span className="text-destructive font-medium">
                  ❌ Invalid component - will not appear in generated code
                </span>
              )}
            </div>
            <div className="text-muted-foreground">
              {componentSource.split('\n').length} lines
              {validationResult.warnings &&
                validationResult.warnings.length > 0 && (
                  <span className="ml-2 text-accent-foreground">
                    ({validationResult.warnings.length}{' '}
                    warning{validationResult.warnings.length > 1 ? 's' : ''})
                  </span>
                )}
            </div>
          </div>
        </div>
      </div>

      {prop.description && (
        <div className="text-xs text-muted-foreground p-2 rounded space-y-1">
          <div>
            <strong>Description:</strong> {prop.description}
          </div>
          <div className="text-xs text-muted-foreground">
            Write JSX directly, without <code>return</code> or a function wrapper.
          </div>
        </div>
      )}
    </div>
  );
}


