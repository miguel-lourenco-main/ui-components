import { test, expect } from '@playwright/test';
import { setupComponentTestConsts, doesComponentRender, typeInInput, testClassNameProp } from '@/lib/test-utils';

const componentName = 'progress';

test.describe('Component: Progress', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Playground', level: 1 })).toBeVisible();
    // Select the Progress component before each test
    await page.getByRole('button', { name: /^Progress v/ }).click();
  });

  const setupProgressTestConsts = setupComponentTestConsts(componentName);

  test('should render the default progress', async ({ page }) => {
    const { componentPreview, renderedComponent } = await setupProgressTestConsts(page);
    await doesComponentRender(componentName, componentPreview, renderedComponent);
  });

  test.describe('Test progress props', () => {

    test('is value prop working', async ({ page }) => {
      const { componentPreview } = await setupProgressTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      // Test different progress values
      await typeInInput(page, 'value', '25');
      await expect(componentPreview).toHaveScreenshot(`${componentName}-25-percent.png`);

      await typeInInput(page, 'value', '75');
      await expect(componentPreview).toHaveScreenshot(`${componentName}-75-percent.png`);

      await typeInInput(page, 'value', '100');  
      await expect(componentPreview).toHaveScreenshot(`${componentName}-complete.png`);

      await typeInInput(page, 'value', '0');
      await expect(componentPreview).toHaveScreenshot(`${componentName}-empty.png`);
    });

    test('is className prop working', async ({ page }) => {
      const { componentPreview } = await setupProgressTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testClassNameProp(componentName, componentPreview, page);
    });
  });
}); 