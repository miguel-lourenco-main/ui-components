import { test, expect } from '@playwright/test';
import { 
  setupComponentTestConsts, 
  doesComponentRender, 
  testMessageProp, 
  testDescriptionProp, 
  selectOption
} from '@/lib/test-utils';

const componentName = 'sonner';

test.describe('Component: Sonner', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Playground', level: 1 })).toBeVisible();
    // Select the Sonner component before each test
    await page.getByRole('button', { name: /^Sonner v/ }).click();
  });

  const setupSonnerTestConsts = setupComponentTestConsts(componentName);

  test('should render the default sonner', async ({ page }) => {
    const { componentPreview, renderedComponent } = await setupSonnerTestConsts(page);
    await doesComponentRender(componentName, componentPreview, renderedComponent);
  });

  test.describe('Test sonner props', () => {

    test('is message prop working', async ({ page }) => {
      const { componentPreview } = await setupSonnerTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testMessageProp(componentName, componentPreview, page);
    });

    test('is description prop working', async ({ page }) => {
      const { componentPreview } = await setupSonnerTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testDescriptionProp(componentName, componentPreview, page);
    });

    test('is variant prop working with success', async ({ page }) => {
      const { componentPreview } = await setupSonnerTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await selectOption(page, 'variant', 'success');
      await expect(componentPreview).toHaveScreenshot(`${componentName}-success-variant.png`);
    });

    test('is variant prop working with error', async ({ page }) => {
      const { componentPreview } = await setupSonnerTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await selectOption(page, 'variant', 'error');
      await expect(componentPreview).toHaveScreenshot(`${componentName}-error-variant.png`);
    });

    test('is variant prop working with warning', async ({ page }) => {
      const { componentPreview } = await setupSonnerTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await selectOption(page, 'variant', 'warning');
      await expect(componentPreview).toHaveScreenshot(`${componentName}-warning-variant.png`);
    });

    test('is variant prop working with info', async ({ page }) => {
      const { componentPreview } = await setupSonnerTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await selectOption(page, 'variant', 'info');
      await expect(componentPreview).toHaveScreenshot(`${componentName}-info-variant.png`);
    });

    test('should handle toast button interaction', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupSonnerTestConsts(page);

      // Test that clicking the show toast button works
      await expect(renderedComponent).toBeVisible();
      await renderedComponent.click();
      
      // Wait a moment for the toast to appear
      await page.waitForTimeout(1000);
      
      // The toast should be visible on the page
      await expect(componentPreview).toHaveScreenshot(`${componentName}-after-click.png`);
    });
  });
}); 