const fs = require('fs').promises;
const path = require('path');

const REGISTRY_PATH = path.join(process.cwd(), 'components/display_components/_registry/components.json');
const OUTPUT_PATH = path.join(process.cwd(), 'lib/generated-registry.json');
const PUBLIC_OUTPUT_PATH = path.join(process.cwd(), 'public/generated-registry.json');

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
    
    // Write the expanded registry to both locations
    const registryJson = JSON.stringify(expandedRegistry, null, 2);
    await fs.writeFile(OUTPUT_PATH, registryJson);
    await fs.writeFile(PUBLIC_OUTPUT_PATH, registryJson);
    
    console.log(`🎉 Expanded registry built successfully!`);
    console.log(`   - ${expandedComponents.length} components processed`);
    console.log(`   - ${errors.length} errors encountered`);
    console.log(`   - Output: ${OUTPUT_PATH}`);
    console.log(`   - Public output: ${PUBLIC_OUTPUT_PATH}`);
    
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
    
    // Get component name from path for predefined examples
    const componentName = path.basename(path.dirname(examplesPath));
    
    // Return predefined examples for new components
    const predefinedExamples = getPredefinedExamples(componentName);
    if (predefinedExamples.length > 0) {
      return predefinedExamples;
    }
    
    // Fallback to parsing for older components
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

function getPredefinedExamples(componentName) {
  const exampleMap = {
    'Progress': [
      {
        name: 'Basic Progress',
        description: 'Simple progress bar at 33%',
        props: {
          value: 33,
          className: 'w-full'
        }
      },
      {
        name: 'Animated Progress',
        description: 'Progress bar that animates from 13% to 66%',
        props: {
          value: 66,
          className: 'w-full'
        }
      },
      {
        name: 'Progress with Percentage',
        description: 'Progress bar at 75% with percentage display',
        props: {
          value: 75,
          className: 'w-full'
        }
      },
      {
        name: 'Complete Progress',
        description: 'Completed progress bar',
        props: {
          value: 100,
          className: 'w-full'
        }
      }
    ],
    'Skeleton': [
      {
        name: 'Basic Skeleton',
        description: 'Simple loading skeleton',
        props: {
          className: 'h-4 w-[250px]'
        }
      },
      {
        name: 'Card Skeleton',
        description: 'Skeleton for card layout',
        props: {
          className: 'h-[125px] w-[250px] rounded-xl'
        }
      },
      {
        name: 'Profile Skeleton',
        description: 'Skeleton for profile section',
        props: {
          className: 'w-20 h-20 rounded-full'
        }
      },
      {
        name: 'List Skeleton',
        description: 'Skeleton for list items',
        props: {
          className: 'h-12 w-12 rounded-full'
        }
      },
      {
        name: 'Text Block Skeleton',
        description: 'Skeleton for text content',
        props: {
          className: 'h-4 w-full'
        }
      }
    ],
    'Slider': [
      {
        name: 'Basic Slider',
        description: 'Simple slider with default value',
        props: {
          defaultValue: [50],
          max: 100,
          step: 1,
          className: 'w-full'
        }
      },
      {
        name: 'Range Slider',
        description: 'Dual handle range slider',
        props: {
          defaultValue: [25, 75],
          max: 100,
          step: 1,
          className: 'w-full'
        }
      },
      {
        name: 'Price Range',
        description: 'Price range from $0 to $1000',
        props: {
          defaultValue: [200, 800],
          max: 1000,
          min: 0,
          step: 10,
          className: 'w-full'
        }
      },
      {
        name: 'Stepped Slider',
        description: 'Slider with 10-unit steps',
        props: {
          defaultValue: [50],
          max: 100,
          min: 0,
          step: 10,
          className: 'w-full'
        }
      }
    ],
    'Switch': [
      {
        name: 'Basic Switch',
        description: 'Simple toggle switch',
        props: {
          id: 'basic-switch'
        }
      },
      {
        name: 'Switch with Label',
        description: 'Switch with descriptive label',
        props: {
          id: 'labeled-switch',
          label: 'Enable notifications'
        }
      },
      {
        name: 'Checked Switch',
        description: 'Switch that starts enabled',
        props: {
          id: 'checked-switch',
          checked: true,
          label: 'Dark mode'
        }
      },
      {
        name: 'Disabled Switch',
        description: 'Switch in disabled state',
        props: {
          id: 'disabled-switch',
          disabled: true,
          label: 'Maintenance mode'
        }
      }
    ],
    'Textarea': [
      {
        name: 'Basic Textarea',
        description: 'Simple multi-line text input',
        props: {
          placeholder: 'Type your message here...'
        }
      },
      {
        name: 'Textarea with Label',
        description: 'Textarea with descriptive label',
        props: {
          label: 'Your message',
          placeholder: 'Type your message here...'
        }
      },
      {
        name: 'Textarea with Helper Text',
        description: 'Textarea with helpful guidance',
        props: {
          label: 'Bio',
          placeholder: 'Tell us about yourself...',
          helperText: 'Your bio will be displayed on your public profile.'
        }
      },
      {
        name: 'Textarea with Value',
        description: 'Textarea with pre-filled content',
        props: {
          label: 'Description',
          value: 'This is a sample description that demonstrates the textarea with existing content.',
          placeholder: 'Enter description...'
        }
      },
      {
        name: 'Large Textarea',
        description: 'Taller textarea for longer content',
        props: {
          label: 'Comments',
          placeholder: 'Write your detailed comments here...',
          rows: 6
        }
      }
    ],
    'Toggle': [
      {
        name: 'Basic Toggle',
        description: 'Simple two-state button',
        props: {
          children: 'Toggle me',
          'aria-label': 'Toggle button'
        }
      },
      {
        name: 'Bold Toggle',
        description: 'Text formatting toggle',
        props: {
          children: 'Bold',
          'aria-label': 'Toggle bold formatting'
        }
      },
      {
        name: 'Pressed Toggle',
        description: 'Toggle in pressed state',
        props: {
          children: 'Italic',
          pressed: true,
          'aria-label': 'Toggle italic formatting'
        }
      },
      {
        name: 'Outline Toggle',
        description: 'Toggle with outline variant',
        props: {
          children: 'Outline',
          variant: 'outline',
          'aria-label': 'Toggle with outline style'
        }
      },
      {
        name: 'Large Toggle',
        description: 'Larger sized toggle button',
        props: {
          children: 'Large',
          size: 'lg',
          'aria-label': 'Large toggle button'
        }
      },
      {
        name: 'Disabled Toggle',
        description: 'Toggle in disabled state',
        props: {
          children: 'Disabled',
          disabled: true,
          'aria-label': 'Disabled toggle button'
        }
      }
    ],
    'Sonner': [
      {
        name: 'Basic Toast',
        description: 'Simple toast notification',
        props: {
          message: 'Hello World!',
          position: 'bottom-right'
        }
      },
      {
        name: 'Toast with Description',
        description: 'Toast with additional description',
        props: {
          message: 'Event has been created',
          description: 'Sunday, December 03, 2023 at 9:00 AM',
          position: 'bottom-right'
        }
      },
      {
        name: 'Success Toast',
        description: 'Success variant toast',
        props: {
          variant: 'success',
          message: 'Success toast',
          position: 'bottom-right'
        }
      },
      {
        name: 'Error Toast',
        description: 'Error variant toast',
        props: {
          variant: 'error',
          message: 'Error toast',
          position: 'bottom-right'
        }
      },
      {
        name: 'Top Position',
        description: 'Toast positioned at top',
        props: {
          message: 'Positioned toast!',
          position: 'top-center'
        }
      },
      {
        name: 'With Action',
        description: 'Toast with action button',
        props: {
          message: 'File deleted successfully',
          description: 'Your file has been moved to trash',
          position: 'bottom-right'
        }
      }
    ]
  };
  
  return exampleMap[componentName] || [];
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