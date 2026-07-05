import type { FunctionPropValue, PropDefinition } from '@/lib/interfaces';
import { parse } from 'acorn';
import { simple as walkSimple } from 'acorn-walk';
import { compileFunctionProp } from '@/lib/compile/functionCompiler';

/**
 * Check if a value is a function prop value object
 */
export function isFunctionPropValue(value: any): value is FunctionPropValue {
  return value && typeof value === 'object' && value.type === 'function' && typeof value.source === 'string';
}

/**
 * Extract function body from a function object
 */
export function extractFunctionSource(func: Function): string {
  // First check if it has the original source attached
  if ((func as any).__originalSource) {
    return (func as any).__originalSource;
  }

  // Fall back to parsing the function string using acorn
  try {
    const funcString = func.toString();
    const ast = parse(funcString, { ecmaVersion: 2020 });

    let functionBody = '';

    // Walk the AST to find the function body
    walkSimple(ast, {
      FunctionExpression(node: any) {
        if (node.body && node.body.body) {
          // Extract the function body, preserving formatting
          const start = node.body.start;
          const end = node.body.end;
          functionBody = funcString.slice(start + 1, end - 1).trim();
        }
      },
      ArrowFunctionExpression(node: any) {
        if (node.body && node.body.body) {
          // Extract the function body, preserving formatting
          const start = node.body.start;
          const end = node.body.end;
          functionBody = funcString.slice(start + 1, end - 1).trim();
        } else if (node.body && node.body.type === 'BlockStatement') {
          // Handle arrow functions with block statements
          const start = node.body.start;
          const end = node.body.end;
          functionBody = funcString.slice(start + 1, end - 1).trim();
        } else {
          // Handle arrow functions with implicit return
          const start = node.body.start;
          const end = node.body.end;
          functionBody = `return ${funcString.slice(start, end)};`;
        }
      }
    });

    return functionBody;
  } catch (e) {
    console.warn('Could not extract function body:', e);
    return '';
  }
}

/**
 * Convert a function to a FunctionPropValue
 */
export function functionToFunctionPropValue(func: Function, signature?: { params: string; returnType: string }): FunctionPropValue {
  return {
    type: 'function',
    source: extractFunctionSource(func),
    signature
  };
}

/**
 * Convert a FunctionPropValue to an actual function.
 *
 * Delegates to the AST-based compiler in lib/compile: one Babel pass handles
 * JSX/TS/JS alike, results are cached, and failures surface as a function
 * that renders a compact error badge instead of throwing.
 */
export function functionPropValueToFunction(
  propValue: FunctionPropValue,
  propName: string,
  propDefinition?: PropDefinition
): Function {
  return compileFunctionProp(propValue, propName, propDefinition);
}

/**
 * Convert props object, converting functions to FunctionPropValues
 */
export function convertFunctionsToFunctionPropValues(props: Record<string, any>): Record<string, any> {
  const converted: Record<string, any> = {};

  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'function') {
      converted[key] = functionToFunctionPropValue(value);
    } else {
      converted[key] = value;
    }
  }

  return converted;
}

/**
 * Convert props object, converting FunctionPropValues to actual functions
 */
export function convertFunctionPropValuesToFunctions(
  props: Record<string, any>,
  propDefinitions?: PropDefinition[]
): Record<string, any> {
  const converted: Record<string, any> = {};

  for (const [key, value] of Object.entries(props)) {
    if (isFunctionPropValue(value)) {
      // Find the corresponding prop definition for metadata
      const propDefinition = propDefinitions?.find(p => p.name === key);
      converted[key] = functionPropValueToFunction(value, key, propDefinition);
    } else {
      converted[key] = value;
    }
  }

  return converted;
}

/**
 * Convert props object for runtime rendering.
 *
 * - For standard function props, converts FunctionPropValues into callable functions.
 * - For component props (PropDefinition.type === 'component'), converts FunctionPropValues
 *   into a ReactNode by evaluating the generated function once.
 */
export function convertPropsForRuntime(
  props: Record<string, any>,
  propDefinitions?: PropDefinition[]
): Record<string, any> {
  const converted: Record<string, any> = {};

  for (const [key, value] of Object.entries(props)) {
    if (isFunctionPropValue(value)) {
      const propDefinition = propDefinitions?.find(p => p.name === key);

      // Component props: evaluate the generated function once to get a ReactNode
      if (propDefinition?.type === 'component') {
        try {
          const componentFn = functionPropValueToFunction(value, key, propDefinition);
          converted[key] = componentFn();
        } catch (error) {
          console.warn(`Failed to render component prop "${key}":`, error);
          // Fallback to the raw FunctionPropValue so the renderer can still show something
          converted[key] = value;
        }
      } else {
        // Regular function prop
        converted[key] = functionPropValueToFunction(value, key, propDefinition);
      }
    } else {
      converted[key] = value;
    }
  }

  return converted;
}

/**
 * Get function source from either a function or FunctionPropValue
 */
export function getFunctionSource(value: any): string {
  if (isFunctionPropValue(value)) {
    return value.source;
  } else if (typeof value === 'function') {
    return extractFunctionSource(value);
  }
  return '';
}

/**
 * Set function source, returning a FunctionPropValue
 */
export function setFunctionSource(source: string, signature?: { params: string; returnType: string }): FunctionPropValue {
  return {
    type: 'function',
    source,
    signature
  };
}
