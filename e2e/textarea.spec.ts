import { test, expect } from '@playwright/test';
import { 
  setupComponentTestConsts, 
  doesComponentRender, 
  testPlaceholderProp, 
  testLabelProp, 
  testHelperTextProp, 
  testDisabledProp, 
  testClassNameProp,
  testRowsProp,
  typeInInput,
  testIdProp
} from '@/lib/test-utils';

const componentName = 'textarea';

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

  const setupTextareaTestConsts = setupComponentTestConsts(componentName);

  test('should render the default textarea', async ({ page }) => {
    const { componentPreview, renderedComponent } = await setupTextareaTestConsts(page);
    await doesComponentRender(componentName, componentPreview, renderedComponent);
  });

  test.describe('Test textarea props', () => {

    test('is id prop working', async ({ page }) => {
      const { componentPreview } = await setupTextareaTestConsts(page);
      await testIdProp(componentName, componentPreview, page);
    });

    test('is label prop working', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupTextareaTestConsts(page);
      await testLabelProp(componentName, componentPreview, renderedComponent, page);
    });

    test('is helperText prop working', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupTextareaTestConsts(page);
      await testHelperTextProp(componentName, componentPreview, renderedComponent, page);
    });

    test('is error prop working', async ({ page }) => {
      const { componentPreview } = await setupTextareaTestConsts(page);
      await typeInInput(page, 'error', 'This field is required');
      await expect(componentPreview).toHaveScreenshot(`${componentName}-error.png`);
    });

    test('is className prop working', async ({ page }) => {
      const { componentPreview } = await setupTextareaTestConsts(page);
      await testClassNameProp(componentName, componentPreview, page);
    });

    test('should handle interactive text input', async ({ page }) => {
      const { componentPreview } = await setupTextareaTestConsts(page);

      // Find the textarea element
      const textarea = componentPreview.getByRole('textbox');
      await expect(textarea).toBeVisible();

      // Test typing in the textarea
      await textarea.fill('This is a test message');
      
      // Wait a moment for the state to update
      await page.waitForTimeout(500);
      
      // The text should be visible in the textarea
      await expect(textarea).toHaveValue('This is a test message');
      await expect(componentPreview).toHaveScreenshot(`${componentName}-with-text.png`);
    });
  });
}); 