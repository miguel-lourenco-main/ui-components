import { test, expect } from '@playwright/test';
import { 
  setupComponentTestConsts, 
  doesComponentRender, 
} from '@/lib/test-utils';

const componentName = 'data-table';

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

  const setupDataTableTestConsts = setupComponentTestConsts(componentName);

  test('should render the default datatable', async ({ page }) => {
    const { componentPreview, renderedComponent } = await setupDataTableTestConsts(page);
    
    // Verify table is visible
    await expect(componentPreview.getByRole('table')).toBeVisible();
    await doesComponentRender(componentName, componentPreview, renderedComponent);
  });

  /**
   * test.describe('Test datatable props', () => {

    test('is tableLabel prop working', async ({ page }) => {
      const { componentPreview } = await setupDataTableTestConsts(page);
      await testTableLabelProp(componentName, componentPreview, page);
    });

    test('is identifier prop working', async ({ page }) => {
      const { componentPreview } = await setupDataTableTestConsts(page);
      await testIdentifierProp(componentName, componentPreview, page);
    });

    test('should handle filtering functionality', async ({ page }) => {
      const { componentPreview } = await setupDataTableTestConsts(page);
      
      // Set up table label and identifier for filtering
      await typeInInput(page, 'tableLabel', 'Employees');
      await typeInInput(page, 'identifier', 'email');
      
      // Test filtering functionality
      const filterInput = componentPreview.locator('#filter-Employees');
      await expect(filterInput).toBeVisible();
      
      await filterInput.fill('john@example.com');
      
      // Check that filtering works
      await expect(componentPreview.getByRole('cell', { name: 'John Doe' })).toBeVisible();
      await expect(componentPreview.getByRole('cell', { name: 'Jane Smith' })).not.toBeVisible();
      
      await expect(componentPreview).toHaveScreenshot(`${componentName}-filtered.png`);
    });

    test('should handle table interactions', async ({ page }) => {
      const { componentPreview } = await setupDataTableTestConsts(page);
      
      // Test that table rows are interactive
      const tableRows = componentPreview.getByRole('row');
      const dataRowCount = await tableRows.count();
      
      // Should have at least header row plus some data rows
      expect(dataRowCount).toBeGreaterThan(1);
      
      await expect(componentPreview).toHaveScreenshot(`${componentName}-interactive.png`);
    });
  });
   */
}); 