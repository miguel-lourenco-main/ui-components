import { test, expect } from '@playwright/test';
import { 
  setupComponentTestConsts, 
  doesComponentRender, 
  testVariantProp, 
  testSizeProp, 
  testPressedProp, 
  testDisabledProp, 
  testClassNameProp, 
  testChildrenProp,
  testOnPressedChangeProp
} from '@/lib/test-utils';

const componentName = 'toggle';

test.describe('Component: Toggle', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Components', level: 2 })).toBeVisible();
    // Select the Toggle component before each test
    await page.getByRole('button', { name: /^Toggle v/ }).click();
  });

  const setupToggleTestConsts = setupComponentTestConsts(componentName);

  test('should render the default toggle', async ({ page }) => {
    const { componentPreview, renderedComponent } = await setupToggleTestConsts(page);
    await doesComponentRender(componentName, componentPreview, renderedComponent);
  });

  test.describe('Test toggle props', () => {

    test('is variant prop working', async ({ page }) => {
      const { componentPreview } = await setupToggleTestConsts(page);
      await testVariantProp(componentName, componentPreview, page, 'outline');
    });

    test('is size prop working', async ({ page }) => {
      const { componentPreview } = await setupToggleTestConsts(page);
      await testSizeProp(componentName, componentPreview, page);
    });

    test('is pressed prop working', async ({ page }) => {
      const { componentPreview } = await setupToggleTestConsts(page);
      await testPressedProp(componentName, componentPreview, page);
    });

    test('is disabled prop working', async ({ page }) => {
      const { componentPreview } = await setupToggleTestConsts(page);
      await testDisabledProp(componentName, componentPreview, page);
    });

    /** 
      test('is aria-label prop working', async ({ page }) => {
        const { componentPreview } = await setupToggleTestConsts(page);
        await testAriaLabelProp(componentName, componentPreview, page);
      });
     */

    test('is className prop working', async ({ page }) => {
      const { componentPreview } = await setupToggleTestConsts(page);
      await testClassNameProp(componentName, componentPreview, page);
    });

    test('is children prop working', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupToggleTestConsts(page);
      await testChildrenProp(componentName, componentPreview, renderedComponent, page);
    });

    test('is onPressedChange prop working', async ({ page }) => {
      const { renderedComponent } = await setupToggleTestConsts(page);
      await testOnPressedChangeProp(componentName, renderedComponent, page);
    });

    test('should handle interactive toggle pressing', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupToggleTestConsts(page);

      // Test that clicking the toggle updates the state
      await expect(renderedComponent).toBeVisible();
      await renderedComponent.click();
      
      // Wait a moment for the state to update
      await page.waitForTimeout(500);
      
      // The toggle should now appear pressed
      await expect(componentPreview).toHaveScreenshot(`${componentName}-after-click.png`);
    });
  });
}); 