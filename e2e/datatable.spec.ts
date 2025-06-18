import { test, expect } from '@playwright/test';

test.describe('Component: DataTable', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Components', level: 2 })).toBeVisible();
    // Select the DataTable component before each test
    await page.getByRole('button', { name: /^DataTable v/ }).click();
  });

  test('should render and handle visual props correctly', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    await expect(componentPreview.getByRole('table')).toBeVisible();

    // 1. Baseline snapshot
    await expect(componentPreview).toHaveScreenshot('datatable-default.png');

    // 2. Test 'tableLabel' and 'identifier' string props
    const tableLabelInput = page.getByTestId('prop-control-tableLabel').locator('input');
    await tableLabelInput.fill('Employees');
    await expect(componentPreview.locator('#filter-Employees')).toBeVisible();

    const identifierInput = page.getByTestId('prop-control-identifier').locator('input');
    await identifierInput.fill('email');
    await componentPreview.locator('#filter-Employees').fill('john@example.com');
    await expect(componentPreview.getByRole('cell', { name: 'John Doe' })).toBeVisible();
    await expect(componentPreview.getByRole('cell', { name: 'Jane Smith' })).not.toBeVisible();
  });
}); 