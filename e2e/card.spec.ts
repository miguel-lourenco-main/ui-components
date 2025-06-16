import { test, expect } from '@playwright/test';

test.describe('Component: Card', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Components', level: 2 })).toBeVisible();
    // Select the Card component before each test
    await page.getByRole('button', { name: 'Card' }).click();
  });

  test('should render and handle all visual props', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // 2. Test 'padding' prop
    await propsPanel.getByTestId('prop-control-padding').selectOption('lg');
    await expect(componentPreview).toHaveScreenshot('card-padding-lg.png');

    // 3. Test 'shadow' prop
    await propsPanel.getByTestId('prop-control-shadow').selectOption('lg');
    await expect(componentPreview).toHaveScreenshot('card-shadow-lg.png');

    // 4. Test 'rounded' prop
    await propsPanel.getByTestId('prop-control-rounded').selectOption('sm');
    await expect(componentPreview).toHaveScreenshot('card-rounded-sm.png');

    // 5. Test 'border' prop
    await propsPanel.getByTestId('prop-control-border').locator('input').uncheck();
    await expect(componentPreview).toHaveScreenshot('card-no-border.png');
  });

  test('should correctly render header and footer slots', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');
    
    // 1. Test 'header' prop
    const headerInput = propsPanel.getByTestId('prop-control-header').locator('input');
    await headerInput.fill('<h2>Card Header</h2>');
    await expect(componentPreview.getByRole('heading', { name: 'Card Header' })).toBeVisible();
    await expect(componentPreview).toHaveScreenshot('card-with-header.png');
    
    // 2. Test 'footer' prop
    const footerInput = propsPanel.getByTestId('prop-control-footer').locator('input');
    await footerInput.fill('<p>Card Footer</p>');
    await expect(componentPreview.getByText('Card Footer')).toBeVisible();
    await expect(componentPreview).toHaveScreenshot('card-with-footer.png');
  });
}); 