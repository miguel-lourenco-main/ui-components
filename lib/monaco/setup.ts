import type { Monaco } from '@monaco-editor/react';
import { addReactLibs } from './react-types';

/**
 * Names of the shared editor themes. `monaco.editor.setTheme` is global, so a
 * single observer (installed here) switches every editor at once.
 */
export const THEME_LIGHT = 'playground-light';
export const THEME_DARK = 'playground-dark';

let configured = false;

/**
 * One-time global Monaco configuration for the playground.
 *
 * `monaco.languages.typescript.typescriptDefaults` is a single shared object —
 * per-editor `setCompilerOptions` calls stomp on each other and restart the TS
 * worker. All editors must go through this function instead of configuring
 * Monaco themselves; call it from `beforeMount`/`onMount` (idempotent).
 */
export function configureMonaco(monaco: Monaco): void {
  if (configured) return;
  configured = true;

  const ts = monaco.languages.typescript;

  ts.typescriptDefaults.setCompilerOptions({
    target: ts.ScriptTarget.ES2020,
    jsx: ts.JsxEmit.React,
    jsxFactory: 'React.createElement',
    jsxFragmentFactory: 'React.Fragment',
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    module: ts.ModuleKind.ESNext,
    allowNonTsExtensions: true,
    esModuleInterop: true,
    allowUmdGlobalAccess: true,
    noEmit: true,
    strict: false,
    allowJs: true,
  });

  ts.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    // 6133/6192: unused variable/imports — noise in small snippets
    diagnosticCodesToIgnore: [6133, 6192],
  });

  // Push model contents to the worker eagerly so diagnostics stay fresh
  ts.typescriptDefaults.setEagerModelSync(true);

  addReactLibs(monaco);
  defineThemes(monaco);
  installThemeObserver(monaco);
}

function defineThemes(monaco: Monaco): void {
  monaco.editor.defineTheme(THEME_LIGHT, {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#f8fafc',
      'editor.lineHighlightBackground': '#f1f5f9',
      'editorLineNumber.foreground': '#94a3b8',
    },
  });
  monaco.editor.defineTheme(THEME_DARK, {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#0b0f19',
      'editor.lineHighlightBackground': '#111827',
      'editorLineNumber.foreground': '#6b7280',
    },
  });
}

function installThemeObserver(monaco: Monaco): void {
  if (typeof document === 'undefined') return;

  const applyTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    monaco.editor.setTheme(isDark ? THEME_DARK : THEME_LIGHT);
  };

  applyTheme();
  const observer = new MutationObserver(applyTheme);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}
