import { test, expect } from '@playwright/test';

test.describe('Component: DataTable', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Components', level: 2 })).toBeVisible();
    // Select the DataTable component before each test
    await page.getByRole('button', { name: 'DataTable' }).click();
  });

  test('should render and handle visual props correctly', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    await expect(componentPreview.getByRole('table')).toBeVisible();

    // 1. Baseline snapshot
    await expect(componentPreview).toHaveScreenshot('datatable-default.png');

    // 2. Test 'filters' prop
    const roleFilter = componentPreview.getByRole('button', { name: 'Role' });
    await roleFilter.click();
    await page.getByRole('menuitem', { name: 'Admin' }).click();
    await expect(componentPreview).toHaveScreenshot('datatable-filtered.png');
    await roleFilter.click(); // close the filter dropdown
    
    // 3. Test 'initialSorting' prop by checking the visual order of rows
    const initialSortingEditor = page.getByTestId('prop-control-initialSorting');
    await initialSortingEditor.locator('.monaco-editor').first().click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await page.keyboard.type('[{"id": "name", "desc": true}]');
    await page.getByTestId('function-prop-status').last().waitFor(); // Wait for validation
    
    // The table should now be sorted by name in descending order.
    const firstRow = componentPreview.locator('tbody tr').first();
    await expect(firstRow).toContainText('John Doe'); // Assuming John Doe is last alphabetically
    await expect(componentPreview).toHaveScreenshot('datatable-sorted.png');
  });

  test('should handle functional and string props correctly', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');

    // 1. Test 'createToolbarButtons' function prop
    const functionEditor = page.getByTestId('prop-control-createToolbarButtons');
    await functionEditor.locator('.monaco-editor').first().click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    const newButtonFunc = `return <button className="px-3 py-1 border rounded bg-green-500 text-white">New Button</button>`;
    await page.keyboard.type(newButtonFunc);
    await expect(functionEditor.getByTestId('function-prop-status')).toHaveText(/Valid function/);
    await expect(componentPreview.getByRole('button', { name: 'New Button' })).toBeVisible();

    // 2. Test 'onRowClick' function prop
    let rowClickMessage = '';
    page.on('console', msg => { if (msg.text().includes('Row clicked')) { rowClickMessage = msg.text(); } });
    
    const onRowClickEditor = page.getByTestId('prop-control-onRowClick');
    await onRowClickEditor.locator('.monaco-editor').first().click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await page.keyboard.type(`console.log('Row clicked: ' + rowId)`);
    await expect(onRowClickEditor.getByTestId('function-prop-status')).toHaveText(/Valid function/);
    
    await componentPreview.getByRole('cell', { name: 'John Doe' }).click();
    await expect.poll(() => rowClickMessage).toContain('Row clicked');

    // 3. Test 'tableLabel' and 'identifier' string props
    const tableLabelInput = page.getByTestId('prop-control-tableLabel');
    await tableLabelInput.fill('Employees');
    await expect(componentPreview.locator('#filter-Employees')).toBeVisible();

    const identifierInput = page.getByTestId('prop-control-identifier');
    await identifierInput.fill('email');
    await componentPreview.locator('#filter-Employees').fill('john@example.com');
    await expect(componentPreview.getByRole('cell', { name: 'John Doe' })).toBeVisible();
    await expect(componentPreview.getByRole('cell', { name: 'Jane Smith' })).not.toBeVisible();
  });
}); 