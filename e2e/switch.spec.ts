import { test, expect } from '@playwright/test';

test.describe('Component: Switch', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Components', level: 2 })).toBeVisible();
    // Select the Switch component before each test
    await page.getByRole('button', { name: /^Switch v/ }).click();
  });

  test('should render and handle prop changes', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // 1. Baseline snapshot with default state
    await expect(componentPreview).toHaveScreenshot('switch-default.png');

    // 2. Test adding a label
    const labelInput = propsPanel.getByTestId('prop-control-label').locator('input');
    await labelInput.fill('Enable notifications');
    await expect(componentPreview.getByText('Enable notifications')).toBeVisible();
    await expect(componentPreview).toHaveScreenshot('switch-with-label.png');

    // 3. Test checked state
    await propsPanel.getByTestId('prop-control-checked').locator('input').check();
    await expect(componentPreview).toHaveScreenshot('switch-checked.png');

    // 4. Test disabled state
    await propsPanel.getByTestId('prop-control-disabled').locator('input').check();
    await expect(componentPreview).toHaveScreenshot('switch-disabled.png');

    // 5. Test with id prop
    const idInput = propsPanel.getByTestId('prop-control-id').locator('input');
    await idInput.fill('test-switch');
    await expect(componentPreview).toHaveScreenshot('switch-with-id.png');
  });

  test('should handle interactive switch toggling', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // Find the switch element
    const switchElement = componentPreview.getByRole('switch');
    await expect(switchElement).toBeVisible();

    // Test that clicking the switch updates the checked state
    await switchElement.click();
    
    // Wait a moment for the state to update
    await page.waitForTimeout(500);
    
    // The switch should now appear checked
    await expect(componentPreview).toHaveScreenshot('switch-after-click.png');
  });

  test('should handle examples correctly', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // Test clicking on different examples
    const labelExample = propsPanel.getByText('Switch with Label');
    await labelExample.click();
    await expect(componentPreview).toHaveScreenshot('switch-label-example.png');

    const checkedExample = propsPanel.getByText('Checked Switch');
    await checkedExample.click();
    await expect(componentPreview).toHaveScreenshot('switch-checked-example.png');

    const disabledExample = propsPanel.getByText('Disabled Switch');
    await disabledExample.click();
    await expect(componentPreview).toHaveScreenshot('switch-disabled-example.png');
  });
}); 