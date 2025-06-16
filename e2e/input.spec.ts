import { test, expect } from '@playwright/test';

test.describe('Component: Input', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Components', level: 2 })).toBeVisible();
    // Select the Input component before each test
    await page.getByRole('button', { name: 'Input' }).click();
  });

  test('should render and handle visual props correctly', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');
    const renderedInput = componentPreview.getByRole('textbox');

    // 1. Baseline snapshot
    await expect(renderedInput).toBeVisible();
    await expect(componentPreview).toHaveScreenshot('input-default.png');
    
    const labelEditor = propsPanel.getByTestId('prop-control-label').locator("input");
    
    // Test 'label' and 'required' props to make 'name' testable
    await labelEditor.clear();
    await labelEditor.fill('Email Address');

    await propsPanel.getByTestId('prop-control-required').locator('input').check();
    await expect(componentPreview.getByText('Email Address')).toBeVisible();

    // 3. Test 'placeholder' prop
    await propsPanel.getByTestId('prop-control-placeholder').locator('input').fill('Enter new text...');
    await expect(componentPreview).toHaveScreenshot('input-placeholder.png');

    // 4. Test 'size' prop
    await propsPanel.getByTestId('prop-control-size').locator('select').selectOption('lg');
    await expect(componentPreview).toHaveScreenshot('input-size-lg.png');

    // 5. Test 'variant' prop
    await propsPanel.getByTestId('prop-control-variant').locator('select').selectOption('success');
    await expect(componentPreview).toHaveScreenshot('input-variant-success.png');
    
    // 6. Test 'disabled' prop visually
    await propsPanel.getByTestId('prop-control-disabled').locator('input').check();
    await expect(componentPreview).toHaveScreenshot('input-disabled.png');
  });

  test('should handle helper and error message props', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // 1. Test 'helperText' prop
    await propsPanel.getByTestId('prop-control-helperText').locator('input').fill('This is a hint.');
    await expect(componentPreview.getByText('This is a hint.')).toBeVisible();
    await expect(componentPreview).toHaveScreenshot('input-with-helper-text.png');

    // 2. Test 'errorMessage' prop
    await propsPanel.getByTestId('prop-control-errorMessage').locator('input').fill('This field is required.');
    await expect(componentPreview.getByText('This field is required.')).toBeVisible();
    await expect(componentPreview).toHaveScreenshot('input-with-error-message.png');
  });
}); 