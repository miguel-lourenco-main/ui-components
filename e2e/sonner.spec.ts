import { test, expect } from '@playwright/test';

test.describe('Component: Sonner', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Components', level: 2 })).toBeVisible();
    // Select the Sonner component before each test
    await page.getByRole('button', { name: /^Sonner v/ }).click();
  });

  test('should render and handle prop changes', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // 1. Baseline snapshot with default state
    await expect(componentPreview).toHaveScreenshot('sonner-default.png');

    // 2. Test changing message
    const messageInput = propsPanel.getByTestId('prop-control-message').locator('input');
    await messageInput.clear();
    await messageInput.fill('Custom toast message');
    await expect(componentPreview).toHaveScreenshot('sonner-custom-message.png');

    // 3. Test adding description
    const descriptionInput = propsPanel.getByTestId('prop-control-description').locator('input');
    await descriptionInput.fill('This is a description');
    await expect(componentPreview).toHaveScreenshot('sonner-with-description.png');

    // 4. Test changing variant
    const variantSelect = propsPanel.getByTestId('prop-control-variant').locator('select');
    await variantSelect.selectOption('success');
    await expect(componentPreview).toHaveScreenshot('sonner-success-variant.png');

    // 5. Test error variant
    await variantSelect.selectOption('error');
    await expect(componentPreview).toHaveScreenshot('sonner-error-variant.png');

    // 6. Test warning variant
    await variantSelect.selectOption('warning');
    await expect(componentPreview).toHaveScreenshot('sonner-warning-variant.png');
  });

  test('should handle examples correctly', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // Test that examples section is visible
    const examplesSection = propsPanel.locator('text=Examples').first();
    await expect(examplesSection).toBeVisible({ timeout: 10000 });

    // Test clicking on the first available example
    const firstExample = propsPanel.getByRole('button').filter({ hasText: 'Toast' }).first();
    if (await firstExample.isVisible()) {
      await firstExample.click();
      await expect(componentPreview).toHaveScreenshot('sonner-first-example.png');
    }
  });

  test('should handle different toast variants', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    
    // Test that the Sonner component renders correctly
    await expect(componentPreview).toHaveScreenshot('sonner-provider-rendered.png');
    
    // Test that the component preview contains some content
    await expect(componentPreview).toBeVisible();
  });
}); 