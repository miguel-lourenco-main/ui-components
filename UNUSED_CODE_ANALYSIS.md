# Unused Code Analysis Report

Generated on: $(date)

## Tools Used

- **Knip** - Modern tool for finding unused dependencies, exports, and files
- **Manual Analysis** - Cross-referencing imports and exports

## Summary

This analysis identified:
- **35 unused utility files** in `lib/utils/` (19 dummy files + 16 helper files)
- **5 unused dependencies** in `package.json`
- **3 duplicate exports** in components
- **10 unused hooks** in `lib/hooks/`
- **1 incorrectly named file** (`use-mount.ts` contains formatting functions, not a hook)

**Estimated total unused code: ~5000+ lines**

---

## 1. Unused Dummy Utility Files

All files in `lib/utils/` with the prefix `dummy*` appear to be completely unused:

### Completely Unused Files:
1. `lib/utils/dummyFormatters.ts`
2. `lib/utils/dummyComposers.ts`
3. `lib/utils/dummyData.ts`
4. `lib/utils/dummyHelpers.ts`
5. `lib/utils/dummyOperators.ts`
6. `lib/utils/dummyErrors.ts`
7. `lib/utils/dummyUtils.ts`
8. `lib/utils/dummyAsync.ts`
9. `lib/utils/dummyPrimitives.ts`
10. `lib/utils/dummyControls.ts`
11. `lib/utils/dummyConverters.ts`
12. `lib/utils/dummyModels.ts`
13. `lib/utils/dummyTransformers.ts`
14. `lib/utils/dummyComparators.ts`
15. `lib/utils/dummyIterators.ts`
16. `lib/utils/dummyCollections.ts`
17. `lib/utils/dummyFunctions.ts`
18. `lib/utils/dummyValidators.ts`
19. `lib/utils/dummyGenerators.ts`

**Total: 19 files, ~3000+ lines of unused code**

**Recommendation**: These files appear to be test/dummy utilities that were never integrated. Consider removing them unless they're needed for future development.

---

## 2. Unused Dependencies

### Production Dependencies:
1. `acorn-jsx` (package.json:51:6) - Not imported anywhere
2. `eslint-scope` (package.json:57:6) - Not imported anywhere

### Dev Dependencies:
1. `@testing-library/react` (package.json:85:6) - Not used (project uses Playwright for E2E testing)
2. `@testing-library/user-event` (package.json:86:6) - Not used
3. `@types/eslint-scope` (package.json:88:6) - Not used (eslint-scope is unused)

**Recommendation**: Remove these dependencies to reduce bundle size and maintenance overhead.

---

## 3. Duplicate Exports

Knip identified duplicate exports in these files:

1. **`components/component-preview.tsx`**
   - Exports both `ComponentPreview` (named) and `default` (default export)
   - Line 91: `export function ComponentPreview`
   - Line 169: `export default ComponentPreview`

2. **`components/themed-preview-surface.tsx`**
   - Exports both `ThemedPreviewSurface` (named) and `default` (default export)
   - Line 20: `export function ThemedPreviewSurface`
   - Line 93: `export default ThemedPreviewSurface`

3. **`components/storage/drag-n-drop/files-drag-n-drop.tsx`**
   - Exports both `FilesDragNDrop` (named) and `default` (default export)
   - Line 35: `export const FilesDragNDrop`
   - Line 194: `export default FilesDragNDrop`

**Recommendation**: Choose either named or default export pattern consistently. Default exports are more common in Next.js projects.

---

## 4. Unused Hooks

The following hooks in `lib/hooks/` are not imported anywhere:

1. `use-geolocation.ts` - Not imported
2. `use-countdown.ts` - Not imported (contains `useCountdown` and `useTimer`)
3. `use-mount.ts` - **MISNAMED**: Contains formatting functions, not a hook
4. `use-online.ts` - Not imported (but `use-geolocation.ts` has `useOnline` function)
5. `use-focus.ts` - Not imported
6. `use-hover.ts` - Not imported
7. `use-media-query.ts` - Not imported
8. `use-copy-to-clipboard.ts` - Not imported
9. `use-fetch.ts` - Not imported (contains `useFetch` and `useAsync`)
10. `use-interval.ts` - Not imported

### Used Hooks:
- ✅ `useLocalComponentState.tsx` - Used in `app/playground/page.tsx`
- ✅ `use-component-data.ts` - Used in `components/improved-dynamic-component.tsx`
- ✅ `use-scroll-direction.ts` - Used in `app/playground/page.tsx` and `components/header.tsx`
- ✅ `use-drag-drop.ts` - Used in `components/storage/drag-n-drop/files-drag-n-drop.tsx`

**Recommendation**: Remove unused hooks or document them if they're intended for future use.

---

## 5. File Naming Issues

1. **`lib/hooks/use-mount.ts`** - Contains formatting functions (`formatNumberWithCommas`, `formatCurrencyAmount`, etc.) but is named as if it's a hook. Should be moved to `lib/utils/` or renamed.

---

## 6. Configuration Issues

### Knip Configuration (`knip.json`):
- Entry pattern `hooks/**/*.{js,jsx,ts,tsx}` has no matches (hooks are in `lib/hooks/`)
- Entry pattern `pages/**/*.{js,jsx,ts,tsx}` has no matches (using Next.js App Router, not Pages Router)

**Recommendation**: Update `knip.json` to reflect actual project structure:
```json
{
  "entry": [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}"
  ]
}
```

---

## 7. Other Potential Issues

### Additional Unused Utility Files:
After verification, these files are also not imported anywhere:
- `lib/utils/parseHelpers.ts` - Not imported
- `lib/utils/formatHelpers.ts` - Not imported
- `lib/utils/compareHelpers.ts` - Not imported
- `lib/utils/cacheHelpers.ts` - Not imported
- `lib/utils/transformHelpers.ts` - Not imported
- `lib/utils/randomHelpers.ts` - Not imported
- `lib/utils/performanceHelpers.ts` - Not imported (note: `lib/performance.ts` is used, but not `performanceHelpers.ts`)
- `lib/utils/queueHelpers.ts` - Not imported
- `lib/utils/errorHelpers.ts` - Not imported
- `lib/utils/textHelpers.ts` - Not imported
- `lib/utils/pathHelpers.ts` - Not imported
- `lib/utils/typeHelpers.ts` - Not imported
- `lib/utils/domHelpers.ts` - Not imported
- `lib/utils/sortHelpers.ts` - Not imported
- `lib/utils/eventHelpers.ts` - Not imported
- `lib/utils/formatters.ts` - Not imported (calendar.tsx uses `formatters` prop from react-day-picker, not this file)

**Confirmed Used Files:**
- ✅ `lib/utils.ts` - Contains `cn()` function, widely used
- ✅ `lib/utils/functionProps.ts` - Used in ComponentPropEditor and LocalComponentRenderer
- ✅ `lib/utils/codeValidation.ts` - Used in ComponentPropEditor and FunctionPropEditor
- ✅ `lib/performance.ts` - Used in useLocalComponentState and monaco-preloader

**Total Unused Utility Files: 35 files** (19 dummy + 16 helpers)

---

## Recommendations Summary

### High Priority:
1. ✅ Remove all 19 `dummy*.ts` files from `lib/utils/`
2. ✅ Remove unused dependencies: `acorn-jsx`, `eslint-scope`, `@testing-library/react`, `@testing-library/user-event`, `@types/eslint-scope`
3. ✅ Fix duplicate exports in 3 component files
4. ✅ Fix or remove `lib/hooks/use-mount.ts` (contains wrong content)

### Medium Priority:
5. Remove or document unused hooks (10+ files)
6. Remove 16 additional unused utility helper files from `lib/utils/`
7. Update `knip.json` configuration

### Low Priority:
8. Standardize export patterns (named vs default)
9. Add JSDoc comments to exported functions that lack them

---

## Next Steps

1. Review this report and confirm which items can be safely removed
2. Create a backup branch before making changes
3. Remove unused code in batches, testing after each batch
4. Update `knip.json` and run `pnpm exec knip` again to verify cleanup
5. Consider adding a pre-commit hook to run Knip and prevent unused code accumulation

---

## Tools Reference

- **Knip**: https://knip.dev - Actively maintained, recommended over deprecated tools (ts-prune, depcheck, unimport)
- Installation: `pnpm add -D knip`
- Usage: `pnpm exec knip`
