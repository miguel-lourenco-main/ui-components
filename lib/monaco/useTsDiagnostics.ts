import { useCallback, useState } from 'react';
import type { Monaco } from '@monaco-editor/react';

export interface TsDiagnostic {
  message: string;
  /** 1-based line in the user's editable body (shell offset already removed). */
  line: number;
  column?: number;
}

export interface TsDiagnosticsState {
  status: 'checking' | 'clean' | 'errors';
  errors: TsDiagnostic[];
  warnings: TsDiagnostic[];
}

// monaco.MarkerSeverity values (avoid importing the editor at module scope)
const MARKER_ERROR = 8;
const MARKER_WARNING = 4;

// ts.DiagnosticCategory.Error
const TS_CATEGORY_ERROR = 1;

// Keep in sync with diagnosticCodesToIgnore in lib/monaco/setup.ts — the raw
// worker query below doesn't apply that filter for us.
const IGNORED_CODES = new Set([6133, 6192]);

/**
 * Track TypeScript diagnostics for one Monaco model.
 *
 * Wire `onValidate` to the `<Editor onValidate>` prop and call `attach` from
 * `onMount`. `onValidate` only fires when the marker set CHANGES — it stays
 * silent for clean→clean edits and for a fresh model whose first validation
 * yields zero markers. `attach` closes both gaps by querying the worker
 * directly; call it again (debounced) after edits, alongside `markStale`.
 */
export function useTsDiagnostics(lineOffset: number = 0) {
  const [state, setState] = useState<TsDiagnosticsState>({
    status: 'checking',
    errors: [],
    warnings: [],
  });

  const markStale = useCallback(() => {
    setState((current) =>
      current.status === 'checking' ? current : { ...current, status: 'checking' }
    );
  }, []);

  const onValidate = useCallback(
    (markers: any[]) => {
      const errors: TsDiagnostic[] = [];
      const warnings: TsDiagnostic[] = [];
      for (const marker of markers) {
        const diagnostic: TsDiagnostic = {
          message: marker.message,
          line: Math.max(1, (marker.startLineNumber ?? 1) - lineOffset),
          column: marker.startColumn,
        };
        if (marker.severity >= MARKER_ERROR) {
          errors.push(diagnostic);
        } else if (marker.severity >= MARKER_WARNING) {
          warnings.push(diagnostic);
        }
      }
      setState({ status: errors.length > 0 ? 'errors' : 'clean', errors, warnings });
    },
    [lineOffset]
  );

  const attach = useCallback(
    async (editor: any, monaco: Monaco) => {
      const model = editor.getModel();
      if (!model) return;
      try {
        const getWorker = await monaco.languages.typescript.getTypeScriptWorker();
        const worker = await getWorker(model.uri);
        if (model.isDisposed()) return;
        const uri = model.uri.toString();
        const [syntactic, semantic] = await Promise.all([
          worker.getSyntacticDiagnostics(uri),
          worker.getSemanticDiagnostics(uri),
        ]);
        if (model.isDisposed()) return;

        const errors: TsDiagnostic[] = [];
        const warnings: TsDiagnostic[] = [];
        for (const diagnostic of [...syntactic, ...semantic]) {
          if (diagnostic.code !== undefined && IGNORED_CODES.has(diagnostic.code)) continue;
          const position = model.getPositionAt(diagnostic.start ?? 0);
          const message =
            typeof diagnostic.messageText === 'string'
              ? diagnostic.messageText
              : diagnostic.messageText?.messageText ?? 'TypeScript error';
          const entry: TsDiagnostic = {
            message,
            line: Math.max(1, position.lineNumber - lineOffset),
            column: position.column,
          };
          if (diagnostic.category === TS_CATEGORY_ERROR) {
            errors.push(entry);
          } else {
            warnings.push(entry);
          }
        }
        setState({ status: errors.length > 0 ? 'errors' : 'clean', errors, warnings });
      } catch (error) {
        // Worker unavailable (e.g. CDN offline) — don't block the editor on it.
        console.warn('[useTsDiagnostics] initial diagnostics query failed:', error);
        setState({ status: 'clean', errors: [], warnings: [] });
      }
    },
    [lineOffset]
  );

  return { state, onValidate, markStale, attach };
}
