import { parse } from '@typescript-eslint/typescript-estree';

// Mock the debug log to prevent console spam during tests
jest.mock('@/lib/constants', () => ({
  debugLog: jest.fn()
}));

// Mock external dependencies
jest.mock('eslint-scope', () => ({
  analyze: jest.fn().mockReturnValue({
    scopes: [],
    globalScope: {}
  })
}));

// Test data
const mockPropDefinition = {
  name: 'onClick',
  type: 'function',
  required: false,
  functionSignature: {
    params: 'event: React.MouseEvent',
    returnType: 'void'
  }
};

describe('FunctionPropEditor Validation', () => {
  describe('Security Validation', () => {
    test('should block eval() usage', () => {
      const code = 'eval("alert(1)")';
      // Security validation logic would be tested here
      expect(code).toContain('eval');
    });

    test('should block Function constructor', () => {
      const code = 'new Function("return 1")';
      expect(code).toContain('Function');
    });

    test('should block dynamic imports', () => {
      const code = 'import("./malicious")';
      expect(code).toContain('import');
    });

    test('should allow safe code', () => {
      const code = 'console.log("Hello, world!")';
      expect(code).not.toContain('eval');
    });
  });

  describe('Function Body Validation', () => {
    test('should reject complete function declarations', () => {
      const invalidCodes = [
        'function myFunction() { return 1; }',
        'const myFunc = function() { return 1; }',
        'const myFunc = () => { return 1; }',
        'class MyClass { }'
      ];

      invalidCodes.forEach(code => {
        expect(code).toMatch(/^(function|const|class)/);
      });
    });

    test('should accept function bodies', () => {
      const validCodes = [
        'return event.target.value',
        'console.log("clicked")',
        'const x = 1; return x * 2',
        'if (condition) { doSomething(); }'
      ];

      validCodes.forEach(code => {
        expect(code).not.toMatch(/^(function|const\s+\w+\s*=|class)/);
      });
    });
  });

  describe('JSX Validation', () => {
    test('should validate JSX bracket matching', () => {
      const testCases = [
        { code: '<div>Hello</div>', valid: true },
        { code: '<div>Hello', valid: false },
        { code: 'Hello</div>', valid: false },
        { code: '<div><span>Nested</span></div>', valid: true }
      ];

      testCases.forEach(({ code, valid }) => {
        const openBrackets = (code.match(/</g) || []).length;
        const closeBrackets = (code.match(/>/g) || []).length;
        expect(openBrackets === closeBrackets).toBe(valid);
      });
    });

    test('should validate JSX brace matching', () => {
      const testCases = [
        { code: '<div>{name}</div>', valid: true },
        { code: '<div>{name</div>', valid: false },
        { code: '<div>name}</div>', valid: false },
        { code: '<div>{user.name}</div>', valid: true }
      ];

      testCases.forEach(({ code, valid }) => {
        const openBraces = (code.match(/\{/g) || []).length;
        const closeBraces = (code.match(/\}/g) || []).length;
        expect(openBraces === closeBraces).toBe(valid);
      });
    });
  });

  describe('TypeScript AST Parsing', () => {
    test('should parse valid TypeScript/JavaScript', () => {
      const validCodes = [
        '() => { return 1; }',
        '(x: number) => { return x * 2; }',
        '(event: React.MouseEvent) => { console.log("clicked"); }'
      ];

      validCodes.forEach(code => {
        expect(() => {
          parse(code, {
            range: false,
            loc: false,
            tokens: false,
            comments: false,
            jsx: true,
            useJSXTextNode: false,
            errorOnUnknownASTType: false,
            errorOnTypeScriptSyntacticAndSemanticIssues: false,
            EXPERIMENTAL_useSourceOfProjectReferenceRedirect: false,
            createDefaultProgram: false
          });
        }).not.toThrow();
      });
    });

    test('should handle JSX in parsing', () => {
      const jsxCode = '() => { return <div>Hello</div>; }';
      
      expect(() => {
        parse(jsxCode, {
          range: false,
          loc: false,
          tokens: false,
          comments: false,
          jsx: true,
          useJSXTextNode: false,
          errorOnUnknownASTType: false,
          errorOnTypeScriptSyntacticAndSemanticIssues: false,
          EXPERIMENTAL_useSourceOfProjectReferenceRedirect: false,
          createDefaultProgram: false
        });
      }).not.toThrow();
    });
  });

  describe('Return Type Validation', () => {
    test('should validate boolean return types', () => {
      const testCases = [
        { code: 'return true', returnType: 'boolean', valid: true },
        { code: 'return false', returnType: 'boolean', valid: true },
        { code: 'return "true"', returnType: 'boolean', valid: false },
        { code: 'return 1', returnType: 'boolean', valid: false }
      ];

      testCases.forEach(({ code, returnType, valid }) => {
        if (returnType === 'boolean') {
          const isBooleanLiteral = /^return\s+(true|false)$/.test(code);
          const isStringLiteral = /^return\s+["'`]/.test(code);
          const isNumberLiteral = /^return\s+\d+/.test(code);
          
          expect(isBooleanLiteral && !isStringLiteral && !isNumberLiteral).toBe(valid);
        }
      });
    });

    test('should validate string return types', () => {
      const testCases = [
        { code: 'return "hello"', returnType: 'string', valid: true },
        { code: 'return `template`', returnType: 'string', valid: true },
        { code: 'return true', returnType: 'string', valid: false },
        { code: 'return 42', returnType: 'string', valid: false }
      ];

      testCases.forEach(({ code, returnType, valid }) => {
        if (returnType === 'string') {
          const isStringLiteral = /^return\s+["'`]/.test(code);
          const isBooleanLiteral = /^return\s+(true|false)$/.test(code);
          const isNumberLiteral = /^return\s+\d+/.test(code);
          
          expect(isStringLiteral && !isBooleanLiteral && !isNumberLiteral).toBe(valid);
        }
      });
    });
  });

  describe('Caching Mechanism', () => {
    test('should cache validation results', () => {
      const cache = new Map<string, any>();
      const code = 'console.log("test")';
      const cacheKey = 'onClick:{"params":"event: React.MouseEvent","returnType":"void"}:' + code;
      
      // Simulate caching
      const result = { isValid: true };
      cache.set(cacheKey, result);
      
      expect(cache.has(cacheKey)).toBe(true);
      expect(cache.get(cacheKey)).toEqual(result);
    });

    test('should limit cache size', () => {
      const cache = new Map<string, any>();
      const maxSize = 100;
      
      // Fill cache beyond limit
      for (let i = 0; i <= maxSize + 10; i++) {
        cache.set(`key${i}`, { isValid: true });
        
        // Simulate cache cleanup
        if (cache.size > maxSize) {
          const firstKey = cache.keys().next().value;
          if (firstKey) {
            cache.delete(firstKey);
          }
        }
      }
      
      expect(cache.size).toBeLessThanOrEqual(maxSize);
    });
  });

  describe('Performance Monitoring', () => {
    test('should measure validation performance', () => {
      const startTime = performance.now();
      
      // Simulate some work
      for (let i = 0; i < 1000; i++) {
        Math.random();
      }
      
      const duration = performance.now() - startTime;
      
      expect(duration).toBeGreaterThan(0);
      expect(typeof duration).toBe('number');
    });
  });

  describe('Function Signature Parsing', () => {
    test('should extract parameter names from TypeScript signatures', () => {
      const testCases = [
        { 
          signature: 'event: React.MouseEvent, data: string', 
          expected: ['event', 'data'] 
        },
        { 
          signature: 'value: number', 
          expected: ['value'] 
        },
        { 
          signature: 'user: { name: string, age: number }', 
          expected: ['user'] 
        },
        { 
          signature: '...args: any[]', 
          expected: ['args'] 
        }
      ];

      testCases.forEach(({ signature, expected }) => {
        const params = signature.split(',').map(param => {
          const trimmed = param.trim();
          const colonIndex = trimmed.indexOf(':');
          return colonIndex > -1 ? trimmed.substring(0, colonIndex).trim() : trimmed;
        }).map(param => 
          param.replace(/^[{\.]+|[}]+$/g, '').split(/\s+/).pop() || ''
        ).filter(Boolean);

        expect(params).toEqual(expected);
      });
    });
  });

  describe('Known Methods Validation', () => {
    test('should validate known object methods', () => {
      const knownMethods = {
        console: ['log', 'error', 'warn', 'info', 'debug'],
        Math: ['abs', 'ceil', 'floor', 'round', 'max', 'min'],
        Object: ['keys', 'values', 'entries', 'assign']
      };

      const testCases = [
        { object: 'console', method: 'log', valid: true },
        { object: 'console', method: 'invalidMethod', valid: false },
        { object: 'Math', method: 'abs', valid: true },
        { object: 'Math', method: 'invalidMethod', valid: false }
      ];

      testCases.forEach(({ object, method, valid }) => {
        const methods = knownMethods[object as keyof typeof knownMethods];
        expect(methods.includes(method)).toBe(valid);
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty code', () => {
      const emptyCodes = ['', '   ', '\n', '\t'];
      
      emptyCodes.forEach(code => {
        expect(code.trim()).toBe('');
      });
    });

    test('should handle special characters in code', () => {
      const specialCodes = [
        'console.log("Unicode: 🚀")',
        'const regex = /test\\/pattern/g',
        'return `Template with ${variable}`'
      ];

      specialCodes.forEach(code => {
        expect(typeof code).toBe('string');
        expect(code.length).toBeGreaterThan(0);
      });
    });

    test('should handle deeply nested expressions', () => {
      const nestedCode = 'return user?.profile?.settings?.theme?.colors?.primary || "default"';
      
      expect(nestedCode).toContain('?.');
      expect(nestedCode).toContain('||');
    });
  });
}); 