import React from 'react';
import { validateFunctionCode, determineLanguageFromReturnType, getValidationSummary } from '@/lib/utils/codeValidation';

/**
 * Demo component showing how validation adapts to different function return types
 */
export const ValidationDemo: React.FC = () => {
  // Example functions with different return types
  const examples = [
    {
      name: 'JSX Function',
      returnType: 'React.ReactNode',
      params: 'name: string',
      source: `return (
  <div className="greeting">
    <h1>Hello {name}!</h1>
    <p>Welcome to our app</p>
  </div>
);`,
      expectedLanguage: 'jsx'
    },
    {
      name: 'String Function',
      returnType: 'string',
      params: 'firstName: string, lastName: string',
      source: `return \`Hello \${firstName} \${lastName}!\`;`,
      expectedLanguage: 'javascript'
    },
    {
      name: 'Number Function',
      returnType: 'number',
      params: 'a: number, b: number',
      source: `return a + b;`,
      expectedLanguage: 'javascript'
    },
    {
      name: 'Object Function',
      returnType: '{ id: number; name: string; active: boolean }',
      params: 'id: number, name: string',
      source: `return {
  id,
  name,
  active: true,
  createdAt: new Date()
};`,
      expectedLanguage: 'typescript'
    },
    {
      name: 'Array Function',
      returnType: 'string[]',
      params: 'items: string[], filter: string',
      source: `return items.filter(item => 
  item.toLowerCase().includes(filter.toLowerCase())
);`,
      expectedLanguage: 'typescript'
    },
    {
      name: 'Boolean Function',
      returnType: 'boolean',
      params: 'user: { age: number; hasLicense: boolean }',
      source: `return user.age >= 18 && user.hasLicense;`,
      expectedLanguage: 'typescript'
    },
    {
      name: 'Void Function',
      returnType: 'void',
      params: 'message: string',
      source: `console.log('Action:', message);
alert('Task completed!');`,
      expectedLanguage: 'typescript'
    },
    {
      name: 'Complex JSX Function',
      returnType: 'JSX.Element',
      params: 'items: Array<{id: number; title: string; completed: boolean}>, onToggle: (id: number) => void',
      source: `return (
  <ul className="todo-list">
    {items.map(item => (
      <li key={item.id} className={item.completed ? 'completed' : ''}>
        <input
          id={\`todo-checkbox-\${item.id}\`}
          name={\`todo-checkbox-\${item.id}\`}
          type="checkbox" 
          checked={item.completed}
          onChange={() => onToggle(item.id)}
        />
        <span>{item.title}</span>
      </li>
    ))}
  </ul>
);`,
      expectedLanguage: 'tsx'
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Function Validation Demo</h1>
      <p className="text-gray-600 mb-8">
        This demo shows how our validation system automatically adapts to different function return types,
        providing appropriate validation for JSX, TypeScript, and JavaScript code.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2">
        {examples.map((example, index) => {
          const detectedLanguage = determineLanguageFromReturnType(example.returnType);
                     const validation = validateFunctionCode(
             example.source,
             example.name.replace(' ', ''),
             {
               name: example.name.replace(' ', ''),
               type: 'function',
               required: false,
               functionSignature: {
                 params: example.params,
                 returnType: example.returnType
               }
             },
            example.params.split(',').map(p => p.split(':')[0].trim()).join(', ')
          );

          return (
            <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{example.name}</h3>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    detectedLanguage === example.expectedLanguage 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {detectedLanguage}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    validation.isValid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {getValidationSummary(validation)}
                  </span>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-sm text-gray-600 mb-1">Return Type:</div>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{example.returnType}</code>
              </div>
              
              <div className="mb-3">
                <div className="text-sm text-gray-600 mb-1">Parameters:</div>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{example.params}</code>
              </div>
              
              <div className="mb-3">
                <div className="text-sm text-gray-600 mb-1">Source Code:</div>
                <pre className="text-sm bg-gray-50 p-3 rounded border overflow-x-auto">
                  <code>{example.source}</code>
                </pre>
              </div>
              
              {(validation.errors.length > 0 || validation.warnings.length > 0) && (
                <div className="mt-3">
                  <div className="text-sm text-gray-600 mb-2">Validation Results:</div>
                  {validation.errors.map((error, i) => (
                    <div key={i} className="text-sm text-red-600 mb-1">
                      ❌ Line {error.line}: {error.message}
                    </div>
                  ))}
                  {validation.warnings.map((warning, i) => (
                    <div key={i} className="text-sm text-yellow-600 mb-1">
                      ⚠️ Line {warning.line}: {warning.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">How It Works</h3>
        <ul className="text-sm space-y-2">
          <li><strong>Language Detection:</strong> Analyzes return type to determine if function should use JSX, TypeScript, or JavaScript validation</li>
          <li><strong>Smart Validation:</strong> Applies appropriate syntax checking, linting, and type validation based on detected language</li>
          <li><strong>Return Type Checking:</strong> Validates that function code matches expected return type</li>
          <li><strong>Parameter Validation:</strong> Ensures function parameters are used correctly</li>
        </ul>
      </div>
    </div>
  );
}; 