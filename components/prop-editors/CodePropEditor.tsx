'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  AlertTriangleIcon,
  CheckIcon,
  CodeIcon,
  Loader2,
  Trash2Icon,
  Wand2Icon,
} from 'lucide-react';
import { PropDefinition } from '@/lib/interfaces';
import { debugLog } from '@/lib/constants';
import { getFunctionSource, setFunctionSource, isFunctionPropValue } from '@/lib/utils/functionProps';
import { analyzeBody } from '@/lib/compile/transform';
import { resolveSignature, type FunctionSignature } from '@/lib/monaco/component-dts';
import { configureMonaco } from '@/lib/monaco/setup';
import { useTsDiagnostics } from '@/lib/monaco/useTsDiagnostics';
import { getPreloadedMonaco, isMonacoPreloaded } from '@/lib/monaco-preloader';

const Editor = dynamic(
  () => getPreloadedMonaco().then(module => ({ default: module.default })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[140px] bg-muted rounded border border-border">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">
            {isMonacoPreloaded() ? 'Initializing editor...' : 'Loading editor...'}
          </span>
        </div>
      </div>
    ),
  }
);

export type CodePropEditorMode = 'function' | 'component';

interface CodePropEditorProps {
  prop: PropDefinition;
  componentId?: string;
  value: any;
  onChange: (value: any) => void;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  mode: CodePropEditorMode;
}

type ApplyState =
  | { kind: 'empty' }
  | { kind: 'applied' }
  | { kind: 'plain-text' }
  | { kind: 'syntax-error'; message: string; line?: number };

const IDENTIFIER_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function buildShell(prop: PropDefinition, mode: CodePropEditorMode, signature: FunctionSignature) {
  const name = IDENTIFIER_RE.test(prop.name) ? prop.name : 'fn';
  if (mode === 'component') {
    return {
      header: `const ${name} = (): React.ReactNode => (`,
      footer: `);`,
    };
  }
  return {
    header: `const ${name} = (${signature.params}): ${signature.returnType} => {`,
    footer: `}`,
  };
}

function extractValueSource(value: any): string {
  if (isFunctionPropValue(value)) return value.source;
  if (typeof value === 'function') return getFunctionSource(value);
  if (typeof value === 'string') return value;
  return '';
}

/**
 * Monaco-powered editor shared by function and component (JSX) props.
 *
 * The model holds a typed shell — a read-only signature header and closing
 * footer around the editable body — so the Monaco TypeScript worker checks the
 * body against the prop's real parameter and return types. Validity comes from
 * worker diagnostics; the only thing that blocks applying a change is a syntax
 * error (semantic type errors apply, flagged in the status line).
 */
export default function CodePropEditor({
  prop,
  componentId,
  value,
  onChange,
  isExpanded,
  onToggleExpansion,
  mode,
}: CodePropEditorProps) {
  const signature = useMemo<FunctionSignature>(
    () =>
      mode === 'component'
        ? { params: '', returnType: 'React.ReactNode' }
        : resolveSignature(prop),
    [mode, prop]
  );
  const shell = useMemo(() => buildShell(prop, mode, signature), [prop, mode, signature]);
  const allowPlainText = mode === 'component' || prop.name === 'children';

  const [body, setBody] = useState<string>(() => extractValueSource(value));
  const [applyState, setApplyState] = useState<ApplyState>({ kind: 'empty' });
  const [isEditorReady, setIsEditorReady] = useState(false);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const guardRef = useRef(false);
  const decorationsRef = useRef<any>(null);
  const initializedRef = useRef(false);
  const lastSentBodyRef = useRef<string>(extractValueSource(value));
  const initialBodyRef = useRef<string>(extractValueSource(value));
  const bodyRef = useRef<string>(body);
  bodyRef.current = body;

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Diagnostics from the TS worker; the shell header is exactly one line.
  const { state: diagnostics, onValidate, markStale, attach } = useTsDiagnostics(1);

  const toModelText = useCallback(
    (source: string) => `${shell.header}\n${source || ''}\n${shell.footer}`,
    [shell]
  );

  const refreshShellDecorations = useCallback(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor?.getModel();
    if (!editor || !monaco || !model) return;
    const lineCount = model.getLineCount();
    const ranges = [
      { range: new monaco.Range(1, 1, 1, 1), options: { isWholeLine: true, className: 'code-shell-line' } },
      { range: new monaco.Range(lineCount, 1, lineCount, 1), options: { isWholeLine: true, className: 'code-shell-line' } },
    ];
    if (!decorationsRef.current) {
      decorationsRef.current = editor.createDecorationsCollection(ranges);
    } else {
      decorationsRef.current.set(ranges);
    }
  }, []);

  /** Push external source into the model (reset, clear, example switch). */
  const pushToModel = useCallback(
    (source: string) => {
      const editor = editorRef.current;
      const model = editor?.getModel();
      if (!model) return;
      guardRef.current = true;
      model.setValue(toModelText(source));
      guardRef.current = false;
      refreshShellDecorations();
      markStale();
    },
    [toModelText, refreshShellDecorations, markStale]
  );

  // External value changes (example selection, reset-to-defaults). Our own
  // onChange echoes back as `value` — skip those via lastSentBodyRef.
  useEffect(() => {
    const source = extractValueSource(value);
    if (source === lastSentBodyRef.current) return;
    lastSentBodyRef.current = source;
    setBody(source);
    if (isEditorReady) pushToModel(source);
  }, [value, isEditorReady, pushToModel]);

  // Debounced apply
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    const timer = setTimeout(() => {
      const current = bodyRef.current;

      if (!current.trim()) {
        setApplyState({ kind: 'empty' });
        if (lastSentBodyRef.current.trim()) {
          lastSentBodyRef.current = '';
          onChangeRef.current(undefined);
        }
        return;
      }

      const analysis = analyzeBody(current);
      if (analysis.kind === 'parse-error' && !allowPlainText) {
        debugLog('FUNCTION_EDITOR', `❌ [${prop.name}] syntax error — not applying`, analysis.error);
        setApplyState({
          kind: 'syntax-error',
          message: analysis.error?.message ?? 'Syntax error',
          line: analysis.error?.line,
        });
        return;
      }

      const isPlainText =
        allowPlainText &&
        (analysis.kind === 'parse-error' ||
          (analysis.kind === 'expression' && analysis.isBareIdentifier));

      setApplyState({ kind: isPlainText ? 'plain-text' : 'applied' });
      if (current !== lastSentBodyRef.current) {
        lastSentBodyRef.current = current;
        onChangeRef.current(setFunctionSource(current, signature));
      }

      // onValidate stays silent when the marker set didn't change (e.g.
      // clean→clean edits) — query the worker so 'checking' always resolves.
      if (editorRef.current && monacoRef.current) {
        attach(editorRef.current, monacoRef.current);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [body, allowPlainText, prop.name, signature, attach]);

  const handleMount = useCallback(
    (editor: any, monaco: any) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Model may be reused across mounts (path-keyed) — always sync content.
      guardRef.current = true;
      const expected = toModelText(bodyRef.current);
      if (editor.getModel()?.getValue() !== expected) {
        editor.getModel()?.setValue(expected);
      }
      guardRef.current = false;
      refreshShellDecorations();

      editor.onDidChangeModelContent(() => {
        if (guardRef.current) return;
        const model = editor.getModel();
        if (!model) return;

        const lineCount = model.getLineCount();
        const headerIntact = lineCount >= 3 && model.getLineContent(1) === shell.header;
        const footerIntact = lineCount >= 3 && model.getLineContent(lineCount) === shell.footer;

        if (!headerIntact || !footerIntact) {
          // The edit touched the protected shell — revert it.
          guardRef.current = true;
          editor.trigger('protected-shell', 'undo', null);
          const stillBroken =
            model.getLineCount() < 3 ||
            model.getLineContent(1) !== shell.header ||
            model.getLineContent(model.getLineCount()) !== shell.footer;
          if (stillBroken) {
            // Undo had nothing to revert (e.g. right after setValue) — rebuild.
            model.setValue(toModelText(bodyRef.current));
          }
          guardRef.current = false;
          refreshShellDecorations();
          return;
        }

        const nextBody = model.getValueInRange(
          new monacoRef.current.Range(2, 1, lineCount - 1, model.getLineMaxColumn(lineCount - 1))
        );
        refreshShellDecorations();
        markStale();
        setBody(nextBody);
      });

      // Select All selects only the editable body — selecting the protected
      // shell is never useful and would make the subsequent edit bounce.
      // (onKeyDown, not addCommand: addCommand keybindings live in a keybinding
      // service shared across editors, so the last-mounted editor would win.)
      editor.onKeyDown((e: any) => {
        if (!(e.ctrlKey || e.metaKey) || e.keyCode !== monaco.KeyCode.KeyA) return;
        const model = editor.getModel();
        if (!model) return;
        const lineCount = model.getLineCount();
        if (lineCount < 3) return;
        e.preventDefault();
        e.stopPropagation();
        editor.setSelection(
          new monaco.Range(2, 1, lineCount - 1, model.getLineMaxColumn(lineCount - 1))
        );
      });

      // Keep the caret out of the protected shell: clicking the header or
      // footer snaps it into the body (unless the user is selecting a range).
      editor.onDidChangeCursorPosition((e: any) => {
        if (guardRef.current) return;
        const model = editor.getModel();
        if (!model || !editor.getSelection()?.isEmpty()) return;
        const lineCount = model.getLineCount();
        if (lineCount < 3) return;
        if (e.position.lineNumber === 1) {
          editor.setPosition({ lineNumber: 2, column: 1 });
        } else if (e.position.lineNumber === lineCount) {
          const bodyLine = lineCount - 1;
          editor.setPosition({ lineNumber: bodyLine, column: model.getLineMaxColumn(bodyLine) });
        }
      });

      // Place the cursor at the start of the body, not the header.
      editor.setPosition({ lineNumber: 2, column: 1 });

      setIsEditorReady(true);
      attach(editor, monaco);
    },
    [toModelText, shell, refreshShellDecorations, markStale, attach]
  );

  const handleClear = useCallback(() => {
    setBody('');
    pushToModel('');
  }, [pushToModel]);

  const handleReset = useCallback(() => {
    const initial = initialBodyRef.current;
    setBody(initial);
    pushToModel(initial);
  }, [pushToModel]);

  const handleFormat = useCallback(async () => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor?.getModel();
    if (!editor || !monaco || !model) return;
    const lineCount = model.getLineCount();
    if (lineCount < 3) return;
    editor.setSelection(
      new monaco.Range(2, 1, lineCount - 1, model.getLineMaxColumn(lineCount - 1))
    );
    await editor.getAction('editor.action.formatSelection')?.run();
  }, []);

  const modelPath = `file:///playground/${componentId ?? 'shared'}/props/${prop.name}.${mode}.tsx`;
  const signaturePreview =
    mode === 'component' ? 'React.ReactNode' : `(${signature.params}) => ${signature.returnType}`;
  const hasContent = body.trim().length > 0;
  const isDirty = body !== initialBodyRef.current;
  const statusTestId = mode === 'component' ? 'component-prop-status' : 'function-prop-status';

  const showTypeErrors = applyState.kind === 'applied' && diagnostics.status === 'errors';
  const firstError =
    applyState.kind === 'syntax-error'
      ? { message: applyState.message, line: applyState.line }
      : diagnostics.errors[0];

  const statusIcon =
    applyState.kind === 'syntax-error' ? (
      <AlertTriangleIcon className="w-4 h-4 text-destructive" />
    ) : hasContent && diagnostics.status === 'checking' ? (
      <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
    ) : showTypeErrors ? (
      <AlertTriangleIcon className="w-4 h-4 text-amber-500" />
    ) : (
      <CheckIcon className="w-4 h-4 text-foreground" />
    );

  return (
    <div className="border border-border rounded-lg" data-testid={`prop-control-${prop.name}`}>
      <div className="flex items-center justify-between bg-muted p-3">
        <div className="flex items-center space-x-2">
          <label className="block text-sm font-medium text-foreground">
            {prop.name}
            {prop.required && <span className="text-destructive ml-1">*</span>}
            {prop.functionSignature && (
              <span className="ml-2 text-xs text-primary bg-primary/10 px-1 rounded">typed</span>
            )}
          </label>
          <div className="flex items-center space-x-2">
            <span
              className="text-xs text-muted-foreground px-2 py-1 rounded font-mono max-w-xs truncate"
              title={signaturePreview}
            >
              {signaturePreview}
            </span>
            {statusIcon}
          </div>
        </div>
      </div>

      <div className="border border-input overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center space-x-2">
            <CodeIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {mode === 'component' ? 'Component JSX' : 'Function Editor'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {hasContent && (
              <button
                onClick={handleFormat}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center space-x-1 px-2 py-1 rounded hover:bg-muted/80 transition-colors"
                title="Format code"
              >
                <Wand2Icon className="w-3 h-3" />
                <span>Format</span>
              </button>
            )}
            {hasContent && (
              <button
                onClick={handleClear}
                className="text-xs text-destructive hover:text-destructive/90 flex items-center space-x-1 px-2 py-1 rounded hover:bg-destructive/10 transition-colors"
                title="Clear code"
              >
                <Trash2Icon className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
            {isDirty && (
              <button
                onClick={handleReset}
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

        <div className="relative">
          <Editor
            height={isExpanded ? '400px' : '160px'}
            language="typescript"
            path={modelPath}
            defaultValue={toModelText(body)}
            onValidate={onValidate}
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
              quickSuggestions: { other: true, comments: false, strings: false },
              suggestOnTriggerCharacters: true,
              tabSize: 2,
              insertSpaces: true,
              scrollbar: { alwaysConsumeMouseWheel: false },
            }}
            beforeMount={configureMonaco}
            onMount={handleMount}
          />
        </div>

        {/* Status footer */}
        <div className="px-3 py-2 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <div className="text-muted-foreground" data-testid={statusTestId}>
              Status:{' '}
              {applyState.kind === 'syntax-error' ? (
                <span className="text-destructive font-medium">
                  ❌ Not applied — syntax error
                  {firstError?.line ? ` (line ${firstError.line})` : ''}: {firstError?.message}
                </span>
              ) : !hasContent ? (
                <span className="text-muted-foreground font-medium">
                  📝 Empty - will not appear in generated code
                </span>
              ) : applyState.kind === 'plain-text' ? (
                <span className="text-foreground font-medium">
                  ✅ Applied as plain text
                </span>
              ) : diagnostics.status === 'checking' ? (
                <span className="text-muted-foreground font-medium">Checking types…</span>
              ) : showTypeErrors ? (
                <span className="text-amber-600 dark:text-amber-500 font-medium">
                  ⚠️ Applied with {diagnostics.errors.length} type error
                  {diagnostics.errors.length > 1 ? 's' : ''}
                  {firstError ? ` — line ${firstError.line}: ${firstError.message}` : ''}
                </span>
              ) : (
                <span className="text-foreground font-medium">
                  ✅ Valid - will appear in generated code
                </span>
              )}
            </div>
            <div className="text-muted-foreground whitespace-nowrap pl-3">
              {body === '' ? 1 : body.split('\n').length} lines
            </div>
          </div>
        </div>
      </div>

      {(prop.description || (mode === 'function' && prop.functionSignature)) && (
        <div className="text-xs text-muted-foreground p-2 rounded space-y-1">
          {prop.description && (
            <div>
              <strong>Description:</strong> {prop.description}
            </div>
          )}
          {mode === 'component' && (
            <div>Write JSX directly, without <code>return</code> or a function wrapper.</div>
          )}
          {mode === 'function' && prop.functionSignature && (
            <div>
              <strong>Function Signature:</strong>
              <div className="font-mono text-xs mt-1 p-2 bg-card rounded border border-border">
                ({prop.functionSignature.params}) =&gt; {prop.functionSignature.returnType}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
