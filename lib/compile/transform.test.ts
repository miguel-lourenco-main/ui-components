import { describe, expect, it } from 'vitest';
import React from 'react';
import { analyzeBody, compileFunctionExpression } from './transform';

describe('analyzeBody', () => {
  it('classifies a single expression', () => {
    const result = analyzeBody('value * 2');
    expect(result.kind).toBe('expression');
    expect(result.expressionText).toBe('value * 2');
    expect(result.isBareIdentifier).toBe(false);
  });

  it('flags a bare identifier expression', () => {
    const result = analyzeBody('hello');
    expect(result.kind).toBe('expression');
    expect(result.isBareIdentifier).toBe(true);
  });

  it('classifies statements with an explicit return', () => {
    expect(analyzeBody('const d = value * 2;\nreturn d;').kind).toBe('statements');
  });

  it('classifies a call expression with trailing semicolon as expression', () => {
    const result = analyzeBody('console.log(value);');
    expect(result.kind).toBe('expression');
    // Trailing semicolon must not leak into the expression text
    expect(result.expressionText).toBe('console.log(value)');
  });

  it('treats a lone string literal (directive) as an expression', () => {
    const result = analyzeBody("'hello'");
    expect(result.kind).toBe('expression');
    expect(result.expressionText).toBe("'hello'");
  });

  it('classifies JSX as an expression', () => {
    const result = analyzeBody('<div className="x">hi</div>');
    expect(result.kind).toBe('expression');
    expect(result.isBareIdentifier).toBe(false);
  });

  it('reports parse errors for plain prose', () => {
    const result = analyzeBody('Click me');
    expect(result.kind).toBe('parse-error');
    expect(result.error?.message).toBeTruthy();
  });

  it('does not mistake comparison operators for JSX', () => {
    // The old substring check flagged this as JSX
    expect(analyzeBody('return a < b && c > d;').kind).toBe('statements');
  });
});

describe('compileFunctionExpression', () => {
  function evaluate(code: string): Function {
    return new Function('React', `${code}\nreturn __compiledFn;`)(React);
  }

  it('compiles an expression body with an implicit return', () => {
    const result = compileFunctionExpression('value * 2', 'value: number');
    expect(result.ok).toBe(true);
    if (result.ok) expect(evaluate(result.code)(21)).toBe(42);
  });

  it('compiles statement bodies with explicit returns', () => {
    const result = compileFunctionExpression('const d = value + 1;\nreturn d;', 'value: number');
    expect(result.ok).toBe(true);
    if (result.ok) expect(evaluate(result.code)(41)).toBe(42);
  });

  it('returns undefined for statement bodies without a return', () => {
    const result = compileFunctionExpression('const x = 1;\nconst y = 2;', '');
    expect(result.ok).toBe(true);
    if (result.ok) expect(evaluate(result.code)()).toBeUndefined();
  });

  it('strips TypeScript annotations including destructured params', () => {
    const result = compileFunctionExpression(
      'return x + y;',
      '{ x, y }: { x: number; y: number }'
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(evaluate(result.code)({ x: 40, y: 2 })).toBe(42);
  });

  it('supports optional and rest params', () => {
    const result = compileFunctionExpression('return args.length;', '...args: any[]');
    expect(result.ok).toBe(true);
    if (result.ok) expect(evaluate(result.code)(1, 2, 3)).toBe(3);
  });

  it('compiles JSX expressions to React elements', () => {
    const result = compileFunctionExpression('<div className="x">hi</div>', '');
    expect(result.ok).toBe(true);
    if (result.ok) {
      const element = evaluate(result.code)();
      expect(element.type).toBe('div');
      expect(element.props.className).toBe('x');
      expect(element.props.children).toBe('hi');
    }
  });

  it('compiles JSX behind an explicit return inside statements', () => {
    const result = compileFunctionExpression(
      'const label = "hi";\nreturn <span>{label}</span>;',
      ''
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      const element = evaluate(result.code)();
      expect(element.type).toBe('span');
      expect(element.props.children).toBe('hi');
    }
  });

  it('reports syntax errors with a location', () => {
    const result = compileFunctionExpression('const = broken', '');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBeTruthy();
      expect(result.error.line).toBeGreaterThanOrEqual(1);
    }
  });

  it('compiles a lone string literal body', () => {
    const result = compileFunctionExpression("'hello'", '');
    expect(result.ok).toBe(true);
    if (result.ok) expect(evaluate(result.code)()).toBe('hello');
  });
});
