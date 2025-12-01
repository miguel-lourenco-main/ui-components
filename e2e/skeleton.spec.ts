import { test, expect } from '@playwright/test';
import { setupComponentTestConsts, doesComponentRender, typeInInput, testClassNameProp } from '@/lib/test-utils';

const componentName = 'skeleton';

test.describe('Component: Skeleton', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Playground', level: 1 })).toBeVisible();
    // Select the Skeleton component before each test
    await page.getByRole('button', { name: /^Skeleton v/ }).click();
  });

  const setupSkeletonTestConsts = setupComponentTestConsts(componentName);

  test('should render the default skeleton', async ({ page }) => {
    const { componentPreview, renderedComponent } = await setupSkeletonTestConsts(page);
    await doesComponentRender(componentName, componentPreview, renderedComponent);
  });

  test.describe('Test skeleton props', () => {

    test('is className prop working with different skeleton shapes', async ({ page }) => {
      const { componentPreview } = await setupSkeletonTestConsts(page);

      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();

      // Test circular skeleton
      await typeInInput(page, 'className', 'h-12 w-12 rounded-full');
      await expect(componentPreview).toHaveScreenshot(`${componentName}-circular.png`);

      // Test card-style skeleton
      await typeInInput(page, 'className', 'h-[125px] w-[250px] rounded-xl');
      await expect(componentPreview).toHaveScreenshot(`${componentName}-card.png`);

      // Test text line skeleton
      await typeInInput(page, 'className', 'h-4 w-full');
      await expect(componentPreview).toHaveScreenshot(`${componentName}-text-line.png`);

      // Test small skeleton
      await typeInInput(page, 'className', 'h-8 w-[200px] rounded');
      await expect(componentPreview).toHaveScreenshot(`${componentName}-small.png`);
    });

    test('is className prop working with default test', async ({ page }) => {
      const { componentPreview } = await setupSkeletonTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testClassNameProp(componentName, componentPreview, page);
    });
  });
}); 