import type { FunctionPropValue, PropDefinition } from '@/lib/interfaces';
import { parse } from 'acorn';
import { simple as walkSimple } from 'acorn-walk';
import React from 'react';
// @ts-ignore - Babel standalone doesn't have perfect types
import * as Babel from '@babel/standalone';

/**
 * Check if a value is a function prop value object
 */
export function isFunctionPropValue(value: any): value is FunctionPropValue {
  return value && typeof value === 'object' && value.type === 'function' && typeof value.source === 'string';
}

/**
 * Transform JSX to JavaScript using Babel
 */
function transformJSXWithBabel(jsxCode: string, params: string = ''): string {
  try {
    // If the code starts with "return", we need to wrap it in a function for Babel
    let codeToTransform = jsxCode.trim();
    let isReturnStatement = false;
    
    if (codeToTransform.startsWith('return ')) {
      // Extract the JSX part after "return "
      const jsxPart = codeToTransform.substring(7).trim();
      // Wrap in a function for Babel to process
      codeToTransform = `function temp(${params}) {\n  return ${jsxPart}\n}`;
      isReturnStatement = true;
    } else if (!codeToTransform.startsWith('function') && !codeToTransform.includes('=>')) {
      // If it's just JSX without function wrapper, wrap it and ensure we return it
      // so the resulting function actually yields a ReactNode.
      codeToTransform = `function temp(${params}) {\n  return ${jsxCode}\n}`;
    }
    
    const result = Babel.transform(codeToTransform, {
      presets: [['react', { runtime: 'classic' }]],
      plugins: [
        ['transform-react-jsx', { pragma: 'React.createElement' }]
      ]
    });
    
    let transformedCode = result.code || jsxCode;
    
    // If we wrapped it in a function, extract the body
    if (isReturnStatement || (!jsxCode.startsWith('function') && !jsxCode.includes('=>'))) {
      // Extract the function body
      const match = transformedCode.match(/function temp\([^)]*\)\s*\{([\s\S]*)\}/);
      if (match) {
        transformedCode = match[1].trim();
      }
    }
    
    return transformedCode;
  } catch (error) {
    console.warn('Babel JSX transformation failed:', error);
    // Fallback to original code if transformation fails
    return jsxCode;
  }
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
 * Extract parameter names from TypeScript function signature metadata
 */
function extractParamNamesFromMetadata(functionSignature?: { params: string; returnType: string }): string[] {
  if (!functionSignature || !functionSignature.params) {
    return [];
  }

  const paramsString = functionSignature.params;
  
  // Split on commas but handle nested types
  const params: string[] = [];
  let currentParam = '';
  let depth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < paramsString.length; i++) {
    const char = paramsString[i];
    
    if (!inString) {
      if (char === '"' || char === "'") {
        inString = true;
        stringChar = char;
      } else if (char === '<' || char === '(' || char === '{' || char === '[') {
        depth++;
      } else if (char === '>' || char === ')' || char === '}' || char === ']') {
        depth--;
      } else if (char === ',' && depth === 0) {
        if (currentParam.trim()) {
          params.push(currentParam.trim());
        }
        currentParam = '';
        continue;
      }
    } else if (char === stringChar && paramsString[i - 1] !== '\\') {
      inString = false;
      stringChar = '';
    }
    
    currentParam += char;
  }
  
  // Add the last parameter
  if (currentParam.trim()) {
    params.push(currentParam.trim());
  }

  // Extract just the parameter names (remove type annotations)
  return params.map(param => {
    const colonIndex = param.indexOf(':');
    if (colonIndex > -1) {
      return param.substring(0, colonIndex).trim();
    }
    return param.trim();
  }).filter(Boolean);
}

/**
 * Convert a FunctionPropValue to an actual function using metadata for parameters
 */
export function functionPropValueToFunction(
  propValue: FunctionPropValue, 
  propName: string, 
  propDefinition?: PropDefinition
): Function {
  if (!propValue.source.trim()) {
    // Return a no-op function for empty source
    return () => {};
  }

  try {
    // Use metadata from PropDefinition first, then fall back to signature in propValue
    const functionSignature = propDefinition?.functionSignature || propValue.signature;
    
    console.log(`🔍 Processing function ${propName}:`, {
      hasMetadata: !!propDefinition?.functionSignature,
      originalParams: functionSignature?.params,
      source: propValue.source.substring(0, 100) + '...'
    });
    
  // Extract parameter names from metadata
  const paramNames = extractParamNamesFromMetadata(functionSignature);
  const jsParams = paramNames.join(', ');
    
    console.log(`🔍 Extracted parameters for ${propName}:`, {
      originalParams: functionSignature?.params,
      extractedParamNames: paramNames,
      finalJsParams: jsParams
    });
    
    // Check if the source contains JSX
    const containsJSX = propValue.source.includes('<') && propValue.source.includes('>');
    
    if (containsJSX) {
      // For JSX functions, use Babel to transform JSX to React.createElement
      const jsxFunction = (...args: any[]) => {
        console.log(`🚀 JSX FUNCTION CALLED: ${propName} with args:`, args);
        
        try {
          // Transform JSX using Babel, passing parameter info for proper context
          const transformedSource = transformJSXWithBabel(propValue.source, jsParams);
          
          const functionCode = `(${jsParams}) => {
            ${transformedSource}
          }`;
          
          console.log(`🔍 Creating JSX function for ${propName} with Babel transformation`);
          console.log(`🔍 Transformed source:`, transformedSource);
          
          const createdFunction = new Function('React', ...paramNames, `return (${functionCode})(...arguments)`);
          return createdFunction(React, ...args);
        } catch (error) {
          console.error(`❌ Error in JSX function ${propName}:`, error);
          
          // Return compact error display for the UI
          return React.createElement('div', {
            className: 'inline-flex items-center gap-1 px-2 py-1 bg-red-100 border border-red-300 rounded text-xs text-red-700',
            title: `Function Error: ${error instanceof Error ? error.message : String(error)}`
          }, [
            React.createElement('span', { key: 'icon' }, '❌'),
            React.createElement('span', { key: 'name' }, propName),
            React.createElement('span', { key: 'error' }, 'Error')
          ]);
        }
      };
      
      // Copy properties to maintain function identity
      Object.defineProperty(jsxFunction, 'name', { value: propName });
      (jsxFunction as any).__originalSource = propValue.source;
      (jsxFunction as any).__propName = propName;
      (jsxFunction as any).__isJSX = true;
      
      return jsxFunction;
    } else {
      // For non-JSX content, create the function normally
      const rawSource = propValue.source.trim();
      const hasReturn = /\breturn\b/.test(rawSource);
      const looksLikeCode = /[{}();]|=>|\bfunction\b/.test(rawSource);
      let bodyContent = rawSource;

      // If it's likely plain text (especially for children), wrap as a string literal
      if (!hasReturn && !looksLikeCode && propName === 'children') {
        bodyContent = JSON.stringify(rawSource);
      }

      const body = hasReturn ? rawSource : `return ${bodyContent};`;
      const fullFunction = `(${jsParams}) => {\n${body}\n}`;
      
      console.log(`🔍 Creating non-JSX function for ${propName}:`, {
        jsParams,
        fullFunction: fullFunction.substring(0, 200) + '...'
      });
            
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
    
    // Return a function that shows a compact error instead of completely failing
    const FallbackDisplayName = (...args: any[]) => {
      return React.createElement('div', {
        className: 'inline-flex items-center gap-1 px-2 py-1 bg-red-100 border border-red-300 rounded text-xs text-red-700',
        title: `Function Creation Error: ${error instanceof Error ? error.message : String(error)}`
      }, [
        React.createElement('span', { key: 'icon' }, '❌'),
        React.createElement('span', { key: 'name' }, propName),
        React.createElement('span', { key: 'error' }, 'Failed')
      ]);
    };
    Object.defineProperty(FallbackDisplayName, 'name', { value: `${propName || 'Anonymous'}Fallback` });
    return FallbackDisplayName;
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