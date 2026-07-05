import type { Monaco } from '@monaco-editor/react';
import { EDITOR_EXTRA_LIBS } from './react-types.generated';

/**
 * Minimal fallback used only if registering the bundled type libraries fails.
 * Keeps `React`, JSX intrinsics, and common attributes usable in the editors.
 */
export const MINIMAL_REACT_STUB = `
declare namespace React {
  interface CSSProperties {
    [key: string]: string | number | undefined;
  }
  interface HTMLAttributes<T> {
    className?: string;
    style?: CSSProperties;
    onClick?: (event: any) => void;
    children?: any;
  }
  type ReactNode = any;
  type FC<P = {}> = (props: P) => any;
  function createElement(type: any, props?: any, ...children: any[]): any;
}
declare namespace JSX {
  interface Element {}
  interface ElementChildrenAttribute { children: {}; }
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
declare module 'react' {
  export = React;
}
`;

/**
 * Register React (+ csstype / prop-types) declaration files with the Monaco
 * TypeScript worker so editor models typecheck against the real React types.
 * addExtraLib with the same virtual path replaces the previous copy, so this
 * is safe to call more than once.
 */
export function addReactLibs(monaco: Monaco): void {
  const defaults = monaco.languages.typescript.typescriptDefaults;
  try {
    for (const lib of EDITOR_EXTRA_LIBS) {
      defaults.addExtraLib(lib.content, lib.virtualPath);
    }
  } catch (error) {
    console.warn('[monaco-setup] Failed to register bundled React types, using minimal stub:', error);
    defaults.addExtraLib(MINIMAL_REACT_STUB, 'file:///node_modules/@types/react/index.d.ts');
  }
}
