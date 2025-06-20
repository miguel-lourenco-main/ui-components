import { test, expect } from '@playwright/test';
import { doesComponentRender, setupComponentTestConsts, testBorderProp, testChildrenProp, testClassNameProp, testFooterProp, testHeaderProp, testPaddingProp, testRoundedProp, testShadowProp } from '@/lib/test-utils';


const componentName = 'card';

test.describe('Component: Card', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Components', level: 2 })).toBeVisible();
    // Select the Card component before each test
    await page.getByRole('button', { name: /^Card v/ }).click();
  });

  const setupCardTestConsts = setupComponentTestConsts(componentName);

  test('should render the default card', async ({ page }) => {
    // Use helper function to set up component and get locators
    const { componentPreview, renderedComponent } = await setupCardTestConsts(page);

    await doesComponentRender(componentName, componentPreview, renderedComponent);
  });

  test.describe('Test card props', () => {

    test('is children prop working', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupCardTestConsts(page);
  
      await testChildrenProp(componentName, componentPreview, renderedComponent, page);
    });
  
    test('is className prop working', async ({ page }) => {
      const { componentPreview } = await setupCardTestConsts(page);
  
      await testClassNameProp(componentName, componentPreview, page);
    });
  
    test('is padding prop working', async ({ page }) => {
      const { componentPreview } = await setupCardTestConsts(page);
  
      await testPaddingProp(componentName, componentPreview, page);
    });
  
    test('is shadow prop working', async ({ page }) => {
      const { componentPreview } = await setupCardTestConsts(page);
  
      await testShadowProp(componentName, componentPreview, page);
    });
  
    test('is border prop working', async ({ page }) => {
      const { componentPreview } = await setupCardTestConsts(page);
  
      await testBorderProp(componentName, componentPreview, page);
    });
  
    test('is rounded prop working', async ({ page }) => {
      const { componentPreview } = await setupCardTestConsts(page);
  
      await testRoundedProp(componentName, componentPreview, page);
    });
  
    test('is header prop working', async ({ page }) => {
      const { componentPreview } = await setupCardTestConsts(page);
  
      await testHeaderProp(componentName, componentPreview, page);
    });
  
    test('is footer prop working', async ({ page }) => {
      const { componentPreview } = await setupCardTestConsts(page);
  
      await testFooterProp(componentName, componentPreview, page);
    });
  });
}); 