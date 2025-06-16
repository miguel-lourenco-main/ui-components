import { test, expect } from '@playwright/test';

test.describe('Component: Button', () => {
  // Run tests in serial to prevent conflicts from the shared dev server.
  test.describe.configure({ mode: 'serial' });

  // Before each test, navigate and wait for the app to be ready.
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // **Crucial Step**: Wait for the loading indicator to disappear.
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });

    // Also wait for the main component list header to be visible, specifying the level.
    await expect(page.getByRole('heading', { name: 'Components', level: 2 })).toBeVisible();
  });

  test('should render and change visually when props are updated', async ({ page }) => {
    // 1. Select the Button component from the list
    const componentLink = page.getByRole('button', { name: 'Button' });
    await componentLink.click();

    // 2. Wait for the component preview to be ready and locate the rendered component
    const componentPreview = page.getByTestId('component-preview');
    const renderedButton = componentPreview.getByTestId('rendered-component-button');
    await expect(renderedButton).toBeVisible();

    // 3. Take a baseline screenshot
    await expect(componentPreview).toHaveScreenshot('button-default.png');
    
    // 4. Change props
    const variantSelect = page.getByTestId('prop-control-variant');
    await expect(variantSelect).toBeEnabled();
    await variantSelect.selectOption('secondary');

    // 5. Verify visual change
    await expect(componentPreview.getByTestId('rendered-component-button')).toBeVisible();
    await expect(componentPreview).toHaveScreenshot('button-secondary.png');
  });

  test('should handle functional props like onClick', async ({ page }) => {
    // 1. Select the Button component
    await page.getByRole('button', { name: 'Button' }).click();
    
    // 2. Set up console listener EARLY and capture ALL console messages for debugging
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

    // 3. Locate and fill the function prop editor
    const onClickEditor = page.getByTestId('prop-control-onClick');
    const monacoEditor = onClickEditor.locator('.monaco-editor').first();
    
    await monacoEditor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await page.keyboard.type('console.log("Button was clicked!")');
    
    // 4. Wait for the app to validate the new function
    const status = onClickEditor.getByTestId('function-prop-status');
    await expect(status).toHaveText(/Valid function/, { timeout: 10000 });

    // 5. Wait a bit for the function to be properly set up
    await page.waitForTimeout(1000);

    // 6. Click the button in the preview
    const componentPreview = page.getByTestId('component-preview');
    const button = componentPreview.getByTestId('rendered-component-button');
    await expect(button).toBeVisible();
    await button.click();

    // 7. Wait a bit for console message to be processed
    await page.waitForTimeout(500);

    // 8. Verify that the console message was logged
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
}); 