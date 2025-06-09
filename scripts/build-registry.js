const fs = require('fs').promises;
const path = require('path');

const REGISTRY_PATH = path.join(process.cwd(), 'components/display_components/_registry/components.json');
const OUTPUT_PATH = path.join(process.cwd(), 'lib/generated-registry.json');

async function buildExpandedRegistry() {
  try {
    console.log('🔨 Building expanded registry...');
    
    // Read the base registry
    const registryContent = await fs.readFile(REGISTRY_PATH, 'utf-8');
    const registry = JSON.parse(registryContent);
    
    const expandedComponents = [];
    const errors = [];
    
    for (const registryComponent of registry.components) {
      try {
        console.log(`📄 Processing ${registryComponent.name}...`);
        
        const expandedComponent = await expandComponent(registryComponent);
        expandedComponents.push(expandedComponent);
        
        console.log(`✅ ${registryComponent.name} processed successfully`);
      } catch (error) {
        console.error(`❌ Failed to process ${registryComponent.name}:`, error.message);
        errors.push({
          componentId: registryComponent.id,
          error: error.message
        });
      }
    }
    
    const expandedRegistry = {
      ...registry,
      components: expandedComponents,
      buildErrors: errors,
      buildTime: new Date().toISOString()
    };
    
    // Write the expanded registry
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(expandedRegistry, null, 2));
    
    console.log(`🎉 Expanded registry built successfully!`);
    console.log(`   - ${expandedComponents.length} components processed`);
    console.log(`   - ${errors.length} errors encountered`);
    console.log(`   - Output: ${OUTPUT_PATH}`);
    
  } catch (error) {
    console.error('💥 Failed to build registry:', error);
    process.exit(1);
  }
}

async function expandComponent(registryComponent) {
  const componentPath = path.resolve(registryComponent.filePath);
  const metaPath = path.resolve(registryComponent.metaPath);
  const examplesPath = registryComponent.examplesPath ? path.resolve(registryComponent.examplesPath) : null;
  
  // Load component code
  let code = '';
  try {
    code = await fs.readFile(componentPath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read component file: ${error.message}`);
  }
  
  // Load metadata (props definitions)
  let metadata = {};
  try {
    const metaContent = await fs.readFile(metaPath, 'utf-8');
    metadata = JSON.parse(metaContent);
  } catch (error) {
    throw new Error(`Failed to read metadata file: ${error.message}`);
  }
  
  // Load examples
  let examples = [];
  if (examplesPath) {
    try {
      await fs.access(examplesPath);
      examples = await loadComponentExamples(examplesPath);
    } catch (error) {
      console.warn(`⚠️ Could not load examples for ${registryComponent.name}: ${error.message}`);
    }
  }
  
  // Get file stats
  const stats = await fs.stat(componentPath);
  
  return {
    ...registryComponent,
    code,
    props: metadata.props || [],
    examples,
    lastModified: stats.mtime.toISOString(),
    createdAt: stats.birthtime.toISOString(),
    updatedAt: stats.mtime.toISOString(),
    isLocal: true,
    dependencies: extractDependencies(code)
  };
}

async function loadComponentExamples(examplesPath) {
  try {
    const examplesContent = await fs.readFile(examplesPath, 'utf-8');
    
      // Check if this is a DataTable component (needs special handling)
  if (examplesPath.includes('DataTable')) {
    return await loadDataTableExamples(examplesPath, examplesContent);
  }
    
    // Look for exported examples array or individual example objects
    const examples = [];
    
    // Try to find example objects with name, description, and props
    const exampleMatches = examplesContent.match(/{\s*name:\s*["']([^"']+)["'][^}]*props:\s*{[^}]*}[^}]*}/g);
    
    if (exampleMatches) {
      for (const match of exampleMatches) {
        try {
          const example = parseExample(match);
          if (example) {
            examples.push(example);
          }
        } catch (parseError) {
          console.warn('Failed to parse example:', parseError.message);
        }
      }
    }
    
    return examples;
  } catch (error) {
    throw new Error(`Failed to load examples: ${error.message}`);
  }
}

async function loadDataTableExamples(examplesPath, examplesContent) {
  // For DataTable components, provide working examples with proper data structures
  const componentName = path.basename(path.dirname(examplesPath));
  
  if (componentName === 'DataTable') {
    return [
      {
        name: "Basic Data Table",
        description: "Simple data table with users data",
        props: {
          columns: [
            { accessorKey: 'name', header: 'Name', id: 'name' },
            { accessorKey: 'email', header: 'Email', id: 'email' },
            { accessorKey: 'role', header: 'Role', id: 'role' },
            { accessorKey: 'status', header: 'Status', id: 'status' }
          ],
          data: [
            { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
            { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' }
          ],
          tableLabel: "Users"
        }
      },
      {
        name: "Data Table with Filters",
        description: "Data table with role and status filters",
        props: {
          columns: [
            { accessorKey: 'name', header: 'Name', id: 'name' },
            { accessorKey: 'email', header: 'Email', id: 'email' },
            { accessorKey: 'role', header: 'Role', id: 'role' },
            { accessorKey: 'status', header: 'Status', id: 'status' }
          ],
          data: [
            { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
            { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
            { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'Manager', status: 'Active' },
            { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'Pending' }
          ],
          tableLabel: "Users",
          filters: [
            {
              id: 'role',
              options: [
                { label: 'Admin', value: 'Admin' },
                { label: 'Manager', value: 'Manager' },
                { label: 'User', value: 'User' }
              ]
            },
            {
              id: 'status',
              options: [
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' },
                { label: 'Pending', value: 'Pending' }
              ]
            }
          ]
        }
      },
      {
        name: "Data Table with Sorting",
        description: "Data table with initial sorting by name",
        props: {
          columns: [
            { accessorKey: 'name', header: 'Name', id: 'name' },
            { accessorKey: 'email', header: 'Email', id: 'email' },
            { accessorKey: 'role', header: 'Role', id: 'role' },
            { accessorKey: 'status', header: 'Status', id: 'status' }
          ],
          data: [
            { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
            { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' }
          ],
          tableLabel: "Users",
          initialSorting: [{ id: 'name', desc: false }]
        }
      }
    ];
  }
  

  
  return [];
}

function parseExample(exampleString) {
  // Extract name
  const nameMatch = exampleString.match(/name:\s*["']([^"']+)["']/);
  const name = nameMatch ? nameMatch[1] : 'Unnamed Example';
  
  // Extract description
  const descMatch = exampleString.match(/description:\s*["']([^"']+)["']/);
  const description = descMatch ? descMatch[1] : '';
  
  // Extract props (simplified parsing)
  const props = {};
  
  // Extract string props
  const stringProps = exampleString.match(/(\w+):\s*["']([^"']+)["']/g);
  if (stringProps) {
    for (const prop of stringProps) {
      const propMatch = prop.match(/(\w+):\s*["']([^"']+)["']/);
      if (propMatch && propMatch[1] !== 'name' && propMatch[1] !== 'description') {
        props[propMatch[1]] = propMatch[2];
      }
    }
  }
  
  // Extract boolean props
  const boolProps = exampleString.match(/(\w+):\s*(true|false)/g);
  if (boolProps) {
    for (const prop of boolProps) {
      const propMatch = prop.match(/(\w+):\s*(true|false)/);
      if (propMatch) {
        props[propMatch[1]] = propMatch[2] === 'true';
      }
    }
  }
  
  // Extract number props
  const numberProps = exampleString.match(/(\w+):\s*(\d+)/g);
  if (numberProps) {
    for (const prop of numberProps) {
      const propMatch = prop.match(/(\w+):\s*(\d+)/);
      if (propMatch && !['name', 'description'].includes(propMatch[1])) {
        props[propMatch[1]] = parseInt(propMatch[2]);
      }
    }
  }
  
  return {
    name,
    description,
    props
  };
}

function extractDependencies(code) {
  const dependencies = [];
  
  // Extract import statements
  const importMatches = code.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
  if (importMatches) {
    for (const importMatch of importMatches) {
      const depMatch = importMatch.match(/from\s+['"]([^'"]+)['"]/);
      if (depMatch && !depMatch[1].startsWith('.')) {
        dependencies.push(depMatch[1]);
      }
    }
  }
  
  return [...new Set(dependencies)]; // Remove duplicates
}

if (require.main === module) {
  buildExpandedRegistry();
}

module.exports = buildExpandedRegistry; 