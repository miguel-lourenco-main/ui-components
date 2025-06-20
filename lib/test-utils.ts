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
  await input.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.type(text);
};

export const typeInNumberInput = async (page: any, propName: string, value: number | string) => {
  const input = getInputControl(page, propName);
  await expect(input).toBeEnabled();
  await input.clear();
  await input.fill(value.toString());
};

export const toggleCheckbox = async (page: any, propName: string) => {
  const checkbox = getInputControl(page, propName);
  await expect(checkbox).toBeEnabled();
  await checkbox.scrollIntoViewIfNeeded();
  await checkbox.click();
};

export const setFunctionProp = async (page: any, propName: string, functionCode: string) => {
  const editor = getMonacoEditor(page, propName);
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.type(functionCode);
  
  const status = getFunctionPropStatus(page, propName);
  await expect(status).toHaveText(VALID_FUNCTION_TEST, { timeout: 10000 });
  await page.waitForTimeout(1000); // Wait for function to be set up
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
  // Select the Button component from the list
  return async (page: any) => {
    page.getByRole('button', { name: new RegExp(`^${componentName.charAt(0).toUpperCase() + componentName.slice(1)} v`) }).click();

    // Wait for examples to be visible and get their count
    const examples = page.getByTestId('examples-panel').getByRole('button', { name: /Currently selected|^(?!.*Currently selected).*$/ });
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

  const childrenInput = page.getByTestId('prop-control-children');
  const functionPropStatus = childrenInput.getByTestId('function-prop-status');
  await childrenInput.locator('.monaco-editor').click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.type('return (<div>Click e</div>)');

  await expect(functionPropStatus).toHaveText(VALID_FUNCTION_TEST, { timeout: 10000 });
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

  const onClickEditor = page.getByTestId('prop-control-onClick');

  // Set up console listener EARLY and capture ALL console messages for debugging
  
  const consoleMessages: string[] = [];
  const allConsoleMessages: string[] = [];

  page.on('console', (msg: any) => {
    const text = msg.text();
    allConsoleMessages.push(text);
    
    // Capture our specific message
    if (text === `${componentName} was clicked!`) {
      consoleMessages.push(text);
    }
  });
  
  await onClickEditor.locator('.monaco-editor').click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.type(`console.log("${componentName} was clicked!")`);
  
  // Wait for the app to validate the new function
  const status = onClickEditor.getByTestId('function-prop-status');
  await expect(status).toHaveText(VALID_FUNCTION_TEST, { timeout: 10000 });

  // Wait a bit for the function to be properly set up
  await page.waitForTimeout(1000);

  // Click the button in the preview
  await expect(clickableComponent).toBeVisible();
  await clickableComponent.click();

  // Wait a bit for console message to be processed
  await page.waitForTimeout(500);
  
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
  await expect(componentPreview).toHaveScreenshot(`${componentName}-header.png`);
}

export async function testFooterProp(componentName: string, componentPreview: any, page: any) {
  await setFunctionProp(page, 'footer', 'return (<div>Footer</div>)');
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

  const onChangeInput = page.getByTestId('prop-control-onChange');

  const consoleMessages: string[] = [];
  const allConsoleMessages: string[] = [];

  page.on('console', (msg: any) => {
    const text = msg.text();
    allConsoleMessages.push(text);
    
    // Capture our specific message
    if (text === `${componentName} was clicked!`) {
      consoleMessages.push(text);
    }
  });
  
  await onChangeInput.locator('.monaco-editor').click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.type(`console.log("${componentName} was clicked!")`);
  
  // Wait for the app to validate the new function
  const status = onChangeInput.getByTestId('function-prop-status');
  await expect(status).toHaveText(VALID_FUNCTION_TEST, { timeout: 10000 });

  // Wait a bit for the function to be properly set up
  await page.waitForTimeout(1000);

  // Click the button in the preview
  await expect(renderedComponent).toBeVisible();
  await renderedComponent.click();

  // Wait a bit for console message to be processed
  await page.waitForTimeout(500);
  
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

export async function testOnFocusProp(componentName: string, componentPreview: any, renderedComponent: any, page: any) {
  const consoleMessages: string[] = [];
  
  page.on('console', (msg: any) => {
    const text = msg.text();
    if (text === `${componentName} was focused!`) {
      consoleMessages.push(text);
    }
  });
  
  await setFunctionProp(page, 'onFocus', `console.log("${componentName} was focused!")`);
  
  // Focus the component
  await expect(renderedComponent).toBeVisible();
  await renderedComponent.focus();
  
  await page.waitForTimeout(500);
  
  await expect.poll(() => {
    return consoleMessages.length > 0;
  }, {
    message: 'The onFocus handler did not fire the expected console message',
    timeout: 3000,
    intervals: [500],
  }).toBe(true);
}

export async function testOnBlurProp(componentName: string, componentPreview: any, renderedComponent: any, page: any) {
  const consoleMessages: string[] = [];
  
  page.on('console', (msg: any) => {
    const text = msg.text();
    if (text === `${componentName} was blurred!`) {
      consoleMessages.push(text);
    }
  });
  
  await setFunctionProp(page, 'onBlur', `console.log("${componentName} was blurred!")`);
  
  // Focus then blur the component
  await expect(renderedComponent).toBeVisible();
  await renderedComponent.focus();
  await renderedComponent.blur();
  
  await page.waitForTimeout(500);
  
  await expect.poll(() => {
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

export async function testVariantClassProp(componentName: string, componentPreview: any, renderedComponent: any, page: any) {
  await selectOption(page, 'variant', 'outline');
  await expect(componentPreview).toHaveScreenshot(`${componentName}-variant-outline.png`);
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
  
  page.on('console', (msg: any) => {
    const text = msg.text();
    if (text === `${componentName} was pressed!`) {
      consoleMessages.push(text);
    }
  });
  
  await setFunctionProp(page, 'onPressedChange', `console.log("${componentName} was pressed!")`);
  
  // Click the toggle component
  await expect(renderedComponent).toBeVisible();
  await renderedComponent.click();
  
  await page.waitForTimeout(500);
  
  await expect.poll(() => {
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
  
  page.on('console', (msg: any) => {
    const text = msg.text();
    if (text === `${componentName} was checked!`) {
      consoleMessages.push(text);
    }
  });
  
  await setFunctionProp(page, 'onCheckedChange', `console.log("${componentName} was checked!")`);
  
  // Click the switch component
  await expect(renderedComponent).toBeVisible();
  await renderedComponent.click();
  
  await page.waitForTimeout(500);
  
  await expect.poll(() => {
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