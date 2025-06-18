import '@testing-library/jest-dom'

// Mock Monaco Editor since it's not available in test environment
jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ value, onChange, onMount, ...props }) => {
    return (
      <div data-testid="monaco-editor" {...props}>
        <textarea
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          data-testid="monaco-textarea"
        />
      </div>
    )
  },
}))

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
}))

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock window.ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
})

// Mock URL.createObjectURL for download tests
global.URL.createObjectURL = jest.fn();

// Custom test utilities
global.testUtils = {
  // Utility to wait for async state updates
  waitForAsyncUpdate: () => new Promise(resolve => setTimeout(resolve, 0)),
  
  // Mock component data for testing
  createMockComponent: (overrides = {}) => ({
    id: 'test-component',
    name: 'TestComponent',
    category: 'form',
    description: 'A test component',
    props: [
      {
        name: 'title',
        type: 'string',
        required: true,
        defaultValue: 'Default Title',
        description: 'The component title'
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
        description: 'Whether the component is disabled'
      }
    ],
    code: '<div onClick={onClick}>{title}</div>',
    examples: [
      {
        name: 'Default',
        description: 'Default example',
        props: {
          title: 'Example Title',
          disabled: false
        }
      }
    ],
    filePath: '/test/TestComponent.tsx',
    metaPath: '/test/TestComponent.meta.json',
    lastModified: new Date(),
    isLocal: true,
    ...overrides
  })
} 