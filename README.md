GITLAB PAGES URL:  https://miguel-lourenco-main.gitlab.io/ui-components

## Debug Configuration

The project uses a conditional logging system to manage console.log statements. Debug logging is controlled through configuration in `lib/constants.ts`.

### Debug Categories

- `COMPONENT_REGISTRY` - Component loading and discovery (enabled in development)
- `COMPONENT_STATE` - Hook state changes (disabled by default, very verbose)
- `COMPONENT_PROPS` - Props updates and function generation (disabled by default)
- `FUNCTION_EDITOR` - Function prop editor debugging (disabled by default)
- `BUILD_SCRIPTS` - Build script logs (always enabled)
- `DEBUG_SCRIPTS` - Debug utility scripts (always enabled)

### Enabling Debug Logs

To enable specific debug categories, modify the `DEBUG_CONFIG` object in `lib/constants.ts`:

```typescript
export const DEBUG_CONFIG = {
  COMPONENT_REGISTRY: true, // Enable component registry logs
  COMPONENT_STATE: true,    // Enable state change logs (verbose!)
  COMPONENT_PROPS: true,    // Enable props debugging
  // ...
} as const;
```

### What was changed

- **Preserved console.logs**: Debug scripts (`debug-simple.js`, `debug-props.js`), build scripts, error/warning messages
- **Made conditional**: Component loading, state management, props updates, function editor logs
- **Removed**: Non-useful debug statements that were just noise

The system preserves important error reporting while allowing you to control development debugging output.