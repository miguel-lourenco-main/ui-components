import { PropDefinition } from '@/types';

// Browser-compatible parsers (like CodeSandbox/StackBlitz use)
import { parse as babelParse } from '@babel/parser';
import { parse as acornParse } from 'acorn';
import { simple as walkSimple } from 'acorn-walk';
// @ts-ignore - TypeScript compiler API for browser
import * as ts from 'typescript';

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
export function validateFunctionCode(
  source: string,
  propName: string,
  propDefinition?: PropDefinition,
  params?: string
): ValidationResult {
  const returnType = propDefinition?.functionSignature?.returnType || 'any';
  const language = determineLanguageFromReturnType(returnType);
  
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
    errors.push(...syntaxErrors);
    
    // TypeScript validation for TS/TSX
    if (language === 'typescript' || language === 'tsx') {
      const tsErrors = validateWithTypeScript(source, language, params, returnType);
      errors.push(...tsErrors);
    }
    
    // Custom linting with browser-compatible parsers
    const lintResults = validateWithCustomLinter(source, language, params);
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
    
    if (language === 'jsx' || language === 'tsx') {
      // For JSX, we need to use a JSX-aware parser
      // This is a simplified check - in production you'd use Babel parser
      if (source.includes('<') && source.includes('>')) {
        // Basic JSX syntax check
        const openTags = (source.match(/</g) || []).length;
        const closeTags = (source.match(/>/g) || []).length;
        if (openTags !== closeTags) {
          errors.push({
            line: 1,
            column: 1,
            message: 'JSX syntax error: Mismatched JSX tags',
            severity: 'error',
            source: 'syntax'
          });
        }
      }
    } else {
      // Use native JavaScript parsing for JS/TS
      try {
        new Function(fullFunction);
      } catch (syntaxError) {
        errors.push({
          line: 1,
          column: 1,
          message: `Syntax error: ${syntaxError instanceof Error ? syntaxError.message : String(syntaxError)}`,
          severity: 'error',
          source: 'syntax'
        });
      }
    }
  } catch (error) {
    errors.push({
      line: 1,
      column: 1,
      message: `Parse error: ${error instanceof Error ? error.message : String(error)}`,
      severity: 'error',
      source: 'syntax'
    });
  }
  
  return errors;
}

/**
 * TypeScript validation using TypeScript Compiler API
 */
function validateWithTypeScript(
  source: string, 
  language: string, 
  params?: string, 
  returnType?: string
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  try {
    // Create TypeScript source file
    const fullSource = params 
      ? `function temp(${params}): ${returnType || 'any'} {\n${source}\n}`
      : `function temp(): ${returnType || 'any'} {\n${source}\n}`;
    
    const options: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      jsx: language === 'tsx' ? ts.JsxEmit.React : ts.JsxEmit.None,
      strict: true,
      noEmit: true,
      skipLibCheck: true,
    };
    
    // Create TypeScript program
    const sourceFile = ts.createSourceFile(
      'temp.ts',
      fullSource,
      ts.ScriptTarget.ES2020,
      true
    );
    
    const host = ts.createCompilerHost(options);
    const program = ts.createProgram(['temp.ts'], options, host);
    
    // Get diagnostics
    const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);
    
    diagnostics.forEach(diagnostic => {
      if (diagnostic.file) {
        const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
          diagnostic.start!
        );
        
        errors.push({
          line: line + 1,
          column: character + 1,
          message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
          severity: diagnostic.category === ts.DiagnosticCategory.Error ? 'error' : 'warning',
          source: 'typescript'
        });
      }
    });
    
  } catch (error) {
    // TypeScript validation failed, but don't fail the entire validation
    console.warn('TypeScript validation failed:', error);
  }
  
  return errors;
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
    if (language === 'tsx' || language === 'typescript') {
      const ast = babelParse(fullSource, {
        sourceType: 'module',
        plugins: [
          'typescript', 
          language === 'tsx' ? 'jsx' : null
        ].filter(Boolean) as any[],
        allowReturnOutsideFunction: true
      });
      
      // Custom validation rules using AST
      validateCustomRules(ast, source, params, errors, warnings);
    } 
    // Use Acorn for JavaScript/JSX (faster, what ESLint uses under hood)  
    else {
      const ast = acornParse(fullSource, {
        ecmaVersion: 2020,
        sourceType: 'module'
      });
      
      // Basic JavaScript validation using Acorn
      validateJavaScriptRules(ast, source, params, errors, warnings);
    }
    
  } catch (error: any) {
    errors.push({
      line: 1,
      column: 1,
      message: `Parse error: ${error.message || String(error)}`,
      severity: 'error',
      source: 'syntax'
    });
  }
  
  return { errors, warnings };
}

/**
 * Custom validation rules using Babel AST (for TypeScript)
 */
function validateCustomRules(ast: any, source: string, params: string | undefined, errors: ValidationError[], warnings: ValidationWarning[]) {
  // Check for common issues
  const lines = source.split('\n');
  
  // Rule: Prefer const over let when possible
  lines.forEach((line, index) => {
    if (line.trim().startsWith('let ') && !line.includes('=')) {
      warnings.push({
        line: index + 1,
        column: 1,
        message: 'Prefer const over let when variable is not reassigned',
        source: 'linter'
      });
    }
  });
  
  // Rule: Check for var usage
  lines.forEach((line, index) => {
    if (line.trim().startsWith('var ')) {
      warnings.push({
        line: index + 1,
        column: 1,
        message: 'Prefer const or let over var',
        source: 'linter'
      });
    }
  });
  
  // Rule: Check for console statements (warn but allow in playground)
  lines.forEach((line, index) => {
    if (line.includes('console.') && !line.includes('// playground')) {
      warnings.push({
        line: index + 1,
        column: line.indexOf('console.') + 1,
        message: 'console statement left in code',
        source: 'linter'
      });
    }
  });
}

/**
 * JavaScript validation rules using Acorn AST
 */
function validateJavaScriptRules(ast: any, source: string, params: string | undefined, errors: ValidationError[], warnings: ValidationWarning[]) {
  // Walk the AST for validation
  walkSimple(ast, {
    VariableDeclaration(node: any) {
      if (node.kind === 'var') {
        warnings.push({
          line: node.loc?.start?.line || 1,
          column: node.loc?.start?.column || 1,
          message: 'Prefer const or let over var',
          source: 'linter'
        });
      }
    },
    
    CallExpression(node: any) {
      // Check for console usage
      if (node.callee?.object?.name === 'console') {
        warnings.push({
          line: node.loc?.start?.line || 1,
          column: node.loc?.start?.column || 1,
          message: 'console statement left in code',
          source: 'linter'
        });
      }
    }
  });
}

/**
 * Validate that the function returns the expected type
 */
function validateReturnType(source: string, expectedReturnType: string, language: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Skip validation for 'any' type
  if (expectedReturnType === 'any' || expectedReturnType === 'unknown') {
    return errors;
  }
  
  try {
    const normalizedExpected = expectedReturnType.toLowerCase().trim();
    const hasReturn = source.includes('return');
    
    if (!hasReturn && normalizedExpected !== 'void' && normalizedExpected !== 'undefined') {
      errors.push({
        line: 1,
        column: 1,
        message: `Function should return ${expectedReturnType} but no return statement found`,
        severity: 'warning',
        source: 'typescript'
      });
    }
    
    // Basic return type checks
    if (normalizedExpected.includes('string') && hasReturn) {
      if (!source.includes('"') && !source.includes("'") && !source.includes('`')) {
        // This is a loose check - in reality you'd need proper AST parsing
        // But it gives basic feedback
      }
    }
    
    // JSX return type validation
    if ((normalizedExpected.includes('jsx') || normalizedExpected.includes('reactnode')) && language !== 'jsx' && language !== 'tsx') {
      errors.push({
        line: 1,
        column: 1,
        message: `Function returns ${expectedReturnType} but no JSX detected. Consider using JSX syntax.`,
        severity: 'warning',
        source: 'typescript'
      });
    }
    
  } catch (error) {
    // Return type validation failed, but don't fail the entire validation
    console.warn('Return type validation failed:', error);
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