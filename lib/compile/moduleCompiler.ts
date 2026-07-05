import React from 'react';
// @ts-ignore - Babel standalone doesn't ship types
import * as Babel from '@babel/standalone';
import type { CompileError } from './transform';

/**
 * Maps import specifiers to the modules user code may import in code mode.
 * Values are module-shaped objects (named exports as keys, plus `default`).
 */
export type ModuleScope = Record<string, any>;

export type ModuleCompileResult =
  | { ok: true; Component: React.ComponentType<any> }
  | { ok: false; error: CompileError };

/**
 * Build the import scope for the playground code mode: React, plus the
 * currently selected component's already-loaded module under every specifier
 * the user is likely to write.
 */
export function buildComponentScope(
  componentName: string,
  componentModule: any,
  extraSpecifiers: string[] = []
): ModuleScope {
  const componentExport =
    componentModule?.default ?? componentModule?.[componentName] ?? componentModule;
  const moduleShape = {
    ...componentModule,
    // Marks the shape as an ES module so Babel's default-import interop
    // unwraps `default` instead of wrapping the whole object.
    __esModule: true,
    default: componentExport,
    [componentName]: componentExport,
  };

  const scope: ModuleScope = { react: React };
  for (const specifier of ['@playground/component', componentName, ...extraSpecifiers]) {
    scope[specifier] = moduleShape;
  }
  return scope;
}

/**
 * Compile a full TSX module (imports + component) into a renderable React
 * component. Imports are resolved against `scope` via a `require` shim after
 * a Babel commonjs transform — no bundler, no network.
 *
 * The exported component resolves as: `default` export, then an export named
 * `Example`, then the first function-valued export.
 */
export function compileModule(source: string, scope: ModuleScope): ModuleCompileResult {
  let code: string;
  try {
    const result = Babel.transform(source, {
      filename: 'playground.tsx',
      presets: [
        ['typescript', { isTSX: true, allExtensions: true }],
        ['react', { runtime: 'classic', pragma: 'React.createElement', pragmaFrag: 'React.Fragment' }],
      ],
      plugins: ['transform-modules-commonjs'],
    });
    if (!result.code) {
      return { ok: false, error: { message: 'Babel produced no output' } };
    }
    code = result.code;
  } catch (error: any) {
    return {
      ok: false,
      error: {
        message: error?.message ?? String(error),
        line: error?.loc?.line,
        column: error?.loc?.column,
      },
    };
  }

  const moduleObj: { exports: Record<string, any> } = { exports: {} };
  const requireShim = (specifier: string) => {
    if (specifier in scope) return scope[specifier];
    throw new Error(
      `Import "${specifier}" is not available in the playground. Available imports: ${Object.keys(
        scope
      )
        .map((s) => `'${s}'`)
        .join(', ')}`
    );
  };

  try {
    new Function('require', 'module', 'exports', 'React', code)(
      requireShim,
      moduleObj,
      moduleObj.exports,
      React
    );
  } catch (error: any) {
    return { ok: false, error: { message: error?.message ?? String(error) } };
  }

  const exportsObj = moduleObj.exports;
  const candidate =
    exportsObj.default ??
    exportsObj.Example ??
    Object.values(exportsObj).find((value) => typeof value === 'function');

  if (typeof candidate !== 'function') {
    return {
      ok: false,
      error: {
        message:
          'The code must export a component — e.g. `export default function Example() { ... }`.',
      },
    };
  }

  return { ok: true, Component: candidate as React.ComponentType<any> };
}
