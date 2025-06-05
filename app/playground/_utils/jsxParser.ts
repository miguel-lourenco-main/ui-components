import { LocalComponent } from '@/types';

/**
 * Parse props from JSX code - enhanced for playground format
 */
export function parsePropsFromCode(code: string, component: LocalComponent): Record<string, any> {
  const props: Record<string, any> = {};
  
  try {
    // First, try to find props in the PlaygroundExample function
    const playgroundPattern = /\/\/ Playground Example[\s\S]*?function PlaygroundExample\(\)[\s\S]*?return \([\s\S]*?\);[\s\S]*?}/;
    const playgroundMatch = code.match(playgroundPattern);
    
    let codeToSearch = code;
    if (playgroundMatch) {
      // Focus on the playground example
      codeToSearch = playgroundMatch[0];
    }
    
    // Look for component usage patterns like <ComponentName prop="value" />
    const componentName = component.name;
    const jsxPattern = new RegExp(`<${componentName}[^>]*(?:/>|>[\\s\\S]*?</${componentName}>)`, 'g');
    const matches = codeToSearch.match(jsxPattern);
    
    if (!matches || matches.length === 0) {
      return props;
    }
    
    // Extract props from the first match
    const jsxString = matches[0];
    
    // Parse different prop patterns
    let match;
    
    // String props: prop="value" or prop='value'
    const stringPattern = /(\w+)=["']([^"']*)["']/g;
    while ((match = stringPattern.exec(jsxString)) !== null) {
      const [, propName, propValue] = match;
      if (isValidPropForComponent(propName, component)) {
        props[propName] = propValue;
      }
    }
    
    // Boolean props with explicit values: prop={true} or prop={false}
    const booleanPattern = /(\w+)=\{(true|false)\}/g;
    while ((match = booleanPattern.exec(jsxString)) !== null) {
      const [, propName, propValue] = match;
      if (isValidPropForComponent(propName, component)) {
        props[propName] = propValue === 'true';
      }
    }
    
    // Number props: prop={123}
    const numberPattern = /(\w+)=\{(\d+(?:\.\d+)?)\}/g;
    while ((match = numberPattern.exec(jsxString)) !== null) {
      const [, propName, propValue] = match;
      if (isValidPropForComponent(propName, component)) {
        props[propName] = parseFloat(propValue);
      }
    }
    
    // Boolean shorthand props: just the prop name
    const shorthandPattern = /\s(\w+)(?=\s|>|\/)/g;
    while ((match = shorthandPattern.exec(jsxString)) !== null) {
      const [, propName] = match;
      // Only consider it a boolean prop if it's defined in the component and not already processed
      if (isValidPropForComponent(propName, component) && !(propName in props)) {
        const propDef = component.props.find(p => p.name === propName);
        if (propDef && propDef.type === 'boolean') {
          props[propName] = true;
        }
      }
    }
    
    // Parse children content if component has children prop
    const childrenPropDef = component.props.find(p => p.name === 'children');
    if (childrenPropDef && !jsxString.includes('/>')) {
      const children = parseChildrenFromJSX(jsxString);
      if (children) {
        props.children = children;
      }
    }
    
  } catch (error) {
    console.warn('Failed to parse props from code:', error);
  }
  
  return props;
}

/**
 * Check if a prop name is valid for the given component
 */
function isValidPropForComponent(propName: string, component: LocalComponent): boolean {
  // Ignore standard HTML attributes and React props
  const ignoredProps = ['className', 'style', 'key', 'ref', 'children'];
  if (ignoredProps.includes(propName)) {
    return false;
  }
  
  // Check if the prop is defined in the component's prop definitions
  return component.props.some(prop => prop.name === propName);
}

/**
 * Extract component usage examples from code
 */
export function extractComponentUsageFromCode(code: string, componentName: string): string[] {
  const usages: string[] = [];
  
  try {
    // Find all JSX tags for this component
    const pattern = new RegExp(`<${componentName}[^>]*(?:/>|>[\\s\\S]*?</${componentName}>)`, 'g');
    const matches = code.match(pattern);
    
    if (matches) {
      usages.push(...matches);
    }
  } catch (error) {
    console.warn('Failed to extract component usage:', error);
  }
  
  return usages;
}

/**
 * Parse children content from JSX
 */
export function parseChildrenFromJSX(jsxString: string): string | null {
  try {
    // Extract content between opening and closing tags
    const match = jsxString.match(/>([^<]+)</);
    return match ? match[1].trim() : null;
  } catch (error) {
    console.warn('Failed to parse children from JSX:', error);
    return null;
  }
}

/**
 * Simple JSX validation
 */
export function validateJSXSyntax(code: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    // Check for balanced JSX tags
    const openTags = (code.match(/<[^/][^>]*>/g) || []).length;
    const closeTags = (code.match(/<\/[^>]*>/g) || []).length;
    const selfClosingTags = (code.match(/<[^>]*\/>/g) || []).length;
    
    // Self-closing tags don't need closing tags
    if (openTags !== closeTags + selfClosingTags) {
      errors.push('Unbalanced JSX tags');
    }
    
    // Check for proper JSX attribute syntax
    const invalidAttributes = code.match(/\w+=[^"'{][^>\s]*/g);
    if (invalidAttributes) {
      errors.push('Invalid JSX attribute syntax');
    }
    
  } catch (error) {
    errors.push('JSX syntax validation failed');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
} 