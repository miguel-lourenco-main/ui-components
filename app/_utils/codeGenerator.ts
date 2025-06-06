import { LocalComponent } from '@/types';

/**
 * Generate JSX code from props - playground-friendly approach
 */
export function generateCodeFromProps(
  component: LocalComponent,
  props: Record<string, any>,
  currentCode: string
): string {
  try {
    // For playground, we want to generate a complete working example
    const componentName = component.name;
    const jsxExample = generateComponentUsageExample(component, props);
    
    // Check if there's already a playground example function
    const examplePattern = /\/\/ Playground Example[\s\S]*?(?=export default|$)/;
    
    const exampleCode = `// Playground Example
function PlaygroundExample() {
  return (
    <div style={{ padding: '20px' }}>
      ${jsxExample}
    </div>
  );
}

`;
    
    if (examplePattern.test(currentCode)) {
      // Replace existing example
      return currentCode.replace(examplePattern, exampleCode);
    } else {
      // Add example before the export
      const exportPattern = /(export default)/;
      if (exportPattern.test(currentCode)) {
        return currentCode.replace(exportPattern, `${exampleCode}$1`);
      } else {
        // Add example at the end
        return `${currentCode}\n\n${exampleCode}`;
      }
    }
  } catch (error) {
    console.warn('Failed to generate code from props:', error);
    return currentCode;
  }
}

/**
 * Generate JSX example from props
 */
export function generateJSXExample(componentName: string, props: Record<string, any>): string {
  const propStrings: string[] = [];
  
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) {
      continue;
    }
    
    const propString = formatPropForJSX(key, value);
    if (propString) {
      propStrings.push(propString);
    }
  }
  
  if (propStrings.length === 0) {
    return `<${componentName} />`;
  }
  
  // Format props nicely
  if (propStrings.length === 1) {
    return `<${componentName} ${propStrings[0]} />`;
  }
  
  const formattedProps = propStrings.map(prop => `  ${prop}`).join('\n');
  return `<${componentName}\n${formattedProps}\n/>`;
}

/**
 * Format a single prop for JSX
 */
function formatPropForJSX(key: string, value: any): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  
  // Handle different prop types
  switch (typeof value) {
    case 'string':
      // Handle special case for children prop
      if (key === 'children') {
        return null; // Children will be handled separately
      }
      return `${key}="${escapeString(value)}"`;
      
    case 'number':
      return `${key}={${value}}`;
      
    case 'boolean':
      if (value === true) {
        return key; // Boolean shorthand
      } else {
        return `${key}={false}`;
      }
      
    case 'object':
      if (Array.isArray(value)) {
        return `${key}={${JSON.stringify(value)}}`;
      } else {
        return `${key}={${JSON.stringify(value)}}`;
      }
      
    default:
      return `${key}={${JSON.stringify(value)}}`;
  }
}

/**
 * Escape string for JSX attribute
 */
function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Generate complete component usage example
 */
export function generateComponentUsageExample(
  component: LocalComponent,
  props: Record<string, any>
): string {
  const componentName = component.name;
  const children = props.children;
  
  // Remove children from props for JSX attributes
  const jsxProps = { ...props };
  delete jsxProps.children;
  
  const jsxExample = generateJSXExample(componentName, jsxProps);
  
  // If there are children, modify the JSX to include them
  if (children) {
    if (jsxExample.endsWith('/>')) {
      // Convert self-closing to opening/closing tags
      const withoutSelfClose = jsxExample.slice(0, -2) + '>';
      return `${withoutSelfClose}${children}</${componentName}>`;
    }
  }
  
  return jsxExample;
}

/**
 * Update existing JSX in code with new props
 */
export function updateJSXInCode(
  code: string,
  componentName: string,
  newProps: Record<string, any>
): string {
  try {
    // Find existing JSX usage
    const jsxPattern = new RegExp(`<${componentName}[^>]*(?:/>|>[\\s\\S]*?</${componentName}>)`, 'g');
    const matches = code.match(jsxPattern);
    
    if (!matches || matches.length === 0) {
      return code;
    }
    
    // Replace the first match with updated props
    const oldJSX = matches[0];
    const newJSX = generateComponentUsageExample({ name: componentName } as LocalComponent, newProps);
    
    return code.replace(oldJSX, newJSX);
  } catch (error) {
    console.warn('Failed to update JSX in code:', error);
    return code;
  }
}

/**
 * Generate TypeScript interface from props
 */
export function generatePropsInterface(component: LocalComponent): string {
  const interfaceName = `${component.name}Props`;
  const propLines: string[] = [];
  
  for (const prop of component.props) {
    const optional = prop.required ? '' : '?';
    const typeString = formatTypeForInterface(prop.type, prop.options);
    const comment = prop.description ? ` // ${prop.description}` : '';
    
    propLines.push(`  ${prop.name}${optional}: ${typeString};${comment}`);
  }
  
  return `interface ${interfaceName} {
${propLines.join('\n')}
}`;
}

/**
 * Format prop type for TypeScript interface
 */
function formatTypeForInterface(type: string, options?: (string | number)[]): string {
  switch (type) {
    case 'enum':
    case 'select':
      if (options && options.length > 0) {
        const optionStrings = options.map(opt => 
          typeof opt === 'string' ? `'${opt}'` : opt
        );
        return optionStrings.join(' | ');
      }
      return 'string';
      
    case 'function':
      return '() => void';
      
    case 'array':
      return 'any[]';
      
    case 'object':
      return 'Record<string, any>';
      
    case 'color':
      return 'string';
      
    default:
      return type;
  }
} 