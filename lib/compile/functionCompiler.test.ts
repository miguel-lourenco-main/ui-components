import { beforeEach, describe, expect, it } from 'vitest';
import { isValidElement } from 'react';
import type { FunctionPropValue, PropDefinition } from '@/lib/interfaces';
import { clearCompileCache, compileFunctionProp } from './functionCompiler';

function fpv(source: string, signature?: FunctionPropValue['signature']): FunctionPropValue {
  return { type: 'function', source, signature };
}

function propDef(overrides: Partial<PropDefinition>): PropDefinition {
  return { name: 'test', type: 'function', required: false, ...overrides };
}

beforeEach(() => {
  clearCompileCache();
});

describe('compileFunctionProp', () => {
  it('uses the prop definition signature params with TS annotations', () => {
    const def = propDef({
      name: 'onValueChange',
      functionSignature: { params: 'value: number[]', returnType: 'void' },
    });
    const fn = compileFunctionProp(fpv('return value.length;'), 'onValueChange', def);
    expect(fn([1, 2, 3])).toBe(3);
  });

  it('returns a no-op for empty source', () => {
    const fn = compileFunctionProp(fpv('   '), 'onClick');
    expect(fn()).toBeUndefined();
  });

  it('compiles expression bodies without an explicit return', () => {
    const fn = compileFunctionProp(fpv('value * 2', { params: 'value: number', returnType: 'number' }), 'formatter');
    expect(fn(21)).toBe(42);
  });

  it('compiles JSX sources', () => {
    const def = propDef({ name: 'children', type: 'component' });
    const fn = compileFunctionProp(fpv('<strong>hi</strong>'), 'children', def);
    const element = fn();
    expect(isValidElement(element)).toBe(true);
    expect(element.type).toBe('strong');
  });

  it('treats unparseable children as plain text', () => {
    const fn = compileFunctionProp(fpv('Click me'), 'children');
    expect(fn()).toBe('Click me');
  });

  it('treats a bare identifier on children as plain text (not a ReferenceError)', () => {
    const fn = compileFunctionProp(fpv('hello'), 'children');
    expect(fn()).toBe('hello');
  });

  it('treats plain text on component-type props as plain text', () => {
    const def = propDef({ name: 'icon', type: 'component' });
    const fn = compileFunctionProp(fpv('Some label text'), 'icon', def);
    expect(fn()).toBe('Some label text');
  });

  it('returns an error-badge function for syntax errors on regular props', () => {
    const fn = compileFunctionProp(fpv('const = broken'), 'onClick');
    const element = fn();
    expect(isValidElement(element)).toBe(true);
    expect(element.props['data-testid']).toBe('function-error-badge');
  });

  it('returns an error badge from invocations that throw', () => {
    const fn = compileFunctionProp(fpv('return missingVariable + 1;'), 'onClick');
    const element = fn();
    expect(isValidElement(element)).toBe(true);
    expect(element.props['data-testid']).toBe('function-error-badge');
  });

  it('caches compiled functions by identity', () => {
    const value = fpv('return value;', { params: 'value: string', returnType: 'string' });
    const first = compileFunctionProp(value, 'formatter');
    const second = compileFunctionProp({ ...value }, 'formatter');
    expect(first).toBe(second);
  });

  it('recompiles when the source changes', () => {
    const first = compileFunctionProp(fpv('return 1;'), 'getValue');
    const second = compileFunctionProp(fpv('return 2;'), 'getValue');
    expect(first).not.toBe(second);
    expect(first()).toBe(1);
    expect(second()).toBe(2);
  });

  it('tags compiled functions with their original source', () => {
    const fn = compileFunctionProp(fpv('return 1;'), 'getValue');
    expect((fn as any).__originalSource).toBe('return 1;');
    expect((fn as any).__propName).toBe('getValue');
  });
});
