import { LocalComponent, PropDefinition, ComponentExample } from '@/types';

// Mock component creation utility
export const createMockComponent = (overrides: Partial<LocalComponent> = {}): LocalComponent => ({
  id: 'test-component-1',
  name: 'TestButton',
  category: 'form',
  description: 'A test button component',
  props: [
    {
      name: 'children',
      type: 'string',
      required: true,
      defaultValue: 'Click me',
      description: 'Button text content'
    },
    {
      name: 'onClick',
      type: 'function',
      required: false,
      functionSignature: {
        params: 'event: React.MouseEvent',
        returnType: 'void'
      },
      description: 'Click handler function'
    },
    {
      name: 'disabled',
      type: 'boolean',
      required: false,
      defaultValue: false,
      description: 'Whether the button is disabled'
    },
    {
      name: 'variant',
      type: 'enum',
      required: false,
      defaultValue: 'primary',
      options: ['primary', 'secondary', 'danger'],
      description: 'Button style variant'
    }
  ],
  code: `export default function TestButton({ children, onClick, disabled, variant = 'primary' }) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={\`btn btn-\${variant}\`}
    >
      {children}
    </button>
  );
}`,
  examples: [
    {
      name: 'Default Button',
      description: 'A default primary button',
      props: {
        children: 'Default Button',
        disabled: false,
        variant: 'primary'
      }
    },
    {
      name: 'Secondary Button',
      description: 'A secondary button variant',
      props: {
        children: 'Secondary Button',
        disabled: false,
        variant: 'secondary'
      }
    }
  ],
  filePath: '/components/TestButton.tsx',
  metaPath: '/components/TestButton.meta.json',
  lastModified: new Date(),
  isLocal: true,
  ...overrides
});

// Create mock component with complex props
export const createComplexMockComponent = (): LocalComponent => ({
  id: 'complex-component',
  name: 'DataTable',
  category: 'data-display',
  description: 'A complex data table component',
  props: [
    {
      name: 'data',
      type: 'array',
      required: true,
      defaultValue: [],
      description: 'Array of data objects'
    },
    {
      name: 'columns',
      type: 'array',
      required: true,
      defaultValue: [],
      description: 'Column configuration array'
    },
    {
      name: 'onRowClick',
      type: 'function',
      required: false,
      functionSignature: {
        params: 'row: any, index: number',
        returnType: 'void'
      },
      description: 'Row click handler'
    },
    {
      name: 'sortable',
      type: 'boolean',
      required: false,
      defaultValue: true,
      description: 'Whether columns are sortable'
    },
    {
      name: 'theme',
      type: 'object',
      required: false,
      defaultValue: { primaryColor: '#blue' },
      description: 'Theme configuration object'
    }
  ],
  code: 'export default function DataTable(props) { return <div>Table</div>; }',
  examples: [
    {
      name: 'Basic Table',
      props: {
        data: [{ id: 1, name: 'John' }],
        columns: [{ key: 'name', header: 'Name' }],
        sortable: true
      }
    }
  ],
  filePath: '/components/DataTable.tsx',
  metaPath: '/components/DataTable.meta.json',
  lastModified: new Date(),
  isLocal: true,
});

// Viewport size configurations for responsive testing
export const VIEWPORT_SIZES = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 }
};

// Helper to simulate viewport changes
export const setViewport = (size: keyof typeof VIEWPORT_SIZES) => {
  const viewport = VIEWPORT_SIZES[size];
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: viewport.width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: viewport.height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

// Helper to validate generated code structure
export const validateGeneratedCode = (code: string) => {
  const validations = {
    hasImport: /import.*from/.test(code),
    hasExportDefault: /export default function/.test(code),
    hasComponentUsage: /<[A-Z]/.test(code),
    hasPropsSpread: /\w+={/.test(code),
    noSyntaxErrors: true // This would need actual parsing
  };
  
  return validations;
};

// Helper to extract props from generated code
export const extractPropsFromCode = (code: string): Record<string, any> => {
  const props: Record<string, any> = {};
  
  // Simple regex to extract prop assignments
  const propMatches = code.match(/(\w+)={([^}]+)}/g) || [];
  
  propMatches.forEach(match => {
    const [, propName, propValue] = match.match(/(\w+)={([^}]+)}/) || [];
    if (propName && propValue) {
      props[propName] = propValue;
    }
  });
  
  return props;
};

// Helper to create mock function prop values
export const createMockFunctionProp = (source: string = 'console.log("clicked")') => ({
  type: 'function' as const,
  source,
  signature: {
    params: 'event',
    returnType: 'void'
  }
});

// Test data generators
export const generateTestData = (count: number = 5) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    status: i % 2 === 0 ? 'active' : 'inactive',
    value: Math.floor(Math.random() * 100)
  }));
};

// Async wait helper for component updates
export const waitForUpdate = () => new Promise(resolve => setTimeout(resolve, 0)); 