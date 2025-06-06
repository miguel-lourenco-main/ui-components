// Simple Debug Script for UI Components Playground
// Copy and paste this into your browser console

console.log('=== UI COMPONENTS DEBUG SCRIPT ===');

// 1. Basic environment check
console.log('\n1. ENVIRONMENT CHECK:');
console.log('Page URL:', window.location.href);
console.log('React available:', typeof React !== 'undefined');

// 2. Check for component registry
console.log('\n2. COMPONENT REGISTRY CHECK:');
if (typeof window.COMPONENT_REGISTRY !== 'undefined') {
  console.log('Registry found:', window.COMPONENT_REGISTRY);
} else {
  console.log('No registry found at window.COMPONENT_REGISTRY');
}

// 3. Check for DataTable component
console.log('\n3. DATATABLE CHECK:');
console.log('Looking for DataTable component...');

// 4. Check for errors in DOM
console.log('\n4. ERROR CHECK:');
var errorElements = document.querySelectorAll('.text-red-500, .text-red-600, [class*="error"]');
console.log('Found', errorElements.length, 'error elements');
for (var i = 0; i < errorElements.length; i++) {
  console.log('Error', i + 1, ':', errorElements[i].textContent.trim());
}

// 5. Helper functions
console.log('\n5. HELPER FUNCTIONS:');

window.debugProps = function(props) {
  console.log('=== PROPS DEBUG ===');
  console.log('Props:', props);
  if (props) {
    console.log('Props keys:', Object.keys(props));
    console.log('Has columns:', props.columns !== undefined);
    console.log('Has columnDefs:', props.columnDefs !== undefined);
    console.log('Has data:', props.data !== undefined);
    console.log('Has tableLabel:', props.tableLabel !== undefined);
    if (props.columns) {
      console.log('Columns:', props.columns);
    }
    if (props.data) {
      console.log('Data:', props.data);
    }
  }
  return props;
};

window.checkDataTable = function() {
  console.log('=== DATATABLE CHECK ===');
  
  // Check for DataTable in various places
  var checks = [
    'window.DataTable',
    'React.DataTable',
    'window.COMPONENT_REGISTRY.DataTable'
  ];
  
  for (var i = 0; i < checks.length; i++) {
    try {
      var component = null;
      if (checks[i] === 'window.DataTable') {
        component = window.DataTable;
      } else if (checks[i] === 'React.DataTable' && typeof React !== 'undefined') {
        component = React.DataTable;
      } else if (checks[i] === 'window.COMPONENT_REGISTRY.DataTable' && window.COMPONENT_REGISTRY) {
        component = window.COMPONENT_REGISTRY.DataTable;
      }
      
      if (component) {
        console.log('Found DataTable at:', checks[i]);
        console.log('Component:', component);
      } else {
        console.log('Not found at:', checks[i]);
      }
    } catch (e) {
      console.log('Error checking', checks[i], ':', e.message);
    }
  }
};

console.log('Created helper functions:');
console.log('- window.debugProps(props) - Debug props object');
console.log('- window.checkDataTable() - Check for DataTable component');

// 6. Look for console errors
console.log('\n6. CONSOLE MONITORING:');
console.log('Check above for any errors containing:');
console.log('- "columnDefs is undefined"');
console.log('- "Component registry"');
console.log('- "Failed to load component"');

// 7. Check network requests
console.log('\n7. NETWORK CHECK:');
console.log('Check Network tab for:');
console.log('- /api/components requests');
console.log('- Any failed requests');

console.log('\n=== DEBUG SCRIPT READY ===');
console.log('Use the helper functions above to debug specific issues.'); 