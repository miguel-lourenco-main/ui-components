// =============================================================================
// PROPS DISPLAY DEBUG SCRIPT
// =============================================================================
// Paste this into your browser console to debug the object display issue
// =============================================================================

console.log('%c🔍 PROPS DISPLAY DEBUG SCRIPT', 'color: #0066cc; font-size: 16px; font-weight: bold;');
console.log('='.repeat(80));

// 1. Check for DataTable component props
console.log('%c📊 1. DATATABLE PROPS CHECK', 'color: #ff6600; font-weight: bold;');

// Try to access the playground state
if (window.COMPONENT_REGISTRY && window.COMPONENT_REGISTRY.DataTable) {
  console.log('✅ DataTable found in registry');
} else {
  console.log('❌ DataTable not found in global registry');
}

// 2. Check current component state
console.log('%c🎯 2. CURRENT COMPONENT STATE', 'color: #ff6600; font-weight: bold;');

// Look for React dev tools or state in DOM
const propsElements = document.querySelectorAll('[class*="prop"], [class*="Props"]');
console.log(`Found ${propsElements.length} props-related elements`);

// 3. Check for prop control components
console.log('%c🎛️ 3. PROP CONTROLS CHECK', 'color: #ff6600; font-weight: bold;');

const propControls = document.querySelectorAll('input, textarea, select, button');
console.log(`Found ${propControls.length} form controls`);

// Find any that might contain object/array data
propControls.forEach((control, index) => {
  if (control.value && (control.value.includes('[object') || control.value.includes('Object'))) {
    console.log(`🚨 Found [object Object] in control ${index}:`, control);
    console.log('  - Value:', control.value);
    console.log('  - Type:', control.tagName);
    console.log('  - Classes:', control.className);
  }
});

// 4. Check for array/object display elements
console.log('%c📝 4. ARRAY/OBJECT DISPLAY CHECK', 'color: #ff6600; font-weight: bold;');

const textElements = document.querySelectorAll('span, div, p');
let foundObjectDisplay = false;

textElements.forEach((element, index) => {
  const text = element.textContent;
  if (text && (text.includes('[object Object]') || text.includes('[object'))) {
    foundObjectDisplay = true;
    console.log(`🚨 Found [object Object] in element ${index}:`, element);
    console.log('  - Text:', text);
    console.log('  - Classes:', element.className);
    console.log('  - Parent:', element.parentElement);
  }
});

if (!foundObjectDisplay) {
  console.log('✅ No [object Object] found in display elements');
}

// 5. Sample props inspector
console.log('%c🔬 5. PROPS INSPECTOR HELPER', 'color: #ff6600; font-weight: bold;');

window.inspectProps = function() {
  console.log('%c=== PROPS INSPECTION ===', 'color: #00cc66; font-weight: bold;');
  
  // Try to find the props panel
  const propsPanel = document.querySelector('[class*="props"], [class*="Props"]');
  if (propsPanel) {
    console.log('📋 Found props panel:', propsPanel);
    
    // Look for prop values
    const propValues = propsPanel.querySelectorAll('input, textarea, span');
    propValues.forEach((element, index) => {
      const value = element.value || element.textContent;
      if (value && value.length > 0) {
        console.log(`Prop ${index}:`, {
          element: element,
          value: value,
          type: typeof value,
          isObject: value.includes && value.includes('[object')
        });
      }
    });
  } else {
    console.log('❌ No props panel found');
  }
};

// 6. DataTable props getter
console.log('%c📊 6. DATATABLE PROPS GETTER', 'color: #ff6600; font-weight: bold;');

window.getDataTableProps = function() {
  console.log('%c=== DATATABLE PROPS ===', 'color: #00cc66; font-weight: bold;');
  
  // Sample data that should be in props
  const expectedProps = {
    columns: [
      { accessorKey: 'name', header: 'Name', id: 'name' },
      { accessorKey: 'email', header: 'Email', id: 'email' },
      { accessorKey: 'role', header: 'Role', id: 'role' },
      { accessorKey: 'status', header: 'Status', id: 'status' }
    ],
    data: [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' }
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
      }
    ]
  };
  
  console.log('Expected props structure:');
  Object.entries(expectedProps).forEach(([key, value]) => {
    console.log(`  ${key}:`, value);
    console.log(`    - Type: ${typeof value}`);
    console.log(`    - Is Array: ${Array.isArray(value)}`);
    console.log(`    - Length: ${value?.length || 'N/A'}`);
    console.log(`    - String representation: ${String(value)}`);
  });
  
  return expectedProps;
};

// 7. Test object display function
console.log('%c🧪 7. OBJECT DISPLAY TEST', 'color: #ff6600; font-weight: bold;');

window.testObjectDisplay = function(obj) {
  console.log('%c=== OBJECT DISPLAY TEST ===', 'color: #00cc66; font-weight: bold;');
  
  const testObjects = [
    { test: 'object', data: { a: 1, b: 2 } },
    { test: 'array', data: [1, 2, 3, 4] },
    { test: 'nested', data: [{ name: 'test' }, { name: 'test2' }] }
  ];
  
  testObjects.forEach(({ test, data }) => {
    console.log(`${test}:`, data);
    console.log(`  - toString(): ${data.toString()}`);
    console.log(`  - String(): ${String(data)}`);
    console.log(`  - JSON.stringify(): ${JSON.stringify(data)}`);
    
    // Test the display logic
    if (Array.isArray(data)) {
      console.log(`  - Our display: Array (${data.length} items)`);
    } else if (typeof data === 'object') {
      const keys = Object.keys(data);
      console.log(`  - Our display: Object (${keys.length} properties)`);
    }
  });
};

console.log('%c📋 8. AVAILABLE FUNCTIONS', 'color: #ff6600; font-weight: bold;');
console.log('✅ window.inspectProps() - Inspect current props panel');
console.log('✅ window.getDataTableProps() - Get expected DataTable props');
console.log('✅ window.testObjectDisplay() - Test object display logic');

console.log('='.repeat(80));
console.log('%c✅ Props debug script ready!', 'color: #00cc66; font-size: 16px; font-weight: bold;');
console.log('Run the functions above to debug the object display issue.'); 