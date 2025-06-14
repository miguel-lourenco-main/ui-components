'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { PropDefinition } from '@/types';
import { AlertTriangleIcon, CheckIcon, CodeIcon, Trash2Icon } from 'lucide-react';
import { parse, Parser } from 'acorn';
import { simple as walkSimple } from 'acorn-walk';
import jsx from 'acorn-jsx';
import { debugLog } from '@/lib/constants';
import { FunctionPropValue } from '@/types';
import { 
  isFunctionPropValue, 
  getFunctionSource, 
  setFunctionSource,
  functionPropValueToFunction 
} from '@/lib/utils/functionProps';

interface FunctionPropEditorProps {
  prop: PropDefinition;
  value: any;
  onChange: (value: any) => void;
  isExpanded: boolean;
  onToggleExpansion: () => void;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  compiledFunction?: Function;
  warnings?: string[];
}

export default function FunctionPropEditor({
  prop,
  value,
  onChange,
  isExpanded,
  onToggleExpansion,
}: FunctionPropEditorProps) {
  const [functionBody, setFunctionBody] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [lastSentFunctionBody, setLastSentFunctionBody] = useState<string>('');
  
  // Use ref to store current onChange to avoid dependency loops
  const onChangeRef = useRef(onChange);
  
  // Update ref when onChange changes
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  
  // Extract function signature from prop definition, description, or generate default
  const getFunctionSignature = useCallback(() => {
    // First priority: Use functionSignature from prop definition if available
    if (prop.functionSignature) {
      return {
        params: prop.functionSignature.params,
        returnType: prop.functionSignature.returnType
      };
    }
    
    // Second priority: Try to extract signature from description
    if (prop.description) {
      const signatureMatch = prop.description.match(/\((.*?)\)\s*=>\s*(.+)/);
      if (signatureMatch) {
        const [, params, returnType] = signatureMatch;
        return {
          params: params.trim(),
          returnType: returnType.trim()
        };
      }
    }
    
    // Last resort: Default signatures for common function prop patterns
    const commonSignatures: Record<string, { params: string; returnType: string }> = {
      onClick: { params: 'event: React.MouseEvent', returnType: 'void' },
      onChange: { params: 'value: string | React.ChangeEvent', returnType: 'void' },
      onSubmit: { params: 'event: React.FormEvent', returnType: 'void' },
      onSelect: { params: 'value: any', returnType: 'void' },
      onError: { params: 'error: Error', returnType: 'void' },
      onInput: { params: 'event: React.FormEvent', returnType: 'void' },
      onFocus: { params: 'event: React.FocusEvent', returnType: 'void' },
      onBlur: { params: 'event: React.FocusEvent', returnType: 'void' },
      validator: { params: 'value: any', returnType: 'boolean' },
      formatter: { params: 'value: any', returnType: 'string' },
      filter: { params: 'item: any', returnType: 'boolean' },
      transform: { params: 'value: any', returnType: 'any' },
    };
    
    return commonSignatures[prop.name] || { params: '...args: any[]', returnType: 'any' };
  }, [prop.functionSignature, prop.description, prop.name]);

  // Initialize function body from current value
  useEffect(() => {
    const source = getFunctionSource(value);
    setFunctionBody(source);
    
    // Mark as initialized after processing the value
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [value, isInitialized, prop.name]);

  // Function body validation helper
  const validateFunctionBody = useCallback((code: string, propName: string): ValidationResult | null => {
    const bodyViolations = [
      { pattern: /^\s*function\s+\w+\s*\(/, message: "Don't write complete function declarations - just the body" },
      { pattern: /^\s*const\s+\w+\s*=\s*function/, message: "Don't write complete function declarations - just the body" },
      { pattern: /^\s*\w+\s*=>\s*{/, message: "Don't write arrow functions - just the body" },
      { pattern: /^\s*class\s+\w+/, message: "Class declarations are not allowed in function bodies" },
    ];

    for (const { pattern, message } of bodyViolations) {
      if (pattern.test(code)) {
        debugLog('FUNCTION_EDITOR', `❌ VALIDATION: Body violation for ${propName}:`, { pattern: pattern.toString(), message, code });
        return {
          isValid: false,
          error: `Invalid function body: ${message}`
        };
      }
    }
    debugLog('FUNCTION_EDITOR', `✅ VALIDATION: Body check passed for ${propName}`);
    return null; // No body violations found
  }, []);

    // Browser-compatible scope analysis using walkSimple
  const performScopeAnalysis = useCallback((ast: any, jsParams: string, propName: string): ValidationResult & { warnings?: string[] } => {
    const warnings: string[] = [];
    const undefinedVars = new Set<string>();
    
    // Define allowed global variables
    const allowedGlobals = new Set([
      // JavaScript built-ins
      'console', 'Math', 'Date', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean',
      'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent',
      'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Promise',
      // Literals and special values
      'undefined', 'null', 'NaN', 'Infinity',
      // Common parameters and React-related globals
      'value', 'data', 'index', 'item', 'error', 'response', 'result',
      'props', 'state', 'ref', 'key', 'React'
    ]);

    // Add function parameters to allowed globals
    const params = jsParams.split(',').map(p => {
      const trimmed = p.trim();
      return trimmed.replace(/^[{\.]+|[}]+$/g, '').split(/\s+/).pop() || '';
    }).filter(Boolean);
    params.forEach(param => allowedGlobals.add(param));
    
    debugLog('FUNCTION_EDITOR', `🔍 Browser-compatible scope analysis for ${propName}:`, {
      extractedParams: params,
      allowedGlobals: Array.from(allowedGlobals)
    });

    // Get cached known methods for validation
    const getKnownMethods = (): Record<string, string[]> => {
      if (!(window as any).__functionEditorMethodCache) {
        const cache: Record<string, string[]> = {
          console: ['log', 'error', 'warn', 'info', 'debug', 'trace', 'table', 'group', 'groupEnd', 'clear'],
          Math: ['abs', 'ceil', 'floor', 'round', 'max', 'min', 'random', 'sqrt', 'pow', 'sin', 'cos', 'tan'],
          Date: ['now', 'parse', 'UTC'],
          JSON: ['parse', 'stringify'],
          Object: ['keys', 'values', 'entries', 'assign', 'create', 'freeze', 'hasOwnProperty'],
          Array: ['from', 'isArray', 'of'],
          String: ['fromCharCode', 'raw'],
          Number: ['isNaN', 'isFinite', 'parseInt', 'parseFloat', 'isInteger'],
          React: ['createElement', 'Fragment', 'Component', 'PureComponent']
        };
        (window as any).__functionEditorMethodCache = cache;
      }
      return (window as any).__functionEditorMethodCache;
    };

    const knownMethods = getKnownMethods();

    // Walk the AST to find undefined variables and validate method calls
    walkSimple(ast, {
      Identifier(node: any) {
        const name = node.name;
        if (!allowedGlobals.has(name)) {
          undefinedVars.add(name);
        }
      },
      
      MemberExpression(node: any) {
        if (node.object && node.object.type === 'Identifier') {
          const objectName = node.object.name;
          if (allowedGlobals.has(objectName)) {
            undefinedVars.delete(objectName);
            
            // Validate method/property names on known objects
            if (knownMethods[objectName] && node.property && node.property.type === 'Identifier') {
              const propertyName = node.property.name;
              const validMethods = knownMethods[objectName];
              
              if (!validMethods.includes(propertyName)) {
                warnings.push(`BLOCKING: Unknown method '${objectName}.${propertyName}' - this will cause a runtime error. Available methods: ${validMethods.slice(0, 5).join(', ')}${validMethods.length > 5 ? '...' : ''}`);
              }
            }
          }
        }
      }
    });

    // Process undefined variables with suggestions
    Array.from(undefinedVars).forEach(varName => {
      if (/^[a-z]$/.test(varName) && !['i', 'j', 'x', 'y', 'n'].includes(varName)) {
        warnings.push(`BLOCKING: Undefined variable '${varName}' - this looks like a typo. Available parameters: ${params.join(', ') || 'none'}`);
        return;
      }
      
      let suggestion = '';
      if (params.length > 0) {
        const similarParam = params.find(param => 
          param.toLowerCase().includes(varName.toLowerCase()) || 
          varName.toLowerCase().includes(param.toLowerCase())
        );
        suggestion = similarParam ? ` Did you mean '${similarParam}'?` : ` Available parameters: ${params.join(', ')}`;
      }
      
      warnings.push(`Unknown variable '${varName}' - this may cause runtime errors.${suggestion}`);
    });

    // Check for blocking errors
    const blockingErrors = warnings.filter(w => w.startsWith('BLOCKING:'));
    if (blockingErrors.length > 0) {
      return {
        isValid: false,
        error: blockingErrors[0].replace('BLOCKING: ', '')
      };
    }

    debugLog('FUNCTION_EDITOR', `✅ Browser-compatible scope analysis complete for ${propName}:`, {
      warnings: warnings.length,
      undefinedVariables: undefinedVars.size,
      allowedGlobals: allowedGlobals.size
    });

    return { isValid: true, warnings };
  }, []);

  // Return type validation helper
  const validateReturnType = useCallback((ast: any, code: string, returnType: string): string[] => {
    const warnings: string[] = [];
    let hasExplicitReturn = false;
    
    walkSimple(ast, {
      ReturnStatement(node: any) {
        hasExplicitReturn = true;
        if (node.argument) {
          const returnValueSource = code.slice(node.argument.start, node.argument.end);
          
          // Enhanced type checking with better error messages
          if (returnType === 'boolean') {
            if (/^["'`]/.test(returnValueSource)) {
              warnings.push(`Expected boolean return type, but found string: ${returnValueSource}`);
            } else if (/^\d+(\.\d+)?$/.test(returnValueSource)) {
              warnings.push(`Expected boolean return type, but found number: ${returnValueSource}`);
            } else if (/^null|undefined$/.test(returnValueSource)) {
              warnings.push(`Expected boolean return type, but found: ${returnValueSource}`);
            }
          } else if (returnType === 'string') {
            if (/^(true|false)$/.test(returnValueSource)) {
              warnings.push(`Expected string return type, but found boolean: ${returnValueSource}`);
            } else if (/^\d+(\.\d+)?$/.test(returnValueSource)) {
              warnings.push(`Expected string return type, but found number: ${returnValueSource}`);
            } else if (/^null|undefined$/.test(returnValueSource)) {
              warnings.push(`Expected string return type, but found: ${returnValueSource}`);
            }
          } else if (returnType === 'number') {
            if (/^(true|false)$/.test(returnValueSource)) {
              warnings.push(`Expected number return type, but found boolean: ${returnValueSource}`);
            } else if (/^["'`].*["'`]$/.test(returnValueSource)) {
              warnings.push(`Expected number return type, but found string: ${returnValueSource}`);
            } else if (/^null|undefined$/.test(returnValueSource)) {
              warnings.push(`Expected number return type, but found: ${returnValueSource}`);
            }
          } else if (returnType === 'React.ReactNode' || returnType.includes('ReactNode')) {
            if (!/^(<|React\.|null|undefined|["'`]|{\s*|\/\*|\d+)/.test(returnValueSource)) {
              warnings.push(`Expected React.ReactNode return type. Consider returning JSX, string, number, or null: ${returnValueSource}`);
            }
          }
        }
      }
    });
    
    // Check for implicit returns
    if (!hasExplicitReturn && !code.includes('return')) {
      const trimmedCode = code.trim();
      if (trimmedCode && !trimmedCode.startsWith('{') && returnType !== 'void') {
        if (returnType === 'boolean' && !/^(true|false|!|\w+\s*[<>=!]+)/.test(trimmedCode)) {
          warnings.push(`Expected boolean return type. Consider adding explicit return statement or boolean expression.`);
        } else if (returnType === 'string' && !/^["'`]/.test(trimmedCode)) {
          warnings.push(`Expected string return type. Consider wrapping in quotes or adding explicit return statement.`);
        }
      }
    }
    
    // Warn about void return type with explicit returns
    if (returnType === 'void' && hasExplicitReturn) {
      warnings.push(`Function has void return type but contains return statements. Consider removing return values.`);
    }
    
    return warnings;
  }, []);

  // Function compilation helper
  const compileFunction = useCallback((fullFunction: string, code: string, propName: string, warnings: string[]): ValidationResult => {
    try {
      // Only create function for non-JSX content
      const actualFunction = new Function('return ' + fullFunction)();
      
      // Add debugging to track where execution comes from
      const wrappedFunction = (...args: any[]) => {
        debugLog('FUNCTION_EDITOR', `🚀 FUNCTION CALLED: ${propName} with args:`, args);
        if (process.env.NODE_ENV === 'development') {
          console.trace('Function call stack:');
        }
        return actualFunction(...args);
      };
      
      // Copy properties to maintain function identity
      Object.defineProperty(wrappedFunction, 'name', { value: actualFunction.name });
      (wrappedFunction as any).__originalSource = code;
      (wrappedFunction as any).__propName = propName;
      
      debugLog('FUNCTION_EDITOR', `✅ VALIDATION: Function compilation successful for ${propName}`);
      return {
        isValid: true,
        compiledFunction: wrappedFunction,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    } catch (error) {
      debugLog('FUNCTION_EDITOR', `❌ VALIDATION: Function compilation failed for ${propName}:`, error);
      return {
        isValid: false,
        error: `Function compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }, []);

  // Enhanced helper to detect JSX elements in JSX-aware AST
  const containsJSXElements = useCallback((ast: any): boolean => {
    let hasJSX = false;
    
    const checkNode = (node: any) => {
      if (!node || hasJSX) return;
      
      // Check for JSX node types from acorn-jsx
      if (node.type === 'JSXElement' || 
          node.type === 'JSXFragment' || 
          node.type === 'JSXText' ||
          node.type === 'JSXExpressionContainer' ||
          node.type === 'JSXAttribute' ||
          node.type === 'JSXOpeningElement' ||
          node.type === 'JSXClosingElement' ||
          node.type === 'JSXIdentifier') {
        hasJSX = true;
        return;
      }
      
      // Recursively check child nodes
      for (const key in node) {
        if (node.hasOwnProperty(key)) {
          const child = node[key];
          if (Array.isArray(child)) {
            child.forEach(checkNode);
          } else if (child && typeof child === 'object') {
            checkNode(child);
          }
        }
      }
    };
    
    checkNode(ast);
    return hasJSX;
  }, []);

  // Enhanced JSX validation helper using JSX parser
  const validateJSX = useCallback((code: string, fullFunction: string, propName: string): ValidationResult | null => {
    try {
      // Try to parse with JSX parser - if it succeeds, JSX is valid
      const JSXParser = Parser.extend(jsx());
      const jsxAst = JSXParser.parse(fullFunction, { 
        ecmaVersion: 2020,
        sourceType: 'script',
        locations: false
      });
      
      // Check if it actually contains JSX
      const actuallyHasJSX = containsJSXElements(jsxAst);
      
      debugLog('FUNCTION_EDITOR', `✅ VALIDATION: JSX parsing successful for ${propName}, contains JSX: ${actuallyHasJSX}`);
      return null; // JSX validation passed
      
    } catch (jsxError) {
      // JSX parsing failed - provide helpful error message
      const errorMessage = jsxError instanceof Error ? jsxError.message : 'Invalid JSX syntax';
      
      debugLog('FUNCTION_EDITOR', `❌ VALIDATION: JSX parsing failed for ${propName}:`, errorMessage);
      
      // Provide more specific error messages for common JSX issues
      if (errorMessage.includes('Unexpected token')) {
        return {
          isValid: false,
          error: `JSX syntax error: ${errorMessage}. Make sure JSX elements are properly closed and expression syntax is correct.`
        };
      } else if (errorMessage.includes('Missing closing tag')) {
        return {
          isValid: false,
          error: `JSX syntax error: Missing closing tag. Make sure all JSX elements are properly closed.`
        };
      } else {
        return {
          isValid: false,
          error: `JSX syntax error: ${errorMessage}`
        };
      }
    }
  }, [containsJSXElements]);

  // Security validation helper
  const validateSecurity = useCallback((code: string, propName: string): ValidationResult | null => {
    const securityPatterns = [
      { pattern: /\beval\s*\(/, message: "eval() is not allowed for security reasons" },
      { pattern: /\bFunction\s*\(/, message: "Function constructor is not allowed for security reasons" },
      { pattern: /\bnew\s+Function\s*\(/, message: "new Function() is not allowed for security reasons" },
      { pattern: /\bdocument\.cookie/, message: "Accessing document.cookie is not allowed" },
      { pattern: /\blocalStorage\s*\./, message: "Accessing localStorage directly is not recommended" },
      { pattern: /\bsessionStorage\s*\./, message: "Accessing sessionStorage directly is not recommended" },
      { pattern: /\bwindow\s*\.\s*location/, message: "Modifying window.location is not allowed" },
      { pattern: /\b(import|require)\s*\(/, message: "Dynamic imports are not allowed" },
    ];

    for (const { pattern, message } of securityPatterns) {
      if (pattern.test(code)) {
        debugLog('FUNCTION_EDITOR', `❌ VALIDATION: Security violation for ${propName}:`, { pattern: pattern.toString(), message, code });
        return {
          isValid: false,
          error: `Security violation: ${message}`
        };
      }
    }
    debugLog('FUNCTION_EDITOR', `✅ VALIDATION: Security check passed for ${propName}`);
    return null; // No security issues found
  }, []);

  // Validation cache for performance optimization
  const validationCache = useRef(new Map<string, ValidationResult>());

  // Main validation function - orchestrates all validation steps with caching and performance monitoring
  const validateFunction = useCallback((code: string): ValidationResult => {
    const startTime = performance.now();
    debugLog('FUNCTION_EDITOR', `🔍 VALIDATION START for ${prop.name}:`, { code, propName: prop.name });
    
    // Step 1: Handle empty code
    if (!code.trim()) {
      const duration = performance.now() - startTime;
      debugLog('FUNCTION_EDITOR', `✅ VALIDATION: Empty code is valid for ${prop.name} (${duration.toFixed(2)}ms)`);
      return { isValid: true };
    }

    // Step 2: Check cache for this exact code
    const signature = getFunctionSignature();
    const cacheKey = `${prop.name}:${JSON.stringify(signature)}:${code}`;
    
    if (validationCache.current.has(cacheKey)) {
      const cachedResult = validationCache.current.get(cacheKey)!;
      const duration = performance.now() - startTime;
      debugLog('FUNCTION_EDITOR', `🚀 VALIDATION: Cache hit for ${prop.name} (${duration.toFixed(2)}ms)`);
      return cachedResult;
    }

    // Step 3: Security validation
    const securityResult = validateSecurity(code, prop.name);
    if (securityResult) {
      validationCache.current.set(cacheKey, securityResult);
      return securityResult;
    }

    // Step 4: Function body validation
    const bodyResult = validateFunctionBody(code, prop.name);
    if (bodyResult) {
      validationCache.current.set(cacheKey, bodyResult);
      return bodyResult;
    }

    try {
      // Step 4: Prepare function signature
      const signature = getFunctionSignature();
      const jsParams = signature.params.split(',').map(param => {
        const trimmed = param.trim();
        const colonIndex = trimmed.indexOf(':');
        return colonIndex > -1 ? trimmed.substring(0, colonIndex).trim() : trimmed;
      }).join(', ');
      
      const fullFunction = `(${jsParams}) => {\n${code}\n}`;
      debugLog('FUNCTION_EDITOR', `🔍 VALIDATION: Creating full function for ${prop.name}:`, { 
        originalSignature: signature, 
        jsParams,
        fullFunction 
      });
      
            // Step 5: Enhanced syntax validation and AST parsing with JSX support
      let ast;
      let isJSXContent = false;
      try {
        // Use Acorn with JSX plugin for browser-compatible parsing with full JSX support
        debugLog('FUNCTION_EDITOR', `🔍 VALIDATION: Enhanced JSX-capable parsing for ${prop.name}`);
        
        // Create JSX-capable parser
        const JSXParser = Parser.extend(jsx());
        ast = JSXParser.parse(fullFunction, { 
          ecmaVersion: 2020,
          sourceType: 'script',
          locations: false
        });
        
        // Check if AST contains JSX elements
        isJSXContent = containsJSXElements(ast);
        debugLog('FUNCTION_EDITOR', `✅ VALIDATION: Enhanced AST parsing successful for ${prop.name}, JSX: ${isJSXContent}`);
      } catch (parseError) {
        debugLog('FUNCTION_EDITOR', `❌ VALIDATION: Parse error for ${prop.name}:`, parseError);
        return {
          isValid: false,
          error: `Syntax error: ${parseError instanceof Error ? parseError.message : 'Invalid JavaScript'}`
        };
      }

      const warnings: string[] = [];

      // Step 6: Enhanced scope analysis (works with both JS and JSX)
      if (ast) {
        const scopeResult = performScopeAnalysis(ast, jsParams, prop.name);
        if (scopeResult.isValid === false) {
          return scopeResult;
        }
        warnings.push(...(scopeResult.warnings || []));
      }

      // Step 7: Simple expression validation
      const trimmedCode = code.trim();
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(trimmedCode)) {
        const params = jsParams.split(',').map(p => p.trim()).filter(Boolean);
        const commonGlobals = ['console', 'Math', 'Date', 'JSON', 'undefined', 'null'];
        
        if (!params.includes(trimmedCode) && !commonGlobals.includes(trimmedCode)) {
          return {
            isValid: false,
            error: `Undefined variable '${trimmedCode}'. Did you mean to call a function like '${trimmedCode}()' or access a property like 'event.${trimmedCode}'?`
          };
        }
      }

      // Step 8: Enhanced return type validation (works with both JS and JSX)
      if (ast && signature.returnType !== 'any' && signature.returnType !== 'void') {
        const typeWarnings = validateReturnType(ast, code, signature.returnType);
        warnings.push(...typeWarnings);
      }

      // Step 9: Enhanced function compilation
      let result: ValidationResult;
      if (ast) {
        result = compileFunction(fullFunction, code, prop.name, warnings);
      } else {
        // This should rarely happen with typescript-estree
        debugLog('FUNCTION_EDITOR', `⚠️ VALIDATION: No AST generated for ${prop.name}`);
        result = {
          isValid: true,
          warnings: warnings.length > 0 ? warnings : undefined
        };
      }
      
      // Cache the result before returning
      validationCache.current.set(cacheKey, result);
      
      // Limit cache size to prevent memory leaks
      if (validationCache.current.size > 100) {
        const firstKey = validationCache.current.keys().next().value;
        if (firstKey) {
          validationCache.current.delete(firstKey);
        }
      }
      
      // Log performance metrics
      const duration = performance.now() - startTime;
      debugLog('FUNCTION_EDITOR', `✅ VALIDATION: Complete for ${prop.name} (${duration.toFixed(2)}ms)`, {
        cacheSize: validationCache.current.size,
        hasWarnings: result.warnings && result.warnings.length > 0,
        isValid: result.isValid
      });
      
      return result;
      
    } catch (error) {
      debugLog('FUNCTION_EDITOR', `❌ VALIDATION: Unexpected error for ${prop.name}:`, error);
      const errorResult = {
        isValid: false,
        error: error instanceof Error ? error.message : 'Validation error'
      };
      validationCache.current.set(cacheKey, errorResult);
      return errorResult;
    }
  }, [getFunctionSignature, validateSecurity, validateFunctionBody, validateJSX, performScopeAnalysis, validateReturnType, compileFunction, containsJSXElements]);

  // Handle code changes with debounced validation
  useEffect(() => {
    // Only call onChange after initial setup to prevent infinite loops
    if (!isInitialized) {
      debugLog('FUNCTION_EDITOR', '🛠️ FunctionPropEditor: Skipping onChange because not initialized yet', prop.name);
      return;
    }

    // Set typing flag
    setIsUserTyping(true);
    
    const timer = setTimeout(() => {
      debugLog('FUNCTION_EDITOR', '🛠️ FunctionPropEditor: Validating and calling onChange for', prop.name, 'functionBody:', functionBody.trim() ? 'has content' : 'empty', 'content preview:', functionBody.substring(0, 50));
      const result = validateFunction(functionBody);
      setValidationResult(result);
      
      // Only update if the validation result changed or if switching between valid/invalid states
      // This prevents unnecessary regeneration while typing
      const hasValidContent = result.isValid && functionBody.trim();
      const isEmpty = !functionBody.trim();
      
      // Update prop value based on validation and content
      if (result.isValid) {
        if (hasValidContent) {
          // Function has content and is valid - store as FunctionPropValue
          const signature = getFunctionSignature();
          const functionPropValue = setFunctionSource(functionBody, signature);
          
          debugLog('FUNCTION_EDITOR', '✅ FunctionPropEditor: Setting function prop value for', prop.name, 'content:', functionBody);
          
          // Only call onChange if the function content actually changed
          if (functionBody !== lastSentFunctionBody) {
            debugLog('FUNCTION_EDITOR', '✅ FunctionPropEditor: Function content changed from', `"${lastSentFunctionBody}"`, 'to', `"${functionBody}"`);
            setLastSentFunctionBody(functionBody);
            onChangeRef.current(functionPropValue);
          } else {
            debugLog('FUNCTION_EDITOR', '⏭️  FunctionPropEditor: Skipping onChange - content unchanged');
          }
        } else {
          // Function is empty - remove it from props
          const shouldRemoveFunction = lastSentFunctionBody !== '' || value !== undefined;
          
          if (shouldRemoveFunction) {
            debugLog('FUNCTION_EDITOR', '🛠️ FunctionPropEditor: Removing function for', prop.name, '(empty)');
            setLastSentFunctionBody('');
            onChangeRef.current(undefined);
          } else {
            debugLog('FUNCTION_EDITOR', '🛠️ FunctionPropEditor: Skipping onChange - already empty');
          }
        }
      } else {
        // Invalid function - don't update props, just show validation error
        debugLog('FUNCTION_EDITOR', '🛠️ FunctionPropEditor: Function invalid for', prop.name, '- not updating props');
      }

      // Reset typing flag after validation completes
      setIsUserTyping(false);
    }, 1000); // 1 second debounce as requested

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      // Don't reset typing flag here - let the timer handle it
    };
  }, [functionBody, validateFunction, isInitialized, prop.name]);

  // Clear function - resets the function body and removes it from props
  const handleClearFunction = useCallback(() => {
    debugLog('FUNCTION_EDITOR', '🗑️ FunctionPropEditor: Clearing function for', prop.name);
    
    // Clear the validation cache for this prop to ensure fresh validation
    const keysToDelete = Array.from(validationCache.current.keys()).filter(key => 
      key.startsWith(`${prop.name}:`)
    );
    keysToDelete.forEach(key => validationCache.current.delete(key));
    
    // Clear the function body - this will trigger the validation useEffect
    // which will automatically call onChange(undefined) when it sees empty content
    setFunctionBody('');
    
    // Reset other state immediately  
    setValidationResult({ isValid: true });
    setLastSentFunctionBody('');
    setIsUserTyping(false);
    
    debugLog('FUNCTION_EDITOR', '🗑️ FunctionPropEditor: Clear complete for', prop.name);
  }, [prop.name]);

  const signature = getFunctionSignature();
  const functionPreview = `(${signature.params}) => ${signature.returnType}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {prop.name}
          {prop.required && <span className="text-red-500 ml-1">*</span>}
          {prop.functionSignature && (
            <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-1 rounded">
              typed
            </span>
          )}
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-mono max-w-xs truncate" title={functionPreview}>
            {functionPreview}
          </span>
          {validationResult.isValid ? (
            <CheckIcon className="w-4 h-4 text-green-500" />
          ) : (
            <AlertTriangleIcon className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <CodeIcon className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Function Editor</span>
          </div>
          <div className="flex items-center space-x-2">
            {functionBody.trim() && (
              <button
                onClick={handleClearFunction}
                className="text-xs text-red-600 hover:text-red-800 flex items-center space-x-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                title="Clear function"
              >
                <Trash2Icon className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={onToggleExpansion}
              className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>

        {/* Validation Status and Warnings */}
        {(!validationResult.isValid || (validationResult.warnings && validationResult.warnings.length > 0)) && (
          <div className="px-3 py-2 bg-yellow-50 border-b border-yellow-200">
            {!validationResult.isValid && (
              <div className="flex items-center space-x-2 text-red-700 mb-2">
                <AlertTriangleIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Function Invalid</span>
              </div>
            )}
            {!validationResult.isValid && (
              <p className="text-sm text-red-600 mb-2">
                {validationResult.error}
              </p>
            )}
            {!validationResult.isValid && (
              <p className="text-xs text-red-500">
                Note: This function will not appear in the generated code until fixed.
              </p>
            )}
            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <div className="space-y-1">
                {validationResult.warnings.map((warning, index) => (
                  <p key={index} className="text-sm text-yellow-700">
                    ⚠️ {warning}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <Editor
            height={isExpanded ? '400px' : '120px'}
            language="typescript"
            value={functionBody}
            onChange={(value) => setFunctionBody(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: isExpanded ? 'on' : 'off',
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              folding: false,
              glyphMargin: false,
              lineDecorationsWidth: 0,
              lineNumbersMinChars: 3,
              padding: { top: 8, bottom: 8 },
              contextmenu: false,
              quickSuggestions: {
                other: 'inline',
                comments: 'off',
                strings: 'off',
              },
              suggestOnTriggerCharacters: true,
              tabSize: 2,
              insertSpaces: true,
            }}
            beforeMount={(monaco) => {
              // Configure TypeScript compiler options
              monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.Latest,
                allowNonTsExtensions: true,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                module: monaco.languages.typescript.ModuleKind.CommonJS,
                noEmit: true,
                esModuleInterop: true,
                allowJs: true,
                strict: false,
              });

              // Define custom theme
              monaco.editor.defineTheme('function-editor', {
                base: 'vs',
                inherit: true,
                rules: [],
                colors: {
                  'editor.background': '#fefefe',
                  'editor.lineHighlightBackground': '#f8fafc',
                  'editorLineNumber.foreground': '#94a3b8',
                },
              });

              monaco.editor.setTheme('function-editor');
            }}
          />
        </div>

        {/* Status Footer */}
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <div className="text-gray-500">
              Status: {isUserTyping ? (
                <span className="text-blue-600 font-medium">✏️ Typing... (validation paused)</span>
              ) : validationResult.isValid ? (
                functionBody.trim() ? (
                  validationResult.warnings && validationResult.warnings.length > 0 ? (
                    <span className="text-yellow-600 font-medium">⚠️ Valid with warnings - will appear in generated code</span>
                  ) : (
                    <span className="text-green-600 font-medium">✅ Valid function - will appear in generated code</span>
                  )
                ) : (
                  <span className="text-gray-500 font-medium">📝 Empty function - will not appear in generated code</span>
                )
              ) : (
                <span className="text-red-600 font-medium">❌ Invalid function - will not appear in generated code</span>
              )}
            </div>
            <div className="text-gray-400">
              {functionBody.split('\n').length} lines
              {validationResult.warnings && validationResult.warnings.length > 0 && (
                <span className="ml-2 text-yellow-600">({validationResult.warnings.length} warning{validationResult.warnings.length > 1 ? 's' : ''})</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {(prop.description || prop.functionSignature) && (
        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded space-y-1">
          {prop.description && (
            <div>
              <strong>Description:</strong> {prop.description}
            </div>
          )}
          {prop.functionSignature && (
            <div>
              <strong>Function Signature:</strong>
              <div className="font-mono text-xs mt-1 p-2 bg-white rounded border">
                ({prop.functionSignature.params}) =&gt; {prop.functionSignature.returnType}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 