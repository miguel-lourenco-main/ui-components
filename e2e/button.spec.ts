import { testChildrenProp, testClassNameProp, testDisabledProp, testOnClickProp, testSizeProp, testVariantProp } from '@/lib/test-utils';
import { test, expect } from '@playwright/test';

const componentName = 'button';

test.describe('Component: Button', () => {
  // Run tests in serial to prevent conflicts from the shared dev server.
  test.describe.configure({ mode: 'serial' });

  // APPROACH 1: Helper function (Current implementation)
  // This is the most flexible approach - returns locators after setup
  const setupButtonComponent = async (page: any) => {
    // Select the Button component from the list
    await page.getByRole('button', { name: /^Button v/ }).click();

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
    await page.goto('/playground');
    
    // **Crucial Step**: Wait for the loading indicator to disappear.
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });

    // Also wait for the main playground header to be visible, specifying the level.
    await expect(page.getByRole('heading', { name: 'Playground', level: 1 })).toBeVisible();
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

      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();

      // --------- TEST children prop ---------
      await testChildrenProp(componentName, componentPreview, renderedButton, page);

    });

    test('should update the variant prop', async ({ page }) => {
      // Use helper function to set up component and get locators
      const { componentPreview } = await setupButtonComponent(page);
    
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();

      // --------- TEST variant prop ---------

      await testVariantProp(componentName, componentPreview, page, 'secondary');
    });

    test('should update the size prop', async ({ page }) => {
      // Use helper function to set up component and get locators
      const { componentPreview } = await setupButtonComponent(page);

      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();

      // --------- TEST size prop ---------

      await testSizeProp(componentName, componentPreview, page);
    });

    test('should update the onClick prop', async ({ page }) => {
      // Use helper function to set up component and get locators
      const { renderedButton } = await setupButtonComponent(page);

      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();

      // --------- TEST onClick prop ---------
      await testOnClickProp(componentName, renderedButton, page);
    });

    test('should update the disabled prop', async ({ page }) => {
      // Use helper function to set up component and get locators
      const { componentPreview } = await setupButtonComponent(page);

      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();

      // --------- TEST disabled prop ---------
      await testDisabledProp(componentName, componentPreview, page);
    });

    test('should update the className prop', async ({ page }) => {
      // Use helper function to set up component and get locators
      const { componentPreview } = await setupButtonComponent(page);

      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();

      // --------- TEST className prop ---------
      await testClassNameProp(componentName, componentPreview, page);
    });
  });
}); 