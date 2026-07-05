import { parse } from '@babel/parser';
// @ts-ignore - Babel standalone doesn't ship types
import * as Babel from '@babel/standalone';

/**
 * AST-based analysis and compilation of user-authored function bodies.
 * This is the single code path for JSX and non-JSX, TS and JS — no substring
 * or regex heuristics anywhere.
 */

export interface CompileError {
  message: string;
  line?: number;
  column?: number;
}

export type BodyKind =
  /** One or more statements; executed as-is (returns undefined unless the user wrote `return`). */
  | 'statements'
  /** A single expression; compiled as `return (<expr>);`. */
  | 'expression'
  /** Source that does not parse as TS/TSX at all. */
  | 'parse-error';

export interface BodyAnalysis {
  kind: BodyKind;
  /** For `expression`: the exact expression text (no trailing semicolon). */
  expressionText?: string;
  /** For `expression`: true when the expression is a single bare identifier (e.g. `hello`). */
  isBareIdentifier?: boolean;
  /** For `parse-error`: what went wrong. */
  error?: CompileError;
}

const PARSE_OPTIONS = {
  sourceType: 'module' as const,
  allowReturnOutsideFunction: true,
  plugins: ['jsx', 'typescript'] as any[],
};

/**
 * Classify a function body by parsing it, so downstream code never has to
 * guess from string contents.
 */
export function analyzeBody(source: string): BodyAnalysis {
  let ast: any;
  try {
    ast = parse(source, PARSE_OPTIONS);
  } catch (error: any) {
    return {
      kind: 'parse-error',
      error: {
        message: error?.message ?? String(error),
        line: error?.loc?.line,
        column: error?.loc?.column,
      },
    };
  }

  const body = ast.program.body as any[];
  const directives = (ast.program.directives ?? []) as any[];

  // A lone string literal (`'hello'`) parses as a directive, not a statement.
  if (body.length === 0 && directives.length === 1) {
    const directive = directives[0];
    return {
      kind: 'expression',
      expressionText: source.slice(directive.start, directive.end).replace(/;\s*$/, ''),
      isBareIdentifier: false,
    };
  }

  if (body.length === 1 && body[0].type === 'ExpressionStatement') {
    const expression = body[0].expression;
    return {
      kind: 'expression',
      expressionText: source.slice(expression.start, expression.end),
      isBareIdentifier: expression.type === 'Identifier',
    };
  }

  return { kind: 'statements' };
}

export type CompileResult =
  | { ok: true; code: string }
  | { ok: false; error: CompileError };

/**
 * Compile a user-authored function body into a plain-JS arrow function
 * expression string. `params` is the original TypeScript parameter list from
 * the prop's signature (annotations, destructuring, optionals all supported —
 * the TS preset strips them).
 *
 * The returned `code` has the shape `var __compiledFn = (...) => {...};` so the
 * caller can evaluate it with `new Function` and read `__compiledFn` without
 * worrying about trailing-semicolon/paren issues.
 */
export function compileFunctionExpression(source: string, params: string): CompileResult {
  const analysis = analyzeBody(source);

  if (analysis.kind === 'parse-error') {
    return { ok: false, error: analysis.error! };
  }

  const body =
    analysis.kind === 'expression'
      ? `return (\n${analysis.expressionText}\n);`
      : source;

  const wrapped = `var __compiledFn = (${params}) => {\n${body}\n}`;

  try {
    const result = Babel.transform(wrapped, {
      filename: 'expression.tsx',
      presets: [
        ['typescript', { isTSX: true, allExtensions: true }],
        ['react', { runtime: 'classic', pragma: 'React.createElement', pragmaFrag: 'React.Fragment' }],
      ],
    });
    if (!result.code) {
      return { ok: false, error: { message: 'Babel produced no output' } };
    }
    return { ok: true, code: result.code };
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
}

export const COMPILED_FN_NAME = '__compiledFn';
