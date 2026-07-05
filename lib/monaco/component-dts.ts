import type { Monaco } from '@monaco-editor/react';
import type { FullComponentInfo, PropDefinition } from '@/lib/interfaces';

export interface FunctionSignature {
  params: string;
  returnType: string;
}

/**
 * Import specifier the generated usage code uses for the selected component.
 * A `declare module` for it is registered per component so the code-mode
 * editor gets prop autocomplete inside JSX tags.
 */
export const PLAYGROUND_COMPONENT_MODULE = '@playground/component';

/** Fixed virtual path — re-registering on component switch replaces the lib. */
const COMPONENT_DTS_PATH = 'file:///node_modules/@types/playground-component/index.d.ts';

/**
 * Default signatures for common handler props when the component metadata
 * doesn't declare one.
 */
const COMMON_SIGNATURES: Record<string, FunctionSignature> = {
  onClick: { params: 'event: React.MouseEvent', returnType: 'void' },
  onChange: { params: 'value: any', returnType: 'void' },
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

/**
 * Resolve the TypeScript signature of a function prop. Single shared
 * implementation for the editors, the compiler, and the .d.ts generator:
 * explicit metadata first, then a `(params) => return` pattern in the
 * description, then well-known handler names.
 */
export function resolveSignature(prop: PropDefinition): FunctionSignature {
  if (prop.functionSignature) {
    return {
      params: prop.functionSignature.params,
      returnType: prop.functionSignature.returnType,
    };
  }

  if (prop.description) {
    const signatureMatch = prop.description.match(/\((.*?)\)\s*=>\s*(.+)/);
    if (signatureMatch) {
      const [, params, returnType] = signatureMatch;
      return { params: params.trim(), returnType: returnType.trim() };
    }
  }

  return COMMON_SIGNATURES[prop.name] ?? { params: '...args: any[]', returnType: 'any' };
}

const IDENTIFIER_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function propKey(name: string): string {
  return IDENTIFIER_RE.test(name) ? name : JSON.stringify(name);
}

/** Map a PropDefinition to a TypeScript type expression. */
export function propToTsType(prop: PropDefinition): string {
  switch (prop.type) {
    case 'function': {
      const signature = resolveSignature(prop);
      return `(${signature.params}) => ${signature.returnType}`;
    }
    case 'component':
      return 'React.ReactNode';
    case 'enum':
    case 'select': {
      if (prop.options && prop.options.length > 0) {
        return prop.options.map((option) => JSON.stringify(option)).join(' | ');
      }
      return 'string';
    }
    case 'color':
      return 'string';
    case 'array':
      return 'any[]';
    case 'object':
      return 'Record<string, any>';
    case 'string':
    case 'number':
    case 'boolean':
      return prop.type;
    default:
      // Meta files may carry raw TS type strings (e.g. "number[]") — pass through.
      return String(prop.type) || 'any';
  }
}

/**
 * Build the virtual .d.ts for a component: a props interface plus a module
 * declaration for the playground import specifier(s).
 */
export function buildComponentDts(
  component: FullComponentInfo,
  extraSpecifiers: string[] = []
): string {
  const interfaceName = `${component.name}Props`;
  const members = component.props
    .map((prop) => {
      const docs = prop.description ? `  /** ${prop.description.replace(/\*\//g, '*​/')} */\n` : '';
      return `${docs}  ${propKey(prop.name)}${prop.required ? '' : '?'}: ${propToTsType(prop)};`;
    })
    .join('\n');

  const moduleBody = `  import * as React from 'react';
  export interface ${interfaceName} {
${members}
  }
  const ${component.name}: React.FC<${interfaceName}>;
  export default ${component.name};
  export { ${component.name} };`;

  return [PLAYGROUND_COMPONENT_MODULE, ...extraSpecifiers]
    .map((specifier) => `declare module '${specifier}' {\n${moduleBody}\n}`)
    .join('\n\n');
}

/**
 * Register (or replace) the selected component's types with the Monaco TS
 * worker. Uses a fixed virtual path, so switching components never leaks libs.
 */
export function registerComponentDts(
  monaco: Monaco,
  component: FullComponentInfo,
  extraSpecifiers: string[] = []
): void {
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    buildComponentDts(component, extraSpecifiers),
    COMPONENT_DTS_PATH
  );
}
