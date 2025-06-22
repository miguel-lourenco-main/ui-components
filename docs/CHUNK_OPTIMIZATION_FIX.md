# Chunk Splitting Optimization Fix

## 🔍 **Problem Identified**

The initial chunk splitting optimization created **30+ small vendor files**, causing performance regression on GitLab Pages.

### **Before Fix: Over-Aggressive Splitting**
```
/out/_next/static/chunks/
├── vendor-a1a9c712-b7f74d0656838368.js (71KB)
├── vendor-accd540f-f9a2ef5e454a376e.js (13KB) 
├── vendor-c5c0eb82-ec3494b085aa86ef.js (3KB)  ← Too small!
├── vendor-fa8d57c7-c4c10c13f8593774.js (9KB)  ← Too small!
├── vendor-891efe19-149cd1f57393e17f.js (11KB) ← Too small!
├── ... 25+ more vendor chunks
└── Total: 35+ HTTP requests
```

### **Performance Impact on GitLab Pages**
- **HTTP Request Overhead**: 35+ requests vs 5-8 requests  
- **Small File Penalty**: 3KB-20KB files don't justify request overhead
- **Network Waterfall**: Browser loads chunks sequentially
- **Static Hosting Inefficiency**: GitLab Pages has latency per request

## ✅ **Solution: Conservative Chunking Strategy**

### **New Configuration**
```javascript
splitChunks: {
  chunks: 'all',
  minSize: 100000,    // Minimum 100KB chunks
  maxSize: 500000,    // Maximum 500KB chunks
  cacheGroups: {
    default: {
      minSize: 100000,  // Larger minimum to reduce file count
    },
    vendor: {
      minSize: 150000,  // Only create vendor chunks for larger libraries
      maxSize: 800000,  // Allow larger vendor chunks
    },
    monaco: {
      enforce: true,    // Always split Monaco (it's large)
    }
  }
}
```

### **Expected Result: Fewer, Larger Files**
```
/out/_next/static/chunks/
├── vendor-large.js (~400-800KB)        ← Combined small vendors
├── monaco-editor.js (~3MB)             ← Separate (large)
├── main-app.js (~200-400KB)            ← App code
├── framework.js (~150KB)               ← Next.js framework
└── Total: 5-8 HTTP requests (down from 35+)
```

## 📊 **Performance Benefits**

### **Reduced HTTP Requests**
- **Before**: 35+ requests (many tiny files)
- **After**: 5-8 requests (fewer, appropriately sized files)
- **Improvement**: ~75% reduction in requests

### **Better Cache Efficiency**
- Larger files have better cache hit ratios
- Fewer cache entries to manage
- More efficient browser resource loading

### **Static Hosting Optimization**
- Optimized for GitLab Pages static file serving
- Reduced DNS lookups and connection overhead
- Better alignment with CDN caching strategies

## 🛠️ **Files Modified**

### **next.config.js**
- **Removed**: Over-aggressive chunk splitting
- **Added**: Conservative chunking with larger minimums
- **Removed**: Excessive `optimizePackageImports` 
- **Added**: Relaxed performance limits for larger files

### **What Was Removed**
```javascript
// REMOVED: Created too many small chunks
radixui: {
  name: 'radix-ui',          // Created 10+ small Radix chunks
},
vendor: {
  maxSize: 200000,           // Too small, created many chunks
},
optimizePackageImports: [    // Created micro-chunks
  '@radix-ui/react-icons',
  // ... 15+ packages
]
```

### **What Was Added**
```javascript
// ADDED: Conservative chunking for static hosting
splitChunks: {
  minSize: 100000,           // Larger minimum chunk size
  maxSize: 500000,           // Reasonable maximum
  cacheGroups: {
    vendor: {
      minSize: 150000,       // Only chunk large libraries
      maxSize: 800000,       // Allow larger vendor bundles
    }
  }
}
```

## 🧪 **Testing the Fix**

### **Build and Compare**
```bash
# Build with new configuration
pnpm build

# Check file count (should be much lower)
find out/_next/static/chunks -name "*.js" | wc -l

# Check file sizes
ls -lah out/_next/static/chunks/*.js
```

### **Expected Metrics**
- **File Count**: 35+ files → 5-8 files
- **Largest File**: ~800KB (acceptable for static hosting)
- **Initial Load**: Should improve due to fewer requests
- **Monaco Load**: Still benefits from preloading

### **Performance Testing**
1. **Clear Browser Cache**
2. **Test Initial Load**: Should be faster despite larger individual files
3. **Test Monaco Editor**: Should load instantly (preloaded)
4. **Test Subsequent Visits**: Should be much faster (better caching)

## 📈 **Expected Results on GitLab Pages**

### **Initial Load Performance**
- **Before**: 35+ HTTP requests, many small files
- **After**: 5-8 HTTP requests, appropriately sized files
- **Result**: Faster overall loading despite larger individual files

### **Monaco Editor Performance**
- **Preloading**: Still works, loads during component discovery
- **First Access**: Instant (already preloaded)
- **Bundle Size**: Properly separated from main bundle

### **Caching Benefits**
- Fewer cache entries to manage
- Better cache hit ratios for larger files
- More efficient subsequent page loads

This fix addresses the root cause while maintaining the Monaco preloading benefits and overall performance improvements. 