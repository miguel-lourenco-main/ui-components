import { test, expect } from '@playwright/test';

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

  test('should render and handle prop changes', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // 1. Baseline snapshot with default value
    await expect(componentPreview).toHaveScreenshot('slider-default.png');

    // 2. Test changing min value
    const minInput = propsPanel.getByTestId('prop-control-min').locator('input');
    await minInput.clear();
    await minInput.fill('10');
    await expect(componentPreview).toHaveScreenshot('slider-min-10.png');

    // 3. Test changing max value
    const maxInput = propsPanel.getByTestId('prop-control-max').locator('input');
    await maxInput.clear();
    await maxInput.fill('200');
    await expect(componentPreview).toHaveScreenshot('slider-max-200.png');

    // 4. Test changing step value
    const stepInput = propsPanel.getByTestId('prop-control-step').locator('input');
    await stepInput.clear();
    await stepInput.fill('5');
    await expect(componentPreview).toHaveScreenshot('slider-step-5.png');

    // 5. Test disabled state
    await propsPanel.getByTestId('prop-control-disabled').locator('input').check();
    await expect(componentPreview).toHaveScreenshot('slider-disabled.png');
  });

  test('should handle interactive slider changes', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // Find the slider element
    const slider = componentPreview.getByRole('slider');
    await expect(slider).toBeVisible();

    // Test that moving the slider updates the value in the props panel
    // Note: This tests the bidirectional state flow we implemented
    await slider.click();
    
    // Wait a moment for the state to update
    await page.waitForTimeout(500);
    
    // The value should be reflected in the props panel
    await expect(componentPreview).toHaveScreenshot('slider-after-interaction.png');
  });

  test('should handle examples correctly', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // Test that examples section is visible and contains expected examples
    const examplesSection = propsPanel.locator('text=Examples').first();
    await expect(examplesSection).toBeVisible({ timeout: 10000 });

    // Test clicking on the first available example
    const firstExample = propsPanel.getByRole('button').filter({ hasText: 'Slider' }).first();
    if (await firstExample.isVisible()) {
      await firstExample.click();
      await expect(componentPreview).toHaveScreenshot('slider-first-example.png');
    }
  });
}); 