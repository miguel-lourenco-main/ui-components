import { test, expect } from '@playwright/test';
import { setupComponentTestConsts, doesComponentRender, typeInNumberInput, testClassNameProp, testDisabledProp, testValueProp, testDefaultValueProp } from '@/lib/test-utils';

const componentName = 'slider';

test.describe('Component: Slider', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Components', level: 2 })).toBeVisible();
    // Select the Slider component before each test
    await page.getByRole('button', { name: /^Slider v/ }).click();
  });

  const setupSliderTestConsts = setupComponentTestConsts(componentName);

  test('should render the default slider', async ({ page }) => {
    const { componentPreview, renderedComponent } = await setupSliderTestConsts(page);
    await doesComponentRender(componentName, componentPreview, renderedComponent);
  });

  test.describe('Test slider props', () => {

    test('is min prop working', async ({ page }) => {
      const { componentPreview } = await setupSliderTestConsts(page);
      await typeInNumberInput(page, 'min', 10);
      await expect(componentPreview).toHaveScreenshot(`${componentName}-min-10.png`);
    });

    test('is max prop working', async ({ page }) => {
      const { componentPreview } = await setupSliderTestConsts(page);
      await typeInNumberInput(page, 'max', 200);
      await expect(componentPreview).toHaveScreenshot(`${componentName}-max-200.png`);
    });

    test('is defaultValue prop working', async ({ page }) => {
      const { componentPreview } = await setupSliderTestConsts(page);
      await testDefaultValueProp(componentName, componentPreview, page);
    });

    test('is value prop working', async ({ page }) => {
      const { componentPreview } = await setupSliderTestConsts(page);
      await testValueProp(componentName, componentPreview, page);
    });

    test('is step prop working', async ({ page }) => {
      const { componentPreview } = await setupSliderTestConsts(page);
      await typeInNumberInput(page, 'step', 5);
      await expect(componentPreview).toHaveScreenshot(`${componentName}-step-5.png`);
    });

    test('is disabled prop working', async ({ page }) => {
      const { componentPreview } = await setupSliderTestConsts(page);
      await testDisabledProp(componentName, componentPreview, page);
    });

    test('is className prop working', async ({ page }) => {
      const { componentPreview } = await setupSliderTestConsts(page);
      await testClassNameProp(componentName, componentPreview, page);
    });

    test('should handle interactive slider changes', async ({ page }) => {
      const { componentPreview } = await setupSliderTestConsts(page);

      // Find the slider element
      const slider = componentPreview.getByRole('slider');
      await expect(slider).toBeVisible();

      // Test that moving the slider updates the value
      await slider.click();
      
      // Wait a moment for the state to update
      await page.waitForTimeout(500);
      
      // The value should be reflected in the component
      await expect(componentPreview).toHaveScreenshot(`${componentName}-after-interaction.png`);
    });
  });
}); 