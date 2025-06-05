import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { LocalComponent, LocalComponentMetadata, ComponentDiscoveryResult, ComponentDiscoveryError, ComponentExample } from '@/types';

const COMPONENTS_DIR = path.join(process.cwd(), 'app/components/cv');

/**
 * GET /api/components - Discover and return all local components
 */
export async function GET(request: NextRequest) {
  try {
    const result = await discoverLocalComponents();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Component discovery error:', error);
    return NextResponse.json(
      { 
        components: [], 
        errors: [{ 
          filePath: COMPONENTS_DIR, 
          error: error instanceof Error ? error.message : 'Unknown error', 
          type: 'component' as const 
        }] 
      },
      { status: 500 }
    );
  }
}

/**
 * Discover all local components by scanning the components directory
 */
async function discoverLocalComponents(): Promise<ComponentDiscoveryResult> {
  const components: LocalComponent[] = [];
  const errors: ComponentDiscoveryError[] = [];

  try {
    // Check if components directory exists
    try {
      await fs.access(COMPONENTS_DIR);
    } catch {
      // Create components directory if it doesn't exist
      await fs.mkdir(COMPONENTS_DIR, { recursive: true });
      return { components: [], errors: [] };
    }

    const categories = await fs.readdir(COMPONENTS_DIR, { withFileTypes: true });
    
    for (const categoryDir of categories) {
      if (!categoryDir.isDirectory() || categoryDir.name.startsWith('_')) {
        continue;
      }

      const categoryPath = path.join(COMPONENTS_DIR, categoryDir.name);
      
      try {
        const componentDirs = await fs.readdir(categoryPath, { withFileTypes: true });
        
        for (const componentDir of componentDirs) {
          if (!componentDir.isDirectory()) {
            continue;
          }

          const componentPath = path.join(categoryPath, componentDir.name);
          
          try {
            const component = await loadLocalComponent(componentPath);
            if (component) {
              components.push(component);
            }
          } catch (error) {
            errors.push({
              filePath: componentPath,
              error: error instanceof Error ? error.message : 'Unknown error',
              type: 'component'
            });
          }
        }
      } catch (error) {
        errors.push({
          filePath: categoryPath,
          error: error instanceof Error ? error.message : 'Failed to read category directory',
          type: 'component'
        });
      }
    }
  } catch (error) {
    errors.push({
      filePath: COMPONENTS_DIR,
      error: error instanceof Error ? error.message : 'Failed to read components directory',
      type: 'component'
    });
  }

  return { components, errors };
}

/**
 * Load a single local component from a directory
 */
async function loadLocalComponent(componentDir: string): Promise<LocalComponent | null> {
  const componentName = path.basename(componentDir);
  
  // Find component file (tsx or jsx)
  const possibleFiles = [
    `${componentName}.tsx`,
    `${componentName}.jsx`,
    'index.tsx',
    'index.jsx'
  ];
  
  let componentFile: string | null = null;
  for (const file of possibleFiles) {
    const filePath = path.join(componentDir, file);
    try {
      await fs.access(filePath);
      componentFile = filePath;
      break;
    } catch {
      // File doesn't exist, continue
    }
  }
  
  if (!componentFile) {
    throw new Error(`No component file found in ${componentDir}`);
  }

  // Load metadata
  const metaPath = path.join(componentDir, `${componentName}.meta.json`);
  let metadata: LocalComponentMetadata;
  
  try {
    const metaContent = await fs.readFile(metaPath, 'utf-8');
    metadata = JSON.parse(metaContent);
  } catch (error) {
    throw new Error(`Failed to load metadata from ${metaPath}: ${error}`);
  }

  // Load component code
  let code: string;
  try {
    code = await fs.readFile(componentFile, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to load component code from ${componentFile}: ${error}`);
  }

  // Load examples if they exist
  const examplesPath = path.join(componentDir, `${componentName}.examples.tsx`);
  let examples: ComponentExample[] = [];
  
  try {
    await fs.access(examplesPath);
    examples = await loadComponentExamples(examplesPath);
  } catch {
    // Examples file doesn't exist or failed to load, use empty array
  }

  // Get file stats for last modified date
  const stats = await fs.stat(componentFile);

  const localComponent: LocalComponent = {
    id: metadata.id,
    name: metadata.name,
    category: metadata.category,
    description: metadata.description,
    props: metadata.props,
    code,
    examples,
    tags: metadata.tags || [],
    version: metadata.version,
    author: metadata.author,
    filePath: componentFile,
    metaPath,
    examplesPath: await fileExists(examplesPath) ? examplesPath : undefined,
    lastModified: stats.mtime,
    isLocal: true,
    dependencies: [], // TODO: Extract from imports
    createdAt: stats.birthtime.toISOString(),
    updatedAt: stats.mtime.toISOString()
  };

  return localComponent;
}

/**
 * Load component examples from examples file
 * This uses a simpler approach that extracts basic info without full parsing
 */
async function loadComponentExamples(examplesPath: string): Promise<ComponentExample[]> {
  try {
    const examplesContent = await fs.readFile(examplesPath, 'utf-8');
    
    // Extract example objects using a more robust approach
    const examples: ComponentExample[] = [];
    
    // Find all example objects that have name, description, and props
    const exampleMatches = examplesContent.match(/{\s*name:\s*["']([^"']+)["'],[\s\S]*?props:\s*{[\s\S]*?}[\s\S]*?}/g);
    
    if (exampleMatches) {
      for (const match of exampleMatches) {
        try {
          // Extract name
          const nameMatch = match.match(/name:\s*["']([^"']+)["']/);
          const name = nameMatch ? nameMatch[1] : 'Unnamed Example';
          
          // Extract description
          const descMatch = match.match(/description:\s*["']([^"']+)["']/);
          const description = descMatch ? descMatch[1] : '';
          
          // For props, we'll create a simplified structure
          // Extract simple prop values like variant: "primary", size: "md", etc.
          const props: Record<string, any> = {};
          
          // Extract string props
          const stringProps = match.match(/(\w+):\s*["']([^"']+)["']/g);
          if (stringProps) {
            for (const prop of stringProps) {
              const propMatch = prop.match(/(\w+):\s*["']([^"']+)["']/);
              if (propMatch && propMatch[1] !== 'name' && propMatch[1] !== 'description') {
                props[propMatch[1]] = propMatch[2];
              }
            }
          }
          
          // Extract boolean props
          const boolProps = match.match(/(\w+):\s*(true|false)/g);
          if (boolProps) {
            for (const prop of boolProps) {
              const propMatch = prop.match(/(\w+):\s*(true|false)/);
              if (propMatch) {
                props[propMatch[1]] = propMatch[2] === 'true';
              }
            }
          }
          
          examples.push({
            name,
            description,
            props
          });
        } catch (parseError) {
          console.warn('Failed to parse individual example:', parseError);
          // Continue with other examples
        }
      }
    }
    
    return examples;
  } catch (error) {
    console.warn('Failed to load examples from', examplesPath, error);
    return [];
  }
}

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
} 