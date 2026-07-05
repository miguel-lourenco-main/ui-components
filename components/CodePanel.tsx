'use client';

import { useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { CodeIcon, CopyIcon, DownloadIcon, Loader2, PencilIcon, Undo2Icon, Wand2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { FullComponentInfo } from '@/lib/interfaces';
import { getPreloadedMonaco, isMonacoPreloaded } from '@/lib/monaco-preloader';
import { configureMonaco } from '@/lib/monaco/setup';
import { registerComponentDts } from '@/lib/monaco/component-dts';
import { cn } from '@/lib/utils';

const Editor = dynamic(
  () => getPreloadedMonaco().then(module => ({ default: module.default })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-muted">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">
            {isMonacoPreloaded() ? 'Initializing code editor...' : 'Loading code editor...'}
          </span>
        </div>
      </div>
    ),
  }
);

interface CodePanelProps {
  component: FullComponentInfo | null;
  generatedCode: string;
  codeMode: 'props' | 'code';
  customCode: string;
  onEnterCodeMode: () => void;
  onUpdateCustomCode: (code: string) => void;
  onExitCodeMode: () => void;
}

/**
 * Center-bottom code panel. "View" shows the generated usage + implementation
 * (read-only); "Edit Live" forks the usage into an editable TSX module that
 * drives the live preview. Editing is a one-way fork — Reset (or picking a
 * component/example) returns to the props-driven preview.
 */
export default function CodePanel({
  component,
  generatedCode,
  codeMode,
  customCode,
  onEnterCodeMode,
  onUpdateCustomCode,
  onExitCodeMode,
}: CodePanelProps) {
  const editorRef = useRef<any>(null);
  const isEditing = codeMode === 'code';
  const activeCode = isEditing ? customCode : generatedCode;

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(activeCode);
      toast.success('Code copied to clipboard');
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, [activeCode]);

  const downloadCode = useCallback(() => {
    const blob = new Blob([activeCode], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'component.tsx';
    a.click();
    URL.revokeObjectURL(url);
  }, [activeCode]);

  const formatCode = useCallback(async () => {
    await editorRef.current?.getAction('editor.action.formatDocument')?.run();
  }, []);

  const sharedOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on' as const,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on' as const,
    wrappingIndent: 'indent' as const,
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: true, indentation: true },
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-background border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <CodeIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Component Code</span>
          </div>

          {/* Mode tabs */}
          <div className="flex items-center rounded-md border border-border overflow-hidden" data-testid="code-mode-tabs">
            <button
              onClick={onExitCodeMode}
              className={cn(
                'px-3 py-1 text-xs transition-colors',
                !isEditing
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              data-testid="code-tab-view"
            >
              View
            </button>
            <button
              onClick={() => {
                if (!isEditing && component) onEnterCodeMode();
              }}
              disabled={!component}
              className={cn(
                'px-3 py-1 text-xs transition-colors flex items-center space-x-1',
                isEditing
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              data-testid="code-tab-edit"
            >
              <PencilIcon className="w-3 h-3" />
              <span>Edit Live</span>
            </button>
          </div>

          {isEditing && (
            <span className="text-xs text-amber-600 dark:text-amber-500">
              Code drives the preview — props panel is paused
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {isEditing && (
            <>
              <button
                onClick={formatCode}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded"
                title="Format code"
              >
                <Wand2Icon className="w-4 h-4" />
                <span>Format</span>
              </button>
              <button
                onClick={onExitCodeMode}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded"
                title="Discard the fork and return to the props-driven preview"
                data-testid="code-reset-to-props"
              >
                <Undo2Icon className="w-4 h-4" />
                <span>Reset to props</span>
              </button>
            </>
          )}
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded"
            title="Copy to clipboard"
          >
            <CopyIcon className="w-4 h-4" />
            <span>Copy</span>
          </button>
          <button
            onClick={downloadCode}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded"
            title="Download code"
          >
            <DownloadIcon className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1" data-testid={isEditing ? 'code-editor-live' : 'code-editor-view'}>
        {isEditing ? (
          <Editor
            height="100%"
            language="typescript"
            path="file:///playground/main.tsx"
            defaultValue={customCode}
            onChange={(value) => onUpdateCustomCode(value ?? '')}
            beforeMount={configureMonaco}
            onMount={(editor: any, monaco: any) => {
              editorRef.current = editor;
              if (component) registerComponentDts(monaco, component);
              // The path-keyed model persists across forks — sync it.
              if (editor.getModel()?.getValue() !== customCode) {
                editor.getModel()?.setValue(customCode);
              }
            }}
            options={{
              ...sharedOptions,
              readOnly: false,
              contextmenu: true,
              quickSuggestions: { other: true, comments: false, strings: false },
              suggestOnTriggerCharacters: true,
              folding: true,
            }}
          />
        ) : (
          <Editor
            height="100%"
            language="typescript"
            path="file:///playground/generated.view.tsx"
            value={generatedCode}
            beforeMount={configureMonaco}
            options={{
              ...sharedOptions,
              readOnly: true,
              folding: true,
              showFoldingControls: 'always',
              contextmenu: false,
              quickSuggestions: { other: 'off' as const, comments: 'off' as const, strings: 'off' as const },
              hover: { enabled: true },
              selectionHighlight: false,
              occurrencesHighlight: 'off' as const,
              cursorStyle: 'line-thin' as const,
            }}
          />
        )}
      </div>
    </div>
  );
}
