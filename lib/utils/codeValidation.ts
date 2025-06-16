import { PropDefinition } from '@/types';

// Browser-compatible parsers (like CodeSandbox/StackBlitz use)
import { parse as babelParse } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
// @ts-ignore - TypeScript compiler API for browser
import * as ts from 'typescript';

// A simple cache for TypeScript library files fetched from a CDN
const tsLibCache: { [key: string]: string } = {};
const tsLibVersion = '5.3.3'; // From package.json

/**
 * Fetch TypeScript library files from a CDN and cache them.
 */
async function ensureTsLibsAreLoaded(libNames: string[]): Promise<void> {
  const promises: Promise<void>[] = [];
  for (const libName of libNames) {
    if (!tsLibCache[libName]) {
      promises.push(
        fetch(`https://cdn.jsdelivr.net/npm/typescript@${tsLibVersion}/lib/${libName}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`Failed to fetch TS lib: ${libName}`);
            }
            return res.text();
          })
          .then(text => {
            tsLibCache[libName] = text;
            console.log(`[Validation] Loaded and cached TS lib: ${libName}`);
          })
          .catch(err => {
            console.error(`[Validation] Error fetching TS lib ${libName}:`, err);
          })
      );
    }
  }
  await Promise.all(promises);
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  language: 'javascript' | 'typescript' | 'jsx' | 'tsx';
}

export interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
  source: 'typescript' | 'linter' | 'syntax';
}

export interface ValidationWarning {
  line: number;
  column: number;
  message: string;
  source: 'typescript' | 'linter';
}

/**
 * Determine the appropriate language/editor mode based on function return type
 */
export function determineLanguageFromReturnType(returnType: string): 'javascript' | 'typescript' | 'jsx' | 'tsx' {
  const normalizedType = returnType.toLowerCase().trim();
  
  // JSX/React return types
  const jsxReturnTypes = [
    'jsx.element',
    'react.reactnode',
    'reactnode',
    'react.element',
    'react.component',
    'react.fc',
    'react.functioncomponent',
    'element',
    'component',
  ];
  
  const hasJsxReturn = jsxReturnTypes.some(type => 
    normalizedType.includes(type) || normalizedType.includes('<') || normalizedType.includes('>')
  );
  
  if (hasJsxReturn) {
    // Check if it has TypeScript features
    const hasTypeScript = normalizedType.includes(':') || normalizedType.includes('interface') || normalizedType.includes('type');
    return hasTypeScript ? 'tsx' : 'jsx';
  }
  
  // Check for TypeScript features in return type
  const hasTypeScript = normalizedType.includes(':') || normalizedType.includes('interface') || normalizedType.includes('type') || normalizedType.includes('generic');
  
  return hasTypeScript ? 'typescript' : 'javascript';
}

/**
 * Validate function source code based on its expected return type
 */
export async function validateFunctionCode(
  source: string,
  propName: string,
  propDefinition?: PropDefinition,
  params?: string
): Promise<ValidationResult> {
  const returnType = propDefinition?.functionSignature?.returnType || 'any';
  const language = determineLanguageFromReturnType(returnType);
  
  // Skip validation for empty source code
  if (!source.trim()) {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      language
    };
  }
  
  console.log(`🔍 Validating function ${propName}:`, {
    returnType,
    detectedLanguage: language,
    hasParams: !!params
  });

  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  try {
    // Basic syntax validation first
    const syntaxErrors = validateSyntax(source, language, params);
    if (syntaxErrors.length > 0) {
      console.log(`[Validation] Syntax errors for ${propName}:`, syntaxErrors);
    }
    errors.push(...syntaxErrors);
    
    // TypeScript validation for TS/TSX
    if (language === 'typescript' || language === 'tsx' || language === 'javascript') {
      const tsValidationErrors = await validateWithTypeScript(source, language, params, returnType);
      if (tsValidationErrors.length > 0) {
        console.log(`[Validation] TypeScript errors for ${propName}:`, tsValidationErrors);
      }
      errors.push(...tsValidationErrors);
    }
    
    // Custom linting with browser-compatible parsers
    const lintResults = validateWithCustomLinter(source, language, params);
    if (lintResults.errors.length > 0 || lintResults.warnings.length > 0) {
      console.log(`[Validation] Linter results for ${propName}:`, lintResults);
    }
    errors.push(...lintResults.errors);
    warnings.push(...lintResults.warnings);
    
    // Return type specific validation
    const returnTypeErrors = validateReturnType(source, returnType, language);
    errors.push(...returnTypeErrors);
    
  } catch (error) {
    errors.push({
      line: 1,
      column: 1,
      message: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
      severity: 'error',
      source: 'syntax'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    language
  };
}

/**
 * Basic syntax validation
 */
function validateSyntax(source: string, language: string, params?: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  try {
    // Create a complete function for parsing
    const fullFunction = params 
      ? `function temp(${params}) {\n${source}\n}`
      : `function temp() {\n${source}\n}`;
    
    // Always use Babel parser for its robustness with modern syntax, JSX, and TS
    babelParse(fullFunction, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'], // Enable both for maximum compatibility
    });

  } catch (error: any) {
    errors.push({
      line: error.loc ? error.loc.line : 1,
      column: error.loc ? error.loc.column + 1 : 1,
      message: error.message
        .replace(/\(\d+:\d+\)$/, '') // Clean up Babel's error message
        .trim(),
      severity: 'error',
      source: 'syntax'
    });
  }
  
  return errors;
}

/**
 * TypeScript validation using TypeScript Compiler API
 */
async function validateWithTypeScript(
  source: string, 
  language: string, 
  params?: string, 
  returnType?: string
): Promise<ValidationError[]> {
  if (typeof ts === 'undefined' || !ts.createSourceFile) {
    console.warn('TypeScript compiler API is not available. Skipping TypeScript validation.');
    return [];
  }
  const errors: ValidationError[] = [];
  
  try {
    // Ensure required TypeScript library files are loaded
    const libFiles = ["lib.esnext.d.ts", "lib.dom.d.ts"];
    await ensureTsLibsAreLoaded(libFiles);

    // Create TypeScript source file
    const fullSource = `
      declare var React: any; // Add React declaration for JSX
      function temp(${params || ''}): ${returnType || 'any'} {
        ${source}
      }
    `;
    
    const options: ts.CompilerOptions = {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      jsx: (language === 'tsx' || language === 'jsx') ? ts.JsxEmit.ReactJSX : ts.JsxEmit.None,
      strict: true,
      noImplicitAny: false,
      noEmit: true,
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      lib: libFiles
    };
    
    const compilerHost: ts.CompilerHost = {
      getSourceFile: (fileName, languageVersion) => {
        if (fileName === 'temp.ts') {
          return ts.createSourceFile(fileName, fullSource, options.target!, true);
        }
        const libSource = tsLibCache[fileName];
        if (libSource) {
          return ts.createSourceFile(fileName, libSource, options.target!, true);
        }
        console.warn(`[Validation] TS source file not found in cache: ${fileName}`);
        return undefined;
      },
      writeFile: () => {},
      getDefaultLibFileName: () => ts.getDefaultLibFileName(options),
      useCaseSensitiveFileNames: () => false,
      getCanonicalFileName: fileName => fileName,
      getCurrentDirectory: () => '',
      getNewLine: () => '\n',
      fileExists: fileName => {
        return fileName === 'temp.ts' || !!tsLibCache[fileName];
      },
      readFile: fileName => {
        if (fileName === 'temp.ts') {
          return fullSource;
        }
        return tsLibCache[fileName];
      },
      resolveModuleNames: (moduleNames, containingFile) => {
        // Basic module resolution for things like 'react'
        return moduleNames.map(moduleName => {
          if (moduleName === 'react' || moduleName.startsWith('@types/react')) {
            // In a browser environment, we can't really resolve node_modules.
            // We rely on ambient declarations (like `declare var React: any;`)
            // or pre-loaded type definitions.
            return { resolvedFileName: `node_modules/${moduleName}/index.d.ts`, isExternalLibraryImport: true };
          }
          return undefined;
        });
      }
    };
    
    const program = ts.createProgram(['temp.ts'], options, compilerHost);
    const diagnostics = ts.getPreEmitDiagnostics(program);

    diagnostics.forEach(diagnostic => {
      if (diagnostic.file && diagnostic.start !== undefined) {
        const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        
        errors.push({
          line: line + 1,
          column: character + 1,
          message,
          severity: 'error',
          source: 'typescript'
        });
      } else {
        errors.push({
          line: 1,
          column: 1,
          message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
          severity: 'error',
          source: 'typescript'
        });
      }
    });

  } catch (error) {
    errors.push({
      line: 1,
      column: 1,
      message: `TypeScript validation failed: ${error instanceof Error ? error.message : String(error)}`,
      severity: 'error',
      source: 'syntax'
    });
  }
  
  return filterIgnoredTsErrors(errors);
}

/**
 * Filter out common, unhelpful TypeScript errors that arise from the virtual environment.
 */
function filterIgnoredTsErrors(errors: ValidationError[]): ValidationError[] {
  const ignoredErrorPatterns = [
    /Cannot find global type \'\w+\'\./,
    /Cannot find name \'\w+\'\. Did you mean \'.*\'\?/,
    /Cannot find namespace \'\w+\'\./,
    /File \'lib\.\w+\.d\.ts\' not found\./,
  ];

  const specificAllowedErrors = [
    /Cannot find name \'\w+\'\./, // This will keep errors like "Cannot find name 'con'."
  ];

  return errors.filter(error => {
    // If a more specific pattern allows it, keep it.
    if (specificAllowedErrors.some(pattern => pattern.test(error.message))) {
      // But still check if it's a generic "did you mean" error that should be ignored
      return !/Cannot find name \'\w+\'\. Did you mean \'.*\'\?/.test(error.message);
    }

    // Otherwise, filter it out if it matches any of the ignored patterns.
    return !ignoredErrorPatterns.some(pattern => pattern.test(error.message));
  });
}

/**
 * Browser-compatible linting using Babel parser and custom rules
 */
function validateWithCustomLinter(source: string, language: string, params?: string): {
  errors: ValidationError[];
  warnings: ValidationWarning[];
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  try {
    // Create full function for parsing
    const fullSource = params 
      ? `function temp(${params}) {\n${source}\n}`
      : `function temp() {\n${source}\n}`;
    
    // Use Babel parser for TypeScript/JSX (like Prettier does)
    const ast = babelParse(fullSource, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'], // Enable both for maximum compatibility
      allowReturnOutsideFunction: true
    });
        
    // Validate custom rules with Babel traverse
    validateCustomRules(ast, source, params, errors, warnings);

  } catch (error) {
    // Linter should not crash validation, just report it
    console.warn('Custom linter failed:', error);
  }
  
  return { errors, warnings };
}

/**
 * Validates custom rules using @babel/traverse for a unified AST
 */
function validateCustomRules(ast: any, source: string, params: string | undefined, errors: ValidationError[], warnings: ValidationWarning[]) {
  // Example custom rule: Check for console.log statements
  traverse(ast, {
    CallExpression(path: NodePath) {
      if (!path.isCallExpression()) return;
      const { node } = path;
      if (
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier' &&
        node.callee.object.name === 'console' &&
        node.callee.property.type === 'Identifier' &&
        ['log', 'warn', 'error', 'info', 'debug'].includes(node.callee.property.name)
      ) {
        // @ts-ignore
        const { line, column } = node.loc.start;
        
        warnings.push({
          line: line > 2 ? line - 2 : line, // Adjust for function wrapper
          column: column + 1,
          message: `Avoid using console.${node.callee.property.name} in component props.`,
          source: 'linter'
        });
      }
    }
  });
}

/**
 * Validates JavaScript-specific rules (currently empty, for future use)
 * This is where you might check for things like `var` usage, etc.
 */
function validateJavaScriptRules(ast: any, source: string, params: string | undefined, errors: ValidationError[], warnings: ValidationWarning[]) {
  // Placeholder for future JS-specific rules using Babel's traverse
}

/**
 * Validate that the function returns the expected type
 */
function validateReturnType(source: string, expectedReturnType: string, language: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const normalizedType = expectedReturnType.toLowerCase().trim();
  
  // Skip if we don't have a clear type to check against
  if (normalizedType === 'any' || normalizedType === 'void') {
    return errors;
  }
  
  // Check for JSX return when it's not expected
  if (language !== 'jsx' && language !== 'tsx') {
    if (source.includes('<') && source.includes('>')) {
      errors.push({
        line: 1,
        column: 1,
        message: `Function may not return JSX, but code contains JSX-like syntax. Expected return type: ${expectedReturnType}`,
        severity: 'error',
        source: 'linter'
      });
    }
  }

  // Check for explicit return statements
  if (source.trim() && !source.includes('return')) {
    // If it's a single line and looks like an expression, it's likely an implicit return
    const isSingleLineExpression = !source.includes('\n') && !source.endsWith(';');
    if (!isSingleLineExpression) {
      errors.push({
        line: 1,
        column: 1,
        message: `Function is expected to return a value of type '${expectedReturnType}', but no return statement was found.`,
        severity: 'error',
        source: 'linter'
      });
    }
  }

  // A simple check to see if the return statement is followed by something that looks like JSX
  if (language === 'jsx' || language === 'tsx') {
    const returnRegex = /return\s*([(<[{])[\s\S]*?[>}\])]/;
    if (source.includes('return') && !returnRegex.test(source)) {
      errors.push({
        line: 1,
        column: 1,
        message: `Function is expected to return JSX, but the return statement doesn't seem to return a valid JSX element. Try wrapping your JSX in parentheses: return (...)`,
        severity: 'error',
        source: 'linter'
      });
    }
  }
  
  return errors;
}

/**
 * Get appropriate Monaco Editor language based on validation result
 */
export function getMonacoLanguage(validationResult: ValidationResult): string {
  switch (validationResult.language) {
    case 'jsx':
      return 'javascript'; // Monaco doesn't have JSX, uses JS with JSX support
    case 'tsx':
      return 'typescript'; // Monaco TypeScript includes JSX support
    case 'typescript':
      return 'typescript';
    case 'javascript':
    default:
      return 'javascript';
  }
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  
  return errors
    .map(error => `Line ${error.line}:${error.column} - ${error.message}`)
    .join('\n');
}

/**
 * Get a simple validation summary
 */
export function getValidationSummary(result: ValidationResult): string {
  const { errors, warnings } = result;
  
  if (errors.length === 0 && warnings.length === 0) {
    return '✅ No issues found';
  }
  
  const parts = [];
  if (errors.length > 0) {
    parts.push(`❌ ${errors.length} error${errors.length !== 1 ? 's' : ''}`);
  }
  if (warnings.length > 0) {
    parts.push(`⚠️ ${warnings.length} warning${warnings.length !== 1 ? 's' : ''}`);
  }
  
  return parts.join(', ');
} 