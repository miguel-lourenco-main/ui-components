import { test, expect } from '@playwright/test';
import { 
  setupComponentTestConsts, 
  doesComponentRender, 
  testLabelProp, 
  testCheckedProp, 
  testDisabledProp, 
  testIdProp,
  testClassNameProp,
  testOnCheckedChangeProp
} from '@/lib/test-utils';

const componentName = 'switch';

test.describe('Component: Switch', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Playground', level: 1 })).toBeVisible();
    // Select the Switch component before each test
    await page.getByRole('button', { name: /^Switch v/ }).click();
  });

  const setupSwitchTestConsts = setupComponentTestConsts(componentName);

  test('should render the default switch', async ({ page }) => {
    const { componentPreview, renderedComponent } = await setupSwitchTestConsts(page);
    await doesComponentRender(componentName, componentPreview, renderedComponent);
  });

  test.describe('Test switch props', () => {

    test('is label prop working', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupSwitchTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testLabelProp(componentName, componentPreview, renderedComponent, page);
    });

    test('is checked prop working', async ({ page }) => {
      const { componentPreview } = await setupSwitchTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testCheckedProp(componentName, componentPreview, page);
    });

    test('is disabled prop working', async ({ page }) => {
      const { componentPreview } = await setupSwitchTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testDisabledProp(componentName, componentPreview, page);
    });

    test('is id prop working', async ({ page }) => {
      const { componentPreview } = await setupSwitchTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testIdProp(componentName, componentPreview, page);
    });

    test('is className prop working', async ({ page }) => {
      const { componentPreview } = await setupSwitchTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testClassNameProp(componentName, componentPreview, page);
    });

    test('is onCheckedChange prop working', async ({ page }) => {
      const { renderedComponent } = await setupSwitchTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testOnCheckedChangeProp(componentName, renderedComponent, page);
    });

    test('should handle interactive switch toggling', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupSwitchTestConsts(page);

      // Test that clicking the switch updates the state
      await expect(renderedComponent).toBeVisible();
      await renderedComponent.click();
      
      // Wait a moment for the state to update
      await page.waitForTimeout(500);
      
      // The switch should now appear checked
      await expect(componentPreview).toHaveScreenshot(`${componentName}-after-click.png`);
    });
  });
}); 