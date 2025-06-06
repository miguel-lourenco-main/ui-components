import React from 'react';
import * as Babel from '@babel/standalone';
import { ComponentCompilationResult } from '@/types';

/**
 * Compile a TypeScript/JSX component string into a React component
 */
export async function compileComponent(code: string): Promise<ComponentCompilationResult> {
  try {
    // Basic validation
    if (!code.trim()) {
      return {
        success: false,
        error: 'Component code is empty'
      };
    }

    // Check for basic React component structure
    if (!code.includes('export default') && !code.includes('export')) {
      return {
        success: false,
        error: 'Component must have a default export'
      };
    }

    // Configure Babel presets and plugins for babel-standalone
    // Use simple preset names for babel-standalone
    const babelConfig = {
      presets: ['env', 'react', 'typescript'],
      plugins: [],
      filename: 'component.tsx'
    };

    // Transform the code
    const transformed = Babel.transform(code, babelConfig);
    
    if (!transformed.code) {
      return {
        success: false,
        error: 'Babel transformation failed'
      };
    }

    // Create a safe execution context
    const moduleExports: any = {};
    const moduleScope = {
      React,
      exports: moduleExports,
      module: { exports: moduleExports },
      require: createRequireFunction(),
      console,
      // Add other safe globals as needed
    };

    // Execute the transformed code in a controlled environment
    try {
      const codeToExecute = `
        ${transformed.code}
        return module.exports;
      `;
      
      const compiledFunction = new Function(...Object.keys(moduleScope), codeToExecute);
      const result = compiledFunction(...Object.values(moduleScope));
      
      // Get the default export (the component)
      const component = result.default || result;
      
      if (typeof component !== 'function') {
        return {
          success: false,
          error: 'Compiled code did not export a valid React component'
        };
      }

      return {
        success: true,
        component,
        exports: result
      };
    } catch (executionError) {
      return {
        success: false,
        error: `Component execution failed: ${executionError instanceof Error ? executionError.message : 'Unknown error'}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Compilation failed'
    };
  }
}

/**
 * Create a safe require function for the component execution context
 */
function createRequireFunction() {
  const allowedModules: Record<string, any> = {
    'react': React,
    'react/jsx-runtime': {
      jsx: (type: any, props: any, key?: any) => React.createElement(type, key ? { ...props, key } : props),
      jsxs: (type: any, props: any, key?: any) => React.createElement(type, key ? { ...props, key } : props),
      Fragment: React.Fragment
    },
    'react/jsx-dev-runtime': {
      jsx: (type: any, props: any, key?: any) => React.createElement(type, key ? { ...props, key } : props),
      jsxs: (type: any, props: any, key?: any) => React.createElement(type, key ? { ...props, key } : props),
      Fragment: React.Fragment
    },
    // Add other allowed modules here
  };

  return function safeRequire(moduleName: string) {
    if (allowedModules[moduleName]) {
      return allowedModules[moduleName];
    }
    throw new Error(`Module "${moduleName}" is not available in the sandbox environment`);
  };
}

/**
 * Validate TypeScript/JSX code syntax
 */
export function validateComponentCode(code: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic syntax checks
  if (!code.trim()) {
    errors.push('Component code is empty');
    return { isValid: false, errors };
  }

  // Check for required imports
  if (!code.includes('React') && !code.includes('import')) {
    errors.push('Missing React import');
  }

  // Check for export
  if (!code.includes('export default') && !code.includes('export')) {
    errors.push('Component must have a default export');
  }

  // Check for basic JSX structure
  if (!code.includes('return') && !code.includes('=>')) {
    errors.push('Component must return JSX');
  }

  // Check for balanced brackets
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push('Unbalanced braces');
  }

  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push('Unbalanced parentheses');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Extract dependencies from component code
 */
export function extractDependencies(code: string): string[] {
  const dependencies: string[] = [];
  
  // Extract import statements
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(code)) !== null) {
    const dependency = match[1];
    // Filter out relative imports and built-ins
    if (!dependency.startsWith('.') && !dependency.startsWith('/') && dependency !== 'react') {
      dependencies.push(dependency);
    }
  }
  
  return Array.from(new Set(dependencies)); // Remove duplicates
} 