import { test, expect } from '@playwright/test';

test.describe('Component: Progress', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Components', level: 2 })).toBeVisible();
    // Select the Progress component before each test
    await page.getByRole('button', { name: /^Progress v/ }).click();
  });

  test('should render and handle progress value changes', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // 1. Baseline snapshot with default value
    await expect(componentPreview).toHaveScreenshot('progress-default.png');

    // 2. Test changing progress value to 25%
    const valueInput = propsPanel.getByTestId('prop-control-value').locator('input');
    await valueInput.clear();
    await valueInput.fill('25');
    await expect(componentPreview).toHaveScreenshot('progress-25-percent.png');

    // 3. Test progress at 75%
    await valueInput.clear();
    await valueInput.fill('75');
    await expect(componentPreview).toHaveScreenshot('progress-75-percent.png');

    // 4. Test completed progress at 100%
    await valueInput.clear();
    await valueInput.fill('100');
    await expect(componentPreview).toHaveScreenshot('progress-complete.png');

    // 5. Test empty progress at 0%
    await valueInput.clear();
    await valueInput.fill('0');
    await expect(componentPreview).toHaveScreenshot('progress-empty.png');
  });

  test('should handle examples correctly', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // Test clicking on different examples
    const animatedExample = propsPanel.getByText('Animated Progress');
    await animatedExample.click();
    await expect(componentPreview).toHaveScreenshot('progress-animated-example.png');

    const completeExample = propsPanel.getByText('Complete Progress');
    await completeExample.click();
    await expect(componentPreview).toHaveScreenshot('progress-complete-example.png');
  });
}); 