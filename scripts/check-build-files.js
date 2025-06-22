#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to analyze Next.js build output and verify chunk optimization
 */

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  const bytes = stats.size;
  
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function analyzeChunks() {
  const chunksDir = path.join(process.cwd(), 'out', '_next', 'static', 'chunks');
  
  if (!fs.existsSync(chunksDir)) {
    console.log('❌ Build output not found. Run "pnpm build" first.');
    return;
  }

  console.log('📊 Next.js Build Analysis\n');
  
  // Get all JS files in chunks directory
  const files = fs.readdirSync(chunksDir)
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const filePath = path.join(chunksDir, file);
      const size = fs.statSync(filePath).size;
      return { name: file, size, sizeFormatted: getFileSize(filePath) };
    })
    .sort((a, b) => b.size - a.size);

  // Categorize files
  const categories = {
    vendor: files.filter(f => f.name.startsWith('vendor-')),
    monaco: files.filter(f => f.name.includes('monaco')),
    app: files.filter(f => f.name.includes('main-app') || f.name.includes('page-')),
    framework: files.filter(f => f.name.includes('framework') || f.name.includes('polyfills')),
    other: files.filter(f => 
      !f.name.startsWith('vendor-') && 
      !f.name.includes('monaco') && 
      !f.name.includes('main-app') && 
      !f.name.includes('page-') &&
      !f.name.includes('framework') && 
      !f.name.includes('polyfills')
    )
  };

  // Display summary
  console.log(`📦 Total Files: ${files.length}`);
  console.log(`📊 Total Size: ${getFileSize(files.reduce((sum, f) => sum + f.size, 0))}\n`);

  // Display by category
  Object.entries(categories).forEach(([category, categoryFiles]) => {
    if (categoryFiles.length > 0) {
      console.log(`\n📁 ${category.toUpperCase()} (${categoryFiles.length} files):`);
      categoryFiles.forEach(file => {
        console.log(`   ${file.sizeFormatted.padStart(8)} ${file.name}`);
      });
    }
  });

  // Performance analysis
  console.log('\n🔍 Performance Analysis:');
  
  const smallFiles = files.filter(f => f.size < 50000); // < 50KB
  const tinyFiles = files.filter(f => f.size < 10000);  // < 10KB
  
  if (tinyFiles.length > 0) {
    console.log(`⚠️  ${tinyFiles.length} files under 10KB (may cause request overhead)`);
  }
  
  if (smallFiles.length > 5) {
    console.log(`⚠️  ${smallFiles.length} files under 50KB (consider if this is optimal)`);
  }
  
  if (files.length > 15) {
    console.log(`⚠️  ${files.length} total files (may be too many for static hosting)`);
  }

  if (files.length <= 10 && tinyFiles.length === 0) {
    console.log('✅ Chunk strategy looks optimized for static hosting!');
  }

  // Recommendations
  console.log('\n💡 Recommendations:');
  console.log(`   • Target: 5-10 total files for optimal GitLab Pages performance`);
  console.log(`   • Current: ${files.length} files`);
  
  if (files.length > 10) {
    console.log(`   • Consider increasing minSize in next.config.js`);
  }
  
  if (tinyFiles.length > 0) {
    console.log(`   • ${tinyFiles.length} files under 10KB should be combined`);
  }
}

// Also check pages and app chunks
function analyzePageChunks() {
  const pagesDir = path.join(process.cwd(), 'out', '_next', 'static', 'chunks', 'pages');
  const appDir = path.join(process.cwd(), 'out', '_next', 'static', 'chunks', 'app');
  
  console.log('\n📄 Page/App Chunks:');
  
  [pagesDir, appDir].forEach(dir => {
    if (fs.existsSync(dir)) {
      const dirName = path.basename(dir);
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
      
      if (files.length > 0) {
        console.log(`\n   ${dirName}/:`);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          console.log(`     ${getFileSize(filePath).padStart(8)} ${file}`);
        });
      }
    }
  });
}

// Main execution
try {
  analyzeChunks();
  analyzePageChunks();
} catch (error) {
  console.error('❌ Error analyzing build:', error.message);
  console.log('\n💡 Make sure you have run "pnpm build" first.');
} 