'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { CodeIcon, CopyIcon, DownloadIcon, Loader2 } from 'lucide-react';
import { getPreloadedMonaco, isMonacoPreloaded } from '@/lib/monaco-preloader';

// Use preloaded Monaco Editor if available, otherwise load dynamically
const Editor = dynamic(
  () => getPreloadedMonaco().then(module => ({ default: module.default })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="flex items-center space-x-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">
            {isMonacoPreloaded() ? 'Initializing code viewer...' : 'Loading code viewer...'}
          </span>
        </div>
      </div>
    )
  }
);

interface CodeViewerProps {
  value: string;
  language?: string;
  height?: string;
  title?: string;
}

export default function CodeViewer({
  value,
  language = 'typescript',
  height = '100%',
  title = 'Generated Code',
}: CodeViewerProps) {
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
        'editor.background': '#f8fafc',
        'editor.lineHighlightBackground': '#f1f5f9',
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
      {/* Viewer Toolbar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <CodeIcon className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">{title}</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {language === 'typescript' ? 'TypeScript' : 'JavaScript'}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            title="Copy to clipboard"
          >
            <CopyIcon className="w-4 h-4" />
            <span>Copy</span>
          </button>
          <button
            onClick={downloadCode}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            title="Download code"
          >
            <DownloadIcon className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor (Read-only) */}
      <div className="flex-1">
        <Editor
          height={height}
          language={language}
          value={value}
          onMount={handleEditorDidMount}
          options={{
            readOnly: true,
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
            // Disable editing features
            contextmenu: false,
            quickSuggestions: {
              other: 'off',
              comments: 'off',
              strings: 'off',
            },
            hover: { enabled: true },
            selectOnLineNumbers: false,
            selectionHighlight: false,
            occurrencesHighlight: 'off',
            cursorStyle: 'line-thin',
          }}
        />
      </div>
    </div>
  );
} 