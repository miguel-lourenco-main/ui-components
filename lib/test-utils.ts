import { expect } from '@playwright/test';

export const VALID_FUNCTION_TEST = 'Status: ✅ Valid function - will appear in generated code';
export const INVALID_FUNCTION_TEST = 'Status: ❌ Invalid function - will not appear in generated code';

// Helper functions for common UI interactions
export const getPropControl = (page: any, propName: string) => {
  return page.getByTestId(`prop-control-${propName}`);
};

export const getSelectControl = (page: any, propName: string) => {
  return getPropControl(page, propName).locator('select');
};

export const getInputControl = (page: any, propName: string) => {
  return getPropControl(page, propName).locator('input');
};

export const getMonacoEditor = (page: any, propName: string) => {
  return getPropControl(page, propName).locator('.monaco-editor');
};

export const getFunctionPropStatus = (page: any, propName: string) => {
  return getPropControl(page, propName).getByTestId('function-prop-status');
};

// Common operations
export const selectOption = async (page: any, propName: string, value: string) => {
  const select = getSelectControl(page, propName);
  await expect(select).toBeEnabled();
  await select.scrollIntoViewIfNeeded();
  await select.click();
  
  // Check if the option exists before trying to select it
  const options = await select.locator('option').allTextContents();
  if (!options.some((option: string) => option.toLowerCase().includes(value.toLowerCase()))) {
    throw new Error(`Option '${value}' not found in dropdown. Available options: ${options.join(', ')}`);
  }
  
  await select.selectOption(value);
};

export const typeInInput = async (page: any, propName: string, text: string) => {
  const input = getInputControl(page, propName);
  await expect(input).toBeEnabled();
  await input.scrollIntoViewIfNeeded();
  await input.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.type(text);
};

export const typeInNumberInput = async (page: any, propName: string, value: number | string) => {
  const input = getInputControl(page, propName);
  await expect(input).toBeEnabled();
  await input.scrollIntoViewIfNeeded();
  await input.clear();
  await input.fill(value.toString());
};

export const toggleCheckbox = async (page: any, propName: string) => {
  const checkbox = getInputControl(page, propName);
  await expect(checkbox).toBeEnabled();
  await checkbox.scrollIntoViewIfNeeded();
  await checkbox.click();
};

/**
 * Reset component state to clean slate before each test
 */
export const resetComponentState = async (page: any) => {
  console.log('🧹 Resetting component state...');
  
  try {
    // Clear browser state
    await page.evaluate(() => {
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear console
      console.clear();
      
      // Reset any global variables that might persist
      if (window.location.href.includes('localhost')) {
        // Force a clean slate for React state
        if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
          (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = null;
        }
      }
    });
    
    // Clear any Monaco Editor content and reset to defaults
    const editors = await page.locator('.monaco-editor').all();
    for (const editor of editors) {
      if (await editor.isVisible()) {
        await editor.click();
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Delete');
      }
    }
    
    // Wait for any pending operations to complete
    await page.waitForTimeout(300);
    
    console.log('✅ Component state reset complete');
  } catch (error) {
    console.log('⚠️ Component state reset had issues (continuing):', error);
  }
};

/**
 * Universal test setup that ensures clean state before each test
 */
export const setupTest = async (page: any, componentName: string) => {
  console.log(`🚀 Setting up test for ${componentName}...`);
  
  // Navigate to the app
  await page.goto('/playground');
  
  // Wait for the loading indicator to disappear
  const loadingIndicator = page.getByText('Loading components...');
  await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });
  
  // Wait for the main component list header to be visible
  await expect(page.getByRole('heading', { name: 'Playground', level: 1 })).toBeVisible();
  
  // Reset any existing component state
  await resetComponentState(page);
  
  console.log(`✅ Test setup complete for ${componentName}`);
};

/**
 * Wait for component to stabilize after prop changes, especially function props
 */
export const waitForComponentStability = async (page: any, propName?: string, expectedContent?: string, timeoutMs: number = 3000, targetElement?: any) => {
  console.log(`🔄 Stabilizing component for ${propName || 'general'}...`);
  
  // Wait for any React updates to settle
  await page.waitForTimeout(300);
  
  // Wait for any pending function validation to complete (simplified)
  if (propName) {
    try {
      const status = getFunctionPropStatus(page, propName);
      await expect.poll(async () => {
        const statusText = await status.textContent();
        return statusText === VALID_FUNCTION_TEST || statusText === INVALID_FUNCTION_TEST;
      }, {
        message: `Function validation for ${propName} did not complete`,
        timeout: timeoutMs,
        intervals: [300],
      }).toBe(true);
      console.log(`✅ Function validation complete for ${propName}`);
    } catch (error) {
      console.log(`⚠️ Function validation timed out for ${propName}, continuing...`);
    }
  }
  
  // Longer wait for component re-rendering to complete
  await page.waitForTimeout(500);
  
  // For event handlers, wait longer and be more permissive
  if (targetElement && propName && (propName.startsWith('on'))) {
    console.log(`🎯 Ensuring ${propName} handler is ready...`);
    
    // Multiple attempts with increasing waits
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const hasHandler = await targetElement.evaluate((el: any, handlerName: string) => {
          // Check React synthetic event handlers
          const reactKeys = Object.keys(el).filter(key => key.startsWith('__react'));
          for (const key of reactKeys) {
            const reactData = el[key];
            if (reactData && reactData.memoizedProps && reactData.memoizedProps[handlerName]) {
              return true;
            }
          }
          return false;
        }, propName);
        
        if (hasHandler) {
          console.log(`✅ ${propName} handler confirmed attached`);
          break;
        }
        
        attempts++;
        console.log(`🔄 Attempt ${attempts}/${maxAttempts} - ${propName} handler not ready, waiting...`);
        await page.waitForTimeout(500);
        
      } catch (error) {
        console.log(`⚠️ Handler check attempt ${attempts + 1} failed, continuing...`);
        attempts++;
        await page.waitForTimeout(500);
      }
    }
  }
  
  // Final stabilization wait
  await page.waitForTimeout(200);
  console.log(`✅ Component stability complete for ${propName || 'general'}`);
};

export const setFunctionProp = async (page: any, propName: string, functionCode: string) => {
  const editor = getMonacoEditor(page, propName);
  
  // Wait for Monaco editor to be available and visible
  await expect(editor).toBeVisible({ timeout: 15000 });
  await editor.scrollIntoViewIfNeeded();
  
  // Ensure Monaco editor is ready for interaction
  await page.waitForTimeout(500);
  
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.type(functionCode);
  
  const status = getFunctionPropStatus(page, propName);
  await expect(status).toHaveText(VALID_FUNCTION_TEST, { timeout: 10000 });
  
  // Use the enhanced stability waiting with content verification
  await waitForComponentStability(page, propName, functionCode);
};

// Generic prop testing functions that can be reused
export const createGenericSelectTest = (propName: string, value: string, screenshotSuffix?: string) => {
  return async (componentName: string, componentPreview: any, page: any) => {
    await selectOption(page, propName, value);
    const suffix = screenshotSuffix || value;
    await expect(componentPreview).toHaveScreenshot(`${componentName}-${suffix}.png`);
  };
};

export const createGenericInputTest = (propName: string, value: string, screenshotSuffix?: string) => {
  return async (componentName: string, componentPreview: any, page: any) => {
    await typeInInput(page, propName, value);
    const suffix = screenshotSuffix || propName;
    await expect(componentPreview).toHaveScreenshot(`${componentName}-${suffix}.png`);
  };
};

export const createGenericCheckboxTest = (propName: string, screenshotSuffix?: string) => {
  return async (componentName: string, componentPreview: any, page: any) => {
    await toggleCheckbox(page, propName);
    const suffix = screenshotSuffix || propName;
    await expect(componentPreview).toHaveScreenshot(`${componentName}-${suffix}.png`);
  };
};

export const createGenericFunctionTest = (propName: string, functionCode: string, screenshotSuffix?: string) => {
  return async (componentName: string, componentPreview: any, page: any) => {
    await setFunctionProp(page, propName, functionCode);
    const suffix = screenshotSuffix || propName;
    await expect(componentPreview).toHaveScreenshot(`${componentName}-${suffix}.png`);
  };
};

export const setupComponentTestConsts = (componentName: string) => {
  // Select the component from the list
  return async (page: any) => {
    // Convert kebab-case to PascalCase for proper matching
    // e.g., "data-table" -> "DataTable", "button" -> "Button"
    const displayName = componentName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    console.log('displayName', displayName);
    
    // Use a more flexible regex that matches the component name followed by version
    // This handles both "DataTable v1.0.0" and "Button v1.0.0" patterns
    const buttonPattern = new RegExp(`^${displayName} v`);

    await page.getByRole('button', { name: buttonPattern }).click();

    // Wait for the toolbar to appear with the Examples button
    const examplesButton = page.getByRole('button', { name: /Examples/i });
    await expect(examplesButton).toBeVisible();

    // Click the Examples button to open the examples panel
    await examplesButton.click();

    // Wait for examples panel to be visible
    const examplesPanel = page.getByTestId('examples-panel-desktop');
    await expect(examplesPanel).toBeVisible();

    // Wait for examples to be visible and get their count
    const examples = examplesPanel
      .getByRole('button', { name: /Currently selected|^(?!.*Currently selected).*$/ });
    const exampleCount = await examples.count();

    // Verify we have at least 3 examples to test with
    expect(exampleCount).toBeGreaterThanOrEqual(3);

    // Get the second and third examples (first is already selected by default)
    const secondExample = examples.nth(1);
    const thirdExample = examples.nth(2);

    const componentPreview = page.getByTestId('component-preview');
    const renderedComponent = componentPreview.getByTestId(`rendered-component-${componentName}`);

    return {
      componentPreview,
      renderedComponent,
      secondExample,
      thirdExample
    };
  }
};

export const doesComponentRender = async (componentName: string, componentPreview: any, renderedComponent: any) => {
  await expect(renderedComponent).toBeVisible();
  await expect(componentPreview).toHaveScreenshot(`${componentName}-default.png`);
}

export async function testChildrenProp(componentName: string, componentPreview:any, testingComponent: any, page: any) {
  const jsxContent = 'return (<div>Click e</div>)';

  const childrenInput = page.getByTestId('prop-control-children');
  const functionPropStatus = childrenInput.getByTestId('function-prop-status');
  await childrenInput.scrollIntoViewIfNeeded();
  await childrenInput.locator('.monaco-editor').click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.type(jsxContent);

  await expect(functionPropStatus).toHaveText(VALID_FUNCTION_TEST, { timeout: 10000 });
  
  // Wait for component to stabilize with the new JSX content
  await waitForComponentStability(page, 'children', jsxContent);
  
  await expect(testingComponent).toBeVisible();
  await expect(componentPreview).toHaveScreenshot(`${componentName}-children-success-test.png`);

  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');

  await expect(functionPropStatus).toHaveText(INVALID_FUNCTION_TEST, { timeout: 10000 });
};

export async function testVariantProp(componentName: string, componentPreview: any, page: any, variantValue: string = 'secondary') {
  await selectOption(page, 'variant', variantValue);
  await expect(componentPreview).toHaveScreenshot(`${componentName}-${variantValue}.png`);
}

export async function testSizeProp(componentName: string, componentPreview: any, page: any, sizeValue: string = 'sm', screenshotSuffix: string = 'small') {
  await selectOption(page, 'size', sizeValue);
  await expect(componentPreview).toHaveScreenshot(`${componentName}-${screenshotSuffix}.png`);
}

export async function testOnClickProp(componentName: string, clickableComponent: any, page: any) {
  const consoleMessages: string[] = [];
  const allConsoleMessages: string[] = [];

  const message = `${componentName} was clicked!`;

  page.on('console', (msg: any) => {
    const text = msg.text();
    allConsoleMessages.push(text);
        
    // Capture our specific message
    if (text === message) {
      consoleMessages.push(text);
    }
  });
  
  await setFunctionProp(page, 'onClick', `console.log("${message}")`);

  // Additional stability wait for function prop interaction with target element
  await waitForComponentStability(page, 'onClick', `console.log("${message}")`, 3000, clickableComponent);

  // Click the button in the preview
  await expect(clickableComponent).toBeVisible();
  
  // Add debugging to ensure the button is clickable
  const isEnabled = await clickableComponent.isEnabled();
  console.log('Button enabled status:', isEnabled);
  
  // Try to ensure the button is in the viewport and clickable
  await clickableComponent.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200); // Short wait for any animations
  
  // Force click if needed
  await clickableComponent.click({ force: true });
  
  // Try triggering the event manually as a backup
  await clickableComponent.dispatchEvent('click');

  // Wait longer for console message to be processed
  await page.waitForTimeout(1000);
  
  // Verify that the console message was logged
  await expect.poll(() => {
    console.log('Console messages captured:', consoleMessages);
    console.log('All console messages:', allConsoleMessages.slice(-10)); // Show last 10 for debugging
    return consoleMessages.length > 0;
  }, {
    message: 'The onClick handler did not fire the expected console message',
    timeout: 3000,
    intervals: [500],
  }).toBe(true);
}

export async function testDisabledProp(componentName: string, componentPreview: any, page: any) {
  await toggleCheckbox(page, 'disabled');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-disabled.png`);
}

export async function testClassNameProp(componentName: string, componentPreview: any, page: any) {
  await typeInInput(page, 'className', 'bg-red-900 text-lg');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-custom-class.png`);
}

export async function testPaddingProp(componentName: string, componentPreview: any, page: any) {
  await selectOption(page, 'padding', 'lg');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-padding-lg.png`);
}

export async function testShadowProp(componentName: string, componentPreview: any, page: any) {
  await selectOption(page, 'shadow', 'lg');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-shadow-lg.png`);
}

export async function testBorderProp(componentName: string, componentPreview: any, page: any) {
  await toggleCheckbox(page, 'border');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-no-border.png`, { threshold: 0.1 });
}

export async function testRoundedProp(componentName: string, componentPreview: any, page: any) {
  await selectOption(page, 'rounded', 'lg');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-rounded-lg.png`);
}

export async function testHeaderProp(componentName: string, componentPreview: any, page: any) {
  await setFunctionProp(page, 'header', 'return (<div>Header</div>)');
  // Additional stability wait for JSX rendering
  await waitForComponentStability(page);
  await expect(componentPreview).toHaveScreenshot(`${componentName}-header.png`);
}

export async function testFooterProp(componentName: string, componentPreview: any, page: any) {
  await setFunctionProp(page, 'footer', 'return (<div>Footer</div>)');
  // Additional stability wait for JSX rendering
  await waitForComponentStability(page);
  await expect(componentPreview).toHaveScreenshot(`${componentName}-footer.png`);
}

export async function testTypeProp(componentName: string, componentPreview: any, page: any) {
  await selectOption(page, 'type', 'text');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-text.png`);
}

export async function testPlaceholderProp(componentName: string, componentPreview: any, page: any) {
  await typeInInput(page, 'placeholder', 'Type your age');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-placeholder.png`);
}

export async function testValueProp(componentName: string, componentPreview: any, page: any) {
  await typeInInput(page, 'value', '18');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-value.png`);
}

export async function testDefaultValueProp(componentName: string, componentPreview: any, page: any) {
  await typeInInput(page, 'defaultValue', '18');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-default-value.png`);
}

export async function testOnChangeProp(componentName: string, renderedComponent: any, page: any) {
  const consoleMessages: string[] = [];
  const allConsoleMessages: string[] = [];

  page.on('console', (msg: any) => {
    const text = msg.text();
    allConsoleMessages.push(text);
    
    // Capture our specific message
    if (text === `${componentName} was changed!`) {
      consoleMessages.push(text);
    }
  });
  
  await setFunctionProp(page, 'onChange', `console.log("${componentName} was changed!")`);
  
  // Wait for component to stabilize before interaction
  await waitForComponentStability(page, 'onChange', `console.log("${componentName} was changed!")`, 3000, renderedComponent);

  // For input components, trigger onChange by typing text
  await expect(renderedComponent).toBeVisible();
  const inputElement = renderedComponent.locator('input');
  await inputElement.click();
  await inputElement.fill('test input');

  // Wait a bit for console message to be processed
  await page.waitForTimeout(500);
  
  // Verify that the console message was logged
  await expect.poll(() => {
    console.log('Console messages captured:', consoleMessages);
    console.log('All console messages:', allConsoleMessages.slice(-10)); // Show last 10 for debugging
    return consoleMessages.length > 0;
  }, {
    message: 'The onChange handler did not fire the expected console message',
    timeout: 3000,
    intervals: [500],
  }).toBe(true);
}

export async function testOnFocusProp(componentName: string, componentPreview: any, renderedComponent: any, page: any) {
  const consoleMessages: string[] = [];
  const allConsoleMessages: string[] = [];
  
  page.on('console', (msg: any) => {
    const text = msg.text();
    allConsoleMessages.push(text);
    
    // Capture our specific message
    if (text === `${componentName} was focused!`) {
      consoleMessages.push(text);
    }
  });
  
  await setFunctionProp(page, 'onFocus', `console.log("${componentName} was focused!")`);
  
  // Wait for component to stabilize before interaction
  await waitForComponentStability(page, 'onFocus', `console.log("${componentName} was focused!")`, 3000, renderedComponent);
  
  // Focus the component - try focusing the actual input element if it exists
  await expect(renderedComponent).toBeVisible();
  
  // Try to focus the input element first, fall back to the container
  const inputElement = renderedComponent.locator('input');
  const inputExists = await inputElement.count() > 0;
  
  if (inputExists) {
    await inputElement.focus();
  } else {
    await renderedComponent.focus();
  }
  
  await page.waitForTimeout(500);
  
  await expect.poll(() => {
    console.log('Console messages captured:', consoleMessages);
    console.log('All console messages:', allConsoleMessages.slice(-10)); // Show last 10 for debugging
    return consoleMessages.length > 0;
  }, {
    message: 'The onFocus handler did not fire the expected console message',
    timeout: 3000,
    intervals: [500],
  }).toBe(true);
}

export async function testOnBlurProp(componentName: string, componentPreview: any, renderedComponent: any, page: any) {
  const consoleMessages: string[] = [];
  const allConsoleMessages: string[] = [];
  
  page.on('console', (msg: any) => {
    const text = msg.text();
    allConsoleMessages.push(text);
    
    // Capture our specific message
    if (text === `${componentName} was blurred!`) {
      consoleMessages.push(text);
    }
  });
  
  await setFunctionProp(page, 'onBlur', `console.log("${componentName} was blurred!")`);
  
  // Wait for component to stabilize before interaction
  await waitForComponentStability(page, 'onBlur', `console.log("${componentName} was blurred!")`, 3000, renderedComponent);
  
  // Focus then blur the component - try focusing the actual input element if it exists
  await expect(renderedComponent).toBeVisible();
  
  // Try to focus the input element first, fall back to the container
  const inputElement = renderedComponent.locator('input');
  const inputExists = await inputElement.count() > 0;
  
  if (inputExists) {
    await inputElement.focus();
    await inputElement.blur();
  } else {
    await renderedComponent.focus();
    await renderedComponent.blur();
  }
  
  await page.waitForTimeout(500);
  
  await expect.poll(() => {
    console.log('Console messages captured:', consoleMessages);
    console.log('All console messages:', allConsoleMessages.slice(-10)); // Show last 10 for debugging
    return consoleMessages.length > 0;
  }, {
    message: 'The onBlur handler did not fire the expected console message',
    timeout: 3000,
    intervals: [500],
  }).toBe(true);
}

export async function testRequiredProp(componentName: string, componentPreview: any, renderedComponent: any, page: any) {
  await toggleCheckbox(page, 'required');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-required.png`);
}

export async function testVariantClassProp(componentName: string, componentPreview: any, renderedComponent: any, page: any, variantValue: string = 'outline', screenshotSuffix?: string) {
  await selectOption(page, 'variant', variantValue);
  const suffix = screenshotSuffix || `variant-${variantValue}`;
  await expect(componentPreview).toHaveScreenshot(`${componentName}-${suffix}.png`);
}

export async function testLabelProp(componentName: string, componentPreview: any, renderedComponent: any, page: any) {
  await typeInInput(page, 'label', 'Test Label');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-label.png`);
}

export async function testHelperTextProp(componentName: string, componentPreview: any, renderedComponent: any, page: any) {
  await typeInInput(page, 'helperText', 'This is helper text');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-helper-text.png`);
}

export async function testErrorProp(componentName: string, componentPreview: any, renderedComponent: any, page: any) {
  await typeInInput(page, 'errorMessage', 'This is an error message');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-error.png`);
}

export async function testPressedProp(componentName: string, componentPreview: any, page: any) {
  await toggleCheckbox(page, 'pressed');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-pressed.png`);
}

export async function testAriaLabelProp(componentName: string, componentPreview: any, page: any) {
  await typeInInput(page, 'aria-label', 'Toggle bold text');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-aria-label.png`);
}

export async function testOnPressedChangeProp(componentName: string, renderedComponent: any, page: any) {
  const consoleMessages: string[] = [];
  const allConsoleMessages: string[] = [];
  
  page.on('console', (msg: any) => {
    const text = msg.text();
    allConsoleMessages.push(text);
    
    // Capture our specific message
    if (text === `${componentName} was pressed!`) {
      consoleMessages.push(text);
    }
  });
  
  await setFunctionProp(page, 'onPressedChange', `console.log("${componentName} was pressed!")`);
  
  // Wait for component to stabilize before interaction
  await waitForComponentStability(page, 'onPressedChange', `console.log("${componentName} was pressed!")`, 3000, renderedComponent);
  
  // Click the toggle component
  await expect(renderedComponent).toBeVisible();
  await renderedComponent.click();
  
  await page.waitForTimeout(500);
  
  await expect.poll(() => {
    console.log('Console messages captured:', consoleMessages);
    console.log('All console messages:', allConsoleMessages.slice(-10)); // Show last 10 for debugging
    return consoleMessages.length > 0;
  }, {
    message: 'The onPressedChange handler did not fire the expected console message',
    timeout: 3000,
    intervals: [500],
  }).toBe(true);
}

export async function testRowsProp(componentName: string, componentPreview: any, page: any) {
  await typeInNumberInput(page, 'rows', 6);
  await expect(componentPreview).toHaveScreenshot(`${componentName}-rows-6.png`);
}

export async function testCheckedProp(componentName: string, componentPreview: any, page: any) {
  await toggleCheckbox(page, 'checked');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-checked.png`);
}

export async function testIdProp(componentName: string, componentPreview: any, page: any) {
  await typeInInput(page, 'id', 'test-component');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-with-id.png`);
}

export async function testOnCheckedChangeProp(componentName: string, renderedComponent: any, page: any) {
  const consoleMessages: string[] = [];
  const allConsoleMessages: string[] = [];
  
  page.on('console', (msg: any) => {
    const text = msg.text();
    allConsoleMessages.push(text);
    
    // Capture our specific message
    if (text === `${componentName} was checked!`) {
      consoleMessages.push(text);
    }
  });
  
  await setFunctionProp(page, 'onCheckedChange', `console.log("${componentName} was checked!")`);
  
  // Wait for component to stabilize before interaction
  await waitForComponentStability(page, 'onCheckedChange', `console.log("${componentName} was checked!")`, 3000, renderedComponent);
  
  // Click the switch component
  await expect(renderedComponent).toBeVisible();
  await renderedComponent.click();
  
  await page.waitForTimeout(500);
  
  await expect.poll(() => {
    console.log('Console messages captured:', consoleMessages);
    console.log('All console messages:', allConsoleMessages.slice(-10)); // Show last 10 for debugging
    return consoleMessages.length > 0;
  }, {
    message: 'The onCheckedChange handler did not fire the expected console message',
    timeout: 3000,
    intervals: [500],
  }).toBe(true);
}

export async function testMessageProp(componentName: string, componentPreview: any, page: any) {
  await typeInInput(page, 'message', 'Custom toast message');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-custom-message.png`);
}

export async function testDescriptionProp(componentName: string, componentPreview: any, page: any) {
  await typeInInput(page, 'description', 'This is a description');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-description.png`);
}

export async function testTableLabelProp(componentName: string, componentPreview: any, page: any) {
  await typeInInput(page, 'tableLabel', 'Employees');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-table-label.png`);
}

export async function testIdentifierProp(componentName: string, componentPreview: any, page: any) {
  await typeInInput(page, 'identifier', 'email');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-identifier.png`);
}