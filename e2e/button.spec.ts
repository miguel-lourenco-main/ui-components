import { INVALID_FUNCTION_TEST, testChildrenProp, VALID_FUNCTION_TEST } from '@/lib/test-utils';
import { test, expect } from '@playwright/test';

test.describe('Component: Button', () => {
  // Run tests in serial to prevent conflicts from the shared dev server.
  test.describe.configure({ mode: 'serial' });

  // APPROACH 1: Helper function (Current implementation)
  // This is the most flexible approach - returns locators after setup
  const setupButtonComponent = async (page: any) => {
    // Select the Button component from the list
    await page.getByRole('button', { name: /^Button v/ }).click();

    // Wait for examples to be visible and get their count
    const examples = page.getByTestId('examples-panel').getByRole('button', { name: /Currently selected|^(?!.*Currently selected).*$/ });
    const exampleCount = await examples.count();

    // Verify we have at least 3 examples to test with
    expect(exampleCount).toBeGreaterThanOrEqual(3);

    // Get the second and third examples (first is already selected by default)
    const secondExample = examples.nth(1);
    const thirdExample = examples.nth(2);

    // Return commonly used locators
    return {
      componentPreview: page.getByTestId('component-preview'),
      renderedButton: page.getByTestId('component-preview').getByTestId('rendered-component-button'),
      secondExample,
      thirdExample
    };
  };

  // Before each test, navigate and wait for the app to be ready.
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // **Crucial Step**: Wait for the loading indicator to disappear.
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });

    // Also wait for the main component list header to be visible, specifying the level.
    await expect(page.getByRole('heading', { name: 'Components', level: 2 })).toBeVisible();
  });

  test('should render the default button', async ({ page }) => {
    // Use helper function to set up component and get locators
    const { componentPreview, renderedButton } = await setupButtonComponent(page);

    // Wait for the component preview to be ready
    await expect(renderedButton).toBeVisible();

    // Take a baseline screenshot
    await expect(componentPreview).toHaveScreenshot('button-default.png');
  });

  test.describe('should update the button props', () => {

    test('should update the children prop', async ({ page }) => {
      // Use helper function to set up component and get locators
      const { componentPreview, renderedButton } = await setupButtonComponent(page);

      // --------- TEST children prop ---------
      await testChildrenProp(componentPreview, renderedButton, page);

    });

    test('should update the variant prop', async ({ page }) => {
      // Use helper function to set up component and get locators
      const { componentPreview } = await setupButtonComponent(page);
    
      // --------- TEST variant prop ---------

      const variantSelect = page.getByTestId('prop-control-variant').locator('select');
      await expect(variantSelect).toBeEnabled();
      
      // Scroll into view and click to ensure it's properly interactive
      await variantSelect.scrollIntoViewIfNeeded();
      await variantSelect.click();
      await variantSelect.selectOption('secondary');

      await expect(componentPreview).toHaveScreenshot('button-secondary.png');
    });

    test('should update the size prop', async ({ page }) => {
      // Use helper function to set up component and get locators
      const { componentPreview } = await setupButtonComponent(page);
      const sizeSelect = page.getByTestId('prop-control-size').locator('select');

      // --------- TEST size prop ---------
      await expect(sizeSelect).toBeEnabled();
      
      // Scroll into view and click to ensure it's properly interactive
      await sizeSelect.scrollIntoViewIfNeeded();
      await expect(sizeSelect).toBeEnabled();
      await sizeSelect.click();
      await sizeSelect.selectOption('sm');
      
      await expect(componentPreview).toHaveScreenshot('button-small.png');
    });

    test('should update the onClick prop', async ({ page }) => {
      // Use helper function to set up component and get locators
      const { renderedButton } = await setupButtonComponent(page);

      const onClickEditor = page.getByTestId('prop-control-onClick');

      // Set up console listener EARLY and capture ALL console messages for debugging
      const consoleMessages: string[] = [];
      const allConsoleMessages: string[] = [];

      page.on('console', msg => {
        const text = msg.text();
        allConsoleMessages.push(text);
        
        // Capture our specific message
        if (text === 'Button was clicked!') {
          consoleMessages.push(text);
        }
      });
      
      await onClickEditor.locator('.monaco-editor').click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Delete');
      await page.keyboard.type('console.log("Button was clicked!")');
      
      // Wait for the app to validate the new function
      const status = onClickEditor.getByTestId('function-prop-status');
      await expect(status).toHaveText(VALID_FUNCTION_TEST, { timeout: 10000 });

      // Wait a bit for the function to be properly set up
      await page.waitForTimeout(1000);

      // Click the button in the preview
      await expect(renderedButton).toBeVisible();
      await renderedButton.click();

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

    });

    test('should update the disabled prop', async ({ page }) => {
      // Use helper function to set up component and get locators
      const { componentPreview } = await setupButtonComponent(page);

      const disabledCheckbox = page.getByTestId('prop-control-disabled').locator('input');

      // --------- TEST disabled prop ---------
      await disabledCheckbox.scrollIntoViewIfNeeded();
      await expect(disabledCheckbox).toBeEnabled();
      await disabledCheckbox.click();
      await expect(componentPreview).toHaveScreenshot('button-disabled.png');
    });

    test('should update the className prop', async ({ page }) => {
      // Use helper function to set up component and get locators
      const { componentPreview } = await setupButtonComponent(page);
      const classNameInput = page.getByTestId('prop-control-className').locator('input');

      // --------- TEST className prop ---------
      await expect(classNameInput).toBeEnabled();
      await classNameInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Delete');
      await page.keyboard.type('bg-red-900 text-lg');
      await expect(componentPreview).toHaveScreenshot('button-custom-class.png');
    });
  });
}); 