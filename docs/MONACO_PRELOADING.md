# Monaco Editor Preloading

## Overview

The Monaco Editor preloading system optimizes the loading performance of the UI Components Playground by loading Monaco Editor in parallel with the component registry, rather than waiting until the editor is first needed.

## How It Works

### 1. Early Preload Initiation
- When `loadComponents()` is called in `useLocalComponentState`, Monaco Editor preloading starts immediately
- This happens in parallel with component registry loading, hiding Monaco's load time

### 2. Smart Component Loading
- `FunctionPropEditor` and `CodeViewer` components use `getPreloadedMonaco()` instead of direct imports
- If Monaco is already preloaded, it returns immediately
- If Monaco is still loading, it waits for the existing preload to complete
- If Monaco hasn't started loading, it falls back to loading on-demand

### 3. Performance Tracking
- The preloading process is tracked using the performance monitoring system
- Development mode shows real-time Monaco preload status
- Console logs report the optimization effectiveness

## Architecture

```
App Startup
├── Component Registry Loading (8s)
└── Monaco Editor Preload (3-5s) ← Runs in parallel

When Editor Needed:
├── Monaco Already Ready ← Best case
├── Monaco Still Loading ← Good case (waits for existing load)
└── Monaco Not Started ← Fallback case (loads on-demand)
```

## Files Involved

- `lib/monaco-preloader.ts` - Core preloading logic
- `lib/hooks/useLocalComponentState.tsx` - Initiates preload during component loading
- `components/FunctionPropEditor.tsx` - Uses preloaded Monaco
- `components/CodeViewer.tsx` - Uses preloaded Monaco
- `app/page.tsx` - Shows preload status in development mode

## Performance Benefits

### Before (Sequential Loading)
1. App loads → 2s
2. User clicks component → Component registry loads → 8s 
3. User opens function editor → Monaco Editor loads → 3-5s
4. **Total time to editor: 13-15s**

### After (Parallel Loading)
1. App loads → 2s
2. User clicks component → Registry + Monaco load in parallel → 8s (max of both)
3. User opens function editor → Monaco ready immediately → 0s
4. **Total time to editor: 10s (3-5s improvement)**

## Development Debugging

In development mode, you'll see:

1. **Console Logs**: Detailed preload progress and timing
2. **Monaco Status Badge**: Real-time status indicator showing:
   - ❌ Not Started
   - 🔄 Starting
   - ⏳ Loading  
   - ✅ Ready

3. **Performance Metrics**: Available in browser console when `?perf=true` is added to URL

## Usage Notes

- The preloader is safe to call multiple times - it prevents duplicate loads
- If preloading fails, the system gracefully falls back to on-demand loading
- The preloader automatically resets state on errors to allow retry
- All Monaco instances share the same preloaded module for efficiency

## Monitoring Effectiveness

The system automatically logs the relationship between component loading and Monaco preloading:

- **🎉 Optimal**: Monaco ready before components finish loading
- **⏳ Good**: Monaco still loading when components finish (parallelization working)  
- **⚠️ Warning**: Monaco not started when components finish (preload failed)

This helps identify if the optimization is working as expected in different deployment environments. 