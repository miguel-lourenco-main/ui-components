import { test, expect } from '@playwright/test';

test.describe('Component: Textarea', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Components', level: 2 })).toBeVisible();
    // Select the Textarea component before each test
    await page.getByRole('button', { name: /^Textarea v/ }).click();
  });

  test('should render and handle prop changes', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // 1. Baseline snapshot with default state
    await expect(componentPreview).toHaveScreenshot('textarea-default.png');

    // 2. Test adding a placeholder
    const placeholderInput = propsPanel.getByTestId('prop-control-placeholder').locator('input');
    await placeholderInput.fill('Enter your message...');
    await expect(componentPreview).toHaveScreenshot('textarea-with-placeholder.png', { threshold: 0.1 });

    // 3. Test adding a label
    const labelInput = propsPanel.getByTestId('prop-control-label').locator('input');
    await labelInput.fill('Message');
    await expect(componentPreview.getByText('Message')).toBeVisible();
    await expect(componentPreview).toHaveScreenshot('textarea-with-label.png');

    // 4. Test adding helper text
    const helperTextInput = propsPanel.getByTestId('prop-control-helperText').locator('input');
    await helperTextInput.fill('Please enter your feedback');
    await expect(componentPreview.getByText('Please enter your feedback')).toBeVisible();
    await expect(componentPreview).toHaveScreenshot('textarea-with-helper-text.png');

    // 5. Test error state
    const errorInput = propsPanel.getByTestId('prop-control-error').locator('input');
    await errorInput.fill('This field is required');
    await expect(componentPreview.getByText('This field is required')).toBeVisible();
    await expect(componentPreview).toHaveScreenshot('textarea-with-error.png');

    // 6. Test disabled state
    await propsPanel.getByTestId('prop-control-disabled').locator('input').check();
    await expect(componentPreview).toHaveScreenshot('textarea-disabled.png');

    // 7. Test rows prop
    await propsPanel.getByTestId('prop-control-disabled').locator('input').uncheck();
    const rowsInput = propsPanel.getByTestId('prop-control-rows').locator('input');
    if (await rowsInput.isVisible()) {
      await rowsInput.fill('6');
      await expect(componentPreview).toHaveScreenshot('textarea-large-rows.png');
    }
  });

  test('should handle interactive text input', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // Find the textarea element
    const textarea = componentPreview.getByRole('textbox');
    await expect(textarea).toBeVisible();

    // Test typing in the textarea
    await textarea.fill('This is a test message');
    
    // Wait a moment for the state to update
    await page.waitForTimeout(500);
    
    // The text should be visible in the textarea
    await expect(textarea).toHaveValue('This is a test message');
    await expect(componentPreview).toHaveScreenshot('textarea-with-text.png');
  });

  test('should handle examples correctly', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // Test that examples section is visible
    const examplesSection = propsPanel.locator('text=Examples').first();
    await expect(examplesSection).toBeVisible({ timeout: 10000 });

    // Test clicking on the first available example
    const firstExample = propsPanel.getByRole('button').filter({ hasText: 'Textarea' }).first();
    if (await firstExample.isVisible()) {
      await firstExample.click();
      await expect(componentPreview).toHaveScreenshot('textarea-first-example.png');
    }
  });
}); 