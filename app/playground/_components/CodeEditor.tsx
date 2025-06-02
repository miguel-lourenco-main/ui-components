'use client';

import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { CodeIcon, CopyIcon, DownloadIcon } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  readonly?: boolean;
}

export default function CodeEditor({
  value,
  onChange,
  language = 'typescript',
  height = '100%',
  readonly = false,
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Configure TypeScript compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types'],
    });

    // Add React types
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `
      declare module 'react' {
        interface Component<P = {}, S = {}> {}
        interface FunctionComponent<P = {}> {
          (props: P): JSX.Element | null;
        }
        type FC<P = {}> = FunctionComponent<P>;
        
        interface HTMLAttributes<T> {
          className?: string;
          onClick?: () => void;
          style?: React.CSSProperties;
        }
        
        interface CSSProperties {
          [key: string]: string | number;
        }
        
        namespace JSX {
          interface Element {}
          interface IntrinsicElements {
            div: HTMLAttributes<HTMLDivElement>;
            span: HTMLAttributes<HTMLSpanElement>;
            button: HTMLAttributes<HTMLButtonElement>;
            input: HTMLAttributes<HTMLInputElement>;
            [elemName: string]: any;
          }
        }
      }
      `,
      'file:///node_modules/@types/react/index.d.ts'
    );

    // Configure theme
    monaco.editor.defineTheme('custom-theme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#ffffff',
        'editor.lineHighlightBackground': '#f8fafc',
        'editorLineNumber.foreground': '#94a3b8',
      },
    });

    monaco.editor.setTheme('custom-theme');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      // You might want to show a toast notification here
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const downloadCode = () => {
    const blob = new Blob([value], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `component.${language === 'typescript' ? 'tsx' : 'jsx'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <CodeIcon className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {language === 'typescript' ? 'TypeScript' : 'JavaScript'}
          </span>
          {readonly && (
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
              Read Only
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={copyToClipboard}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            title="Copy to clipboard"
          >
            <CopyIcon className="w-4 h-4" />
          </button>
          <button
            onClick={downloadCode}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            title="Download code"
          >
            <DownloadIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height={height}
          language={language}
          value={value}
          onChange={(newValue) => onChange(newValue || '')}
          onMount={handleEditorDidMount}
          options={{
            readOnly: readonly,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            wrappingIndent: 'indent',
            folding: true,
            showFoldingControls: 'always',
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false,
            },
            parameterHints: {
              enabled: true,
            },
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
} 