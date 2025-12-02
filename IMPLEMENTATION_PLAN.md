# Properties Editor Improvement - Analysis & Implementation Plan

## Current State Analysis

### 1. Component Props (e.g., Button `children`)
- **Current Implementation**: 
  - Button's `children` prop is defined as `type: 'function'` in `Button.meta.json`
  - Button component accepts `children: React.ReactNode | (() => React.ReactNode)`
  - Currently uses `FunctionPropEditor` which shows only function body
  - User must write function that returns JSX: `() => <span>Text</span>`
  - Examples use simple strings: `children: "Primary"` which get converted to functions

### 2. Function Props Editor
- **Current Implementation**:
  - Uses Monaco Editor for code editing
  - Shows only function body (without function signature/return statement)
  - Validates code using Babel parser
  - Converts to `FunctionPropValue` object with `{ type: 'function', source: string, signature?: {...} }`
  - No reset button to restore initial state
  - Function signature is inferred from prop definition but not shown in editor

### 3. PropControl Component
- Handles non-function props (string, number, boolean, enum, array, object, color)
- No special handling for component/JSX props
- Component props currently fall through to function type handling

## Requirements

### 1. Component Input Editor (New Component Type)
- Replace text input with Monaco editor (similar to FunctionPropEditor)
- User inputs **only JSX/component code** (no function wrapper, no return statement)
- System automatically wraps user input:
  - Adds function signature wrapper: `() => { return <user-input> }`
  - Validates the wrapped code
  - Converts to executable function
  - Passes component node directly to rendered component (not as function)

### 2. Refactor Button `children` Prop
- Change from `type: 'function'` to `type: 'component'` (or new type)
- Update Button component to accept `children: React.ReactNode` (remove function wrapper)
- Update Button.meta.json to reflect new type
- Update examples to use component format instead of function format

### 3. Refactor Function Props Editor
- Display **full function** in editor:
  - Function signature: `(params) => returnType {`
  - Function body (user input)
  - Return statement: `return ...`
- Add **Reset button** to restore initial/default state
- Maintain backward compatibility with existing function props

## Implementation Plan

### Phase 1: Add New Component Prop Type

#### 1.1 Update Type Definitions
**File**: `lib/interfaces.ts`
- Add `'component'` to `PropType` union type
- Consider if we need a separate `ComponentPropValue` interface or reuse `FunctionPropValue`

#### 1.2 Create ComponentPropEditor Component
**File**: `components/ComponentPropEditor.tsx` (new file)
- Similar structure to `FunctionPropEditor.tsx`
- Monaco editor for JSX/TSX editing
- User inputs only JSX code (no function/return wrapper)
- On change:
  1. Check for `return` statement in user input → **Warn user** (component props shouldn't have return statements)
  2. Wrap user input: `() => { return <user-input> }`
  3. Validate wrapped code using existing validation utilities
  4. Convert to executable function
  5. Store as `FunctionPropValue` (or new `ComponentPropValue`)
- Display validation errors/warnings (including return statement warning)
- Show component preview if possible

#### 1.3 Update PropsPanel to Handle Component Type
**File**: `components/PropsPanel.tsx`
- Add check for `prop.type === 'component'` in `PropsList`
- Render `ComponentPropEditor` instead of `PropControl` or `FunctionPropEditor`

### Phase 2: Refactor Button Component

#### 2.1 Update Button Component
**File**: `components/display-components/buttons/Button/Button.tsx`
- Change `children` prop type from `React.ReactNode | (() => React.ReactNode)` to `React.ReactNode`
- Remove function check: `{typeof children === 'function' ? children() : children}`
- Simplify to: `{children}`

#### 2.2 Update Button Metadata
**File**: `components/display-components/buttons/Button/Button.meta.json`
- Change `children` prop `type` from `'function'` to `'component'`
- Update `functionSignature` to reflect component return type (or remove if not needed)
- Update description to indicate it's a component prop

#### 2.3 Update Button Examples
**File**: `components/display-components/buttons/Button/Button.examples.tsx`
- Update `buttonExamples` array to use component format
- Convert string examples to JSX format: `children: "<span>Primary</span>"` or keep as strings if system handles conversion

#### 2.4 Update Component Processing Logic
**File**: `lib/utils/functionProps.ts` or new `lib/utils/componentProps.ts`
- Create function to convert component prop value to ReactNode
- Handle both string and JSX string inputs
- Convert JSX strings to actual React elements using Babel

### Phase 3: Enhance Function Props Editor

#### 3.1 Update FunctionPropEditor Display
**File**: `components/FunctionPropEditor.tsx`
- Modify editor to show full function structure:
  - Display function signature as read-only header: `(params) => returnType {`
  - Editor shows function body + return statement
  - Or: Show complete function with signature, body, and return
- Update `getFunctionSource` to extract body from full function if needed

#### 3.2 Add Reset Functionality
**File**: `components/FunctionPropEditor.tsx`
- Add reset button next to Clear button
- Store initial/default value when component mounts
- Reset button restores initial value
- Handle initial value from:
  - Prop default value
  - Example value (if example is selected)
  - Empty state

#### 3.3 Update Function Source Extraction
**File**: `lib/utils/functionProps.ts`
- Update `getFunctionSource` to handle full function display
- Extract body from function if signature is included
- Maintain backward compatibility

### Phase 4: Integration & Validation

#### 4.1 Update Component Rendering Logic
**File**: `components/LocalComponentRenderer.tsx`
- Ensure component props are converted correctly
- Handle both function and component prop types
- Pass component nodes directly (not as functions)

#### 4.2 Update Code Generation
**File**: `lib/hooks/useLocalComponentState.tsx`
- Update `generateCodeWithProps` to handle component props
- Generate proper JSX for component props in code preview
- Handle component prop values in examples

#### 4.3 Update Validation
**File**: `lib/utils/codeValidation.ts`
- Ensure validation works for component props (JSX validation)
- Handle wrapped component code validation
- **Add new function**: `validateComponentPropCode(source: string): ValidationResult`
  - **Pre-wrap validation**: Check raw user input for `return` statements
    - Use Babel AST traversal (`@babel/traverse`) to find `ReturnStatement` nodes
    - Issue **warning** (not error) when return statement is found
    - Message: "Component props should not include 'return' statements. Just write the JSX directly."
    - Line numbers from AST node location
  - Then wrap and validate: `() => { return <user-input> }`
  - Use existing `validateFunctionCode` for wrapped validation
  - Combine warnings from both pre-wrap and wrapped validation
- Provide appropriate error messages
- Adjust line numbers to match user's input (not wrapped version)

## Technical Considerations

### 1. Component Prop Value Storage
**Decision**: Use `FunctionPropValue` structure but with special handling
- Store JSX code as `source` string
- System wraps it in function when needed
- Convert to ReactNode when passing to component

### 2. Monaco Editor Configuration
- Use `typescript` language mode for JSX support
- Configure JSX syntax highlighting
- Enable proper autocomplete for React components

### 3. Validation Strategy
- **Pre-validation check**: Detect `return` statements in raw user input → Issue warning
- Wrap user input: `() => { return <user-input> }`
- Validate wrapped code using existing Babel parser
- Extract meaningful errors relative to user's input (not wrapped version)
- **Important**: Component props are NOT functions, so users shouldn't write `return` statements

### 4. Backward Compatibility
- Existing function props continue to work
- Component props are new type, don't break existing functionality
- Examples can be migrated gradually

### 5. Error Handling
- Clear error messages when JSX is invalid
- Show line numbers relative to user input (not wrapped code)
- **Warning for return statements**: "Component props should not include 'return' statements. Just write the JSX directly."
- Handle edge cases (empty input, malformed JSX, etc.)

## Testing Checklist

- [ ] Component prop editor displays Monaco editor
- [ ] User can input JSX without function wrapper
- [ ] System wraps and validates code correctly
- [ ] Component renders correctly with component prop
- [ ] Button component accepts ReactNode directly
- [ ] Function props editor shows full function structure
- [ ] Reset button restores initial state
- [ ] Validation errors are clear and accurate
- [ ] **Warning appears when user includes 'return' statement in component prop**
- [ ] Examples work with new component prop format
- [ ] Code generation includes component props correctly
- [ ] Backward compatibility maintained for function props

## File Changes Summary

### New Files
- `components/ComponentPropEditor.tsx` - New editor for component props

### Modified Files
- `lib/interfaces.ts` - Add 'component' to PropType
- `components/PropsPanel.tsx` - Handle component prop type
- `components/FunctionPropEditor.tsx` - Show full function, add reset
- `components/display-components/buttons/Button/Button.tsx` - Remove function wrapper
- `components/display-components/buttons/Button/Button.meta.json` - Change type to component
- `components/display-components/buttons/Button/Button.examples.tsx` - Update examples
- `lib/utils/functionProps.ts` - Add component prop conversion utilities
- `lib/utils/codeValidation.ts` - Ensure JSX validation works
- `components/LocalComponentRenderer.tsx` - Handle component props
- `lib/hooks/useLocalComponentState.tsx` - Update code generation

