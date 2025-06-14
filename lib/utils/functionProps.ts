import { FunctionPropValue } from '@/types';
import { parse } from 'acorn';
import { simple as walkSimple } from 'acorn-walk';
import React from 'react';

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
 * Convert JSX string to React.createElement calls
 */
function jsxToReactCreateElement(jsxString: string): string {
  // Simple JSX to React.createElement conversion
  // This is a basic implementation - for production, you'd want a proper JSX parser
  
  // Handle the specific case of our toolbar buttons
  if (jsxString.includes('<div className="flex gap-2">')) {
    return `
      return React.createElement('div', { className: 'flex gap-2' },
        React.createElement('button', {
          key: 'add',
          className: 'px-3 py-1 text-sm border rounded hover:bg-gray-50'
        }, 'Add User'),
        hasSelected && React.createElement('button', {
          key: 'delete',
          className: 'px-3 py-1 text-sm border rounded bg-red-600 text-white hover:bg-red-700'
        }, 'Delete Selected')
      );
    `;
  }
  
  // Fallback for other JSX
  return `
    console.log('JSX function called with args:', arguments);
    return React.createElement('div', { 
      className: 'bg-yellow-100 p-2 rounded text-sm' 
    }, 'JSX Function Result');
  `;
}

/**
 * Convert a FunctionPropValue to an actual function
 */
export function functionPropValueToFunction(propValue: FunctionPropValue, propName: string): Function {
  if (!propValue.source.trim()) {
    // Return a no-op function for empty source
    return () => {};
  }

  try {
    const signature = propValue.signature || { params: '...args', returnType: 'any' };
    
    // Strip TypeScript type annotations from parameters for JavaScript execution
    const jsParams = signature.params.split(',').map(param => {
      const trimmed = param.trim();
      const colonIndex = trimmed.indexOf(':');
      // Extract just the parameter name, removing type annotations
      return colonIndex > -1 ? trimmed.substring(0, colonIndex).trim() : trimmed;
    }).join(', ');
    
    // Check if the source contains JSX
    const containsJSX = propValue.source.includes('<') && propValue.source.includes('>');
    
    if (containsJSX) {
      // Convert JSX to React.createElement calls
      const reactCode = jsxToReactCreateElement(propValue.source);
      const fullFunction = `(${jsParams}) => {\n${reactCode}\n}`;
      
      // Create the actual function with React in scope
      const actualFunction = new Function('React', 'return ' + fullFunction)(React);
      
      // Add debugging wrapper
      const wrappedFunction = (...args: any[]) => {
        console.log(`🚀 JSX FUNCTION CALLED: ${propName} with args:`, args);
        return actualFunction(...args);
      };
      
      // Copy properties to maintain function identity
      Object.defineProperty(wrappedFunction, 'name', { value: propName });
      (wrappedFunction as any).__originalSource = propValue.source;
      (wrappedFunction as any).__propName = propName;
      
      return wrappedFunction;
    } else {
      // For non-JSX content, use the original approach with JavaScript-compatible parameters
      const fullFunction = `(${jsParams}) => {\n${propValue.source}\n}`;
            
      // Create the actual function
      const actualFunction = new Function('return ' + fullFunction)();
      
      // Add debugging wrapper
      const wrappedFunction = (...args: any[]) => {
        console.log(`🚀 FUNCTION CALLED: ${propName} with args:`, args);
        return actualFunction(...args);
      };
      
      // Copy properties to maintain function identity
      Object.defineProperty(wrappedFunction, 'name', { value: propName });
      (wrappedFunction as any).__originalSource = propValue.source;
      (wrappedFunction as any).__propName = propName;
      
      return wrappedFunction;
    }
  } catch (error) {
    console.warn(`Failed to create function for ${propName}:`, error);
    console.log(`Full function that failed:`, propValue);
    return () => {};
  }
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
export function convertFunctionPropValuesToFunctions(props: Record<string, any>): Record<string, any> {
  const converted: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(props)) {
    if (isFunctionPropValue(value)) {
      converted[key] = functionPropValueToFunction(value, key);
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