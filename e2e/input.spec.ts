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

    test('is type prop working', async ({ page }) => {
      const { componentPreview } = await setupInputTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testTypeProp(componentName, componentPreview, page);
    });

    test('is placeholder prop working', async ({ page }) => {
      const { componentPreview } = await setupInputTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testPlaceholderProp(componentName, componentPreview, page);
    });

    test('is value prop working', async ({ page }) => {
      const { componentPreview } = await setupInputTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testValueProp(componentName, componentPreview, page);
    });

    test('is defaultValue prop working', async ({ page }) => {
      const { componentPreview } = await setupInputTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testDefaultValueProp(componentName, componentPreview, page);
    });

    test('is onChange prop working', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupInputTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testOnChangeProp(componentName, renderedComponent, page);
    });

    test('is onFocus prop working', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupInputTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testOnFocusProp(componentName, componentPreview, renderedComponent, page);
    });

    test('is onBlur prop working', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupInputTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testOnBlurProp(componentName, componentPreview, renderedComponent, page);
    });

    test('is disabled prop working', async ({ page }) => {
      const { componentPreview } = await setupInputTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testDisabledProp(componentName, componentPreview, page);
    });

    test('is required prop working', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupInputTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testRequiredProp(componentName, componentPreview, renderedComponent, page);
    });

    test('is size prop working', async ({ page }) => {
      const { componentPreview } = await setupInputTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testSizeProp(componentName, componentPreview, page);
    });

    test('is variant class prop working', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupInputTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testVariantClassProp(componentName, componentPreview, renderedComponent, page, 'error');
    });

    test('is className prop working', async ({ page }) => {
      const { componentPreview } = await setupInputTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testClassNameProp(componentName, componentPreview, page);
    });

    test('is label prop working', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupInputTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testLabelProp(componentName, componentPreview, renderedComponent, page);
    });

    test('is helperText prop working', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupInputTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testHelperTextProp(componentName, componentPreview, renderedComponent, page);
    });

    test('is errorMessage prop working', async ({ page }) => {
      const { componentPreview, renderedComponent } = await setupInputTestConsts(page);
      
      // Open the props panel
      const propsButton = page.getByTitle('Show Properties');
      await expect(propsButton).toBeVisible();
      await propsButton.click();
      
      await testErrorProp(componentName, componentPreview, renderedComponent, page);
    });
  });
}); 