import { test, expect } from '@playwright/test';

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

  test('should render and handle prop changes', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // 1. Baseline snapshot with default state
    await expect(componentPreview).toHaveScreenshot('toggle-default.png');

    // 2. Test changing variant
    const variantSelect = propsPanel.getByTestId('prop-control-variant').locator('select');
    await variantSelect.selectOption('outline');
    await expect(componentPreview).toHaveScreenshot('toggle-outline.png');

    // 3. Test changing size
    const sizeSelect = propsPanel.getByTestId('prop-control-size').locator('select');
    await sizeSelect.selectOption('lg');
    await expect(componentPreview).toHaveScreenshot('toggle-large.png');

    // 4. Test pressed state
    await propsPanel.getByTestId('prop-control-pressed').locator('input').check();
    await expect(componentPreview).toHaveScreenshot('toggle-pressed.png');

    // 5. Test disabled state
    await propsPanel.getByTestId('prop-control-disabled').locator('input').check();
    await expect(componentPreview).toHaveScreenshot('toggle-disabled.png');

    // 6. Test with aria-label
    const ariaLabelInput = propsPanel.getByTestId('prop-control-aria-label').locator('input');
    await ariaLabelInput.fill('Toggle bold text');
    await expect(componentPreview).toHaveScreenshot('toggle-with-aria-label.png');
  });

  test('should handle interactive toggle pressing', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // Find the toggle button element
    const toggleButton = componentPreview.getByRole('button').first();
    await expect(toggleButton).toBeVisible();

    // Test that clicking the toggle updates the pressed state
    await toggleButton.click();
    
    // Wait a moment for the state to update
    await page.waitForTimeout(500);
    
    // The toggle should now appear pressed
    await expect(componentPreview).toHaveScreenshot('toggle-after-click.png');
  });

  test('should handle examples correctly', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // Test that examples section is visible
    const examplesSection = propsPanel.locator('text=Examples').first();
    await expect(examplesSection).toBeVisible({ timeout: 10000 });

    // Test clicking on the first available example
    const firstExample = propsPanel.getByRole('button').filter({ hasText: 'Toggle' }).first();
    if (await firstExample.isVisible()) {
      await firstExample.click();
      await expect(componentPreview).toHaveScreenshot('toggle-first-example.png');
    }
  });
}); 