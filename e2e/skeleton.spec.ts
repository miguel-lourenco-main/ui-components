import { test, expect } from '@playwright/test';

test.describe('Component: Skeleton', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Components', level: 2 })).toBeVisible();
    // Select the Skeleton component before each test
    await page.getByRole('button', { name: /^Skeleton v/ }).click();
  });

  test('should render and handle className changes', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // 1. Baseline snapshot with default className
    await expect(componentPreview).toHaveScreenshot('skeleton-default.png');

    // 2. Test changing to circular skeleton
    const classNameInput = propsPanel.getByTestId('prop-control-className').locator('input');
    await classNameInput.clear();
    await classNameInput.fill('h-12 w-12 rounded-full');
    await expect(componentPreview).toHaveScreenshot('skeleton-circular.png');

    // 3. Test card-style skeleton
    await classNameInput.clear();
    await classNameInput.fill('h-[125px] w-[250px] rounded-xl');
    await expect(componentPreview).toHaveScreenshot('skeleton-card.png');

    // 4. Test text line skeleton
    await classNameInput.clear();
    await classNameInput.fill('h-4 w-full');
    await expect(componentPreview).toHaveScreenshot('skeleton-text-line.png');

    // 5. Test small skeleton
    await classNameInput.clear();
    await classNameInput.fill('h-8 w-[200px] rounded');
    await expect(componentPreview).toHaveScreenshot('skeleton-small.png');
  });

  test('should handle examples correctly', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // Test clicking on different examples
    const cardExample = propsPanel.getByText('Card Skeleton');
    await cardExample.click();
    await expect(componentPreview).toHaveScreenshot('skeleton-card-example.png');

    const profileExample = propsPanel.getByText('Profile Skeleton');
    await profileExample.click();
    await expect(componentPreview).toHaveScreenshot('skeleton-profile-example.png');

    const textBlockExample = propsPanel.getByText('Text Block Skeleton');
    await textBlockExample.click();
    await expect(componentPreview).toHaveScreenshot('skeleton-text-block-example.png');
  });
}); 