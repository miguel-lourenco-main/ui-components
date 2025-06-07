const fs = require('fs').promises;
const path = require('path');

async function prepareStaticData() {
  try {
    console.log('Preparing static data for export...');
    
    // Ensure public directory exists
    const publicDir = path.join(process.cwd(), 'public');
    await fs.mkdir(publicDir, { recursive: true });
    
    // Generate full component discovery result
    const registryPath = path.join(process.cwd(), 'components/display_components/_registry/components.json');
    const targetPath = path.join(publicDir, 'api');
    
    // Create api directory in public
    await fs.mkdir(targetPath, { recursive: true });
    
    // Read registry file
    const registryData = JSON.parse(await fs.readFile(registryPath, 'utf-8'));
    
    // Generate full component data
    const componentDiscoveryResult = await generateComponentDiscoveryResult(registryData);
    
    // Write the full component data
    await fs.writeFile(
      path.join(targetPath, 'components.json'), 
      JSON.stringify(componentDiscoveryResult, null, 2)
    );
    
    console.log('✅ Components data generated to public/api/components.json');
    console.log(`   - ${componentDiscoveryResult.components.length} components processed`);
    console.log(`   - ${componentDiscoveryResult.errors.length} errors found`);
    
    console.log('✅ Static data preparation complete');
  } catch (error) {
    console.error('❌ Error preparing static data:', error);
    process.exit(1);
  }
}

async function generateComponentDiscoveryResult(registry) {
  const components = [];
  const errors = [];
  
  for (const registryComponent of registry.components) {
    try {
      const component = await loadComponentFromRegistry(registryComponent);
      if (component) {
        components.push(component);
      }
    } catch (error) {
      errors.push({
        filePath: registryComponent.filePath,
        error: error.message,
        type: 'component'
      });
    }
  }
  
  return { components, errors };
}

async function loadComponentFromRegistry(registryEntry) {
  const componentPath = path.join(process.cwd(), registryEntry.filePath);
  const metaPath = path.join(process.cwd(), registryEntry.metaPath);
  const examplesPath = registryEntry.examplesPath ? path.join(process.cwd(), registryEntry.examplesPath) : undefined;
  
  // Load component code
  let code;
  try {
    code = await fs.readFile(componentPath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to load component code from ${componentPath}: ${error.message}`);
  }
  
  // Load metadata
  let metadata;
  try {
    const metaContent = await fs.readFile(metaPath, 'utf-8');
    metadata = JSON.parse(metaContent);
  } catch (error) {
    throw new Error(`Failed to load metadata from ${metaPath}: ${error.message}`);
  }
  
  // Load examples if they exist
  let examples = [];
  if (examplesPath) {
    try {
      await fs.access(examplesPath);
      examples = await loadComponentExamples(examplesPath);
    } catch {
      // Examples file doesn't exist or failed to load
    }
  }
  
  // Get file stats
  const stats = await fs.stat(componentPath);
  
  const localComponent = {
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
    filePath: componentPath,
    metaPath,
    examplesPath: examplesPath && await fileExists(examplesPath) ? examplesPath : undefined,
    lastModified: stats.mtime,
    isLocal: true,
    dependencies: [],
    createdAt: stats.birthtime.toISOString(),
    updatedAt: stats.mtime.toISOString()
  };
  
  return localComponent;
}

async function loadComponentExamples(examplesPath) {
  try {
    const examplesContent = await fs.readFile(examplesPath, 'utf-8');
    
    // Extract example objects using a more robust approach
    const examples = [];
    
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
          const props = {};
          
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
        }
      }
    }
    
    return examples;
  } catch (error) {
    console.warn('Failed to load examples from', examplesPath, error);
    return [];
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

if (require.main === module) {
  prepareStaticData();
}

module.exports = prepareStaticData; 