import { 
  doesComponentRender, 
  setupComponentTestConsts, 
  testDefaultValueProp, 
  testDisabledProp, 
  testOnChangeProp, 
  testPlaceholderProp, 
  testTypeProp, 
  testValueProp,
  testOnFocusProp,
  testOnBlurProp,
  testRequiredProp,
  testSizeProp,
  testVariantClassProp,
  testClassNameProp,
  testLabelProp,
  testHelperTextProp,
  testErrorProp
} from '@/lib/test-utils';
import { test, expect } from '@playwright/test';

const componentName = 'input';

test.describe('Component: Input', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Playground', level: 1 })).toBeVisible();
    // Select the Input component before each test
    await page.getByRole('button', { name: /^Input v/ }).click();
  });

  const setupInputTestConsts = setupComponentTestConsts(componentName);

  test('should render the default input', async ({ page }) => {
    const { componentPreview, renderedComponent } = await setupInputTestConsts(page);
    await doesComponentRender(componentName, componentPreview, renderedComponent);
  });

  test.describe('Test input props', () => {
    test.beforeEach(async ({ page }) => {
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
    });

    test('is type prop working', async ({ page }) => {
      const { componentPreview } = await setupInputTestConsts(page);
      
      // Wait for the props panel to be ready and the type prop control to be visible
      const typeControl = page.getByTestId('prop-control-type');
      await expect(typeControl).toBeVisible({ timeout: 10000 });
      
      await testTypeProp(componentName, componentPreview, page);
    });

    test('is placeholder prop working', async ({ page }) => {
      const { componentPreview } = await setupInputTestConsts(page);
      
      await testPlaceholderProp(componentName, componentPreview, page);
    });

    test('is value prop working', async ({ page }) => {
      const { componentPreview } = await setupInputTestConsts(page);
      
      await testValueProp(componentName, componentPreview, page);
    });

    test('is defaultValue prop working', async ({ page }) => {
      const { componentPreview } = await setupInputTestConsts(page);
      
      await testDefaultValueProp(componentName, componentPreview, page);
    });

    test('is onChange prop working', async ({ page }) => {
      const { renderedComponent } = await setupInputTestConsts(page);
      
      await testOnChangeProp(componentName, renderedComponent, page);
    });

    test('is onFocus prop working', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupInputTestConsts(page);
      
      await testOnFocusProp(componentName, componentPreview, renderedComponent, page);
    });

    test('is onBlur prop working', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupInputTestConsts(page);
      
      await testOnBlurProp(componentName, componentPreview, renderedComponent, page);
    });

    test('is disabled prop working', async ({ page }) => {
      const { componentPreview } = await setupInputTestConsts(page);
      
      await testDisabledProp(componentName, componentPreview, page);
    });

    test('is required prop working', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupInputTestConsts(page);
      
      await testRequiredProp(componentName, componentPreview, renderedComponent, page);
    });

    test('is size prop working', async ({ page }) => {
      const { componentPreview } = await setupInputTestConsts(page);
      
      await testSizeProp(componentName, componentPreview, page);
    });

    test('is variant class prop working', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupInputTestConsts(page);
      
      await testVariantClassProp(componentName, componentPreview, renderedComponent, page, 'error');
    });

    test('is className prop working', async ({ page }) => {
      const { componentPreview } = await setupInputTestConsts(page);
      
      await testClassNameProp(componentName, componentPreview, page);
    });

    test('is label prop working', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupInputTestConsts(page);
      
      await testLabelProp(componentName, componentPreview, renderedComponent, page);
    });

    test('is helperText prop working', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupInputTestConsts(page);
      
      await testHelperTextProp(componentName, componentPreview, renderedComponent, page);
    });

    test('is errorMessage prop working', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupInputTestConsts(page);
      
      await testErrorProp(componentName, componentPreview, renderedComponent, page);
    });
  });
}); 