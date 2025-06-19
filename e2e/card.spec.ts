import { test, expect } from '@playwright/test';
import { testChildrenProp } from '@/lib/test-utils';

test.describe('Component: Card', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Components', level: 2 })).toBeVisible();
    // Select the Card component before each test
    await page.getByRole('button', { name: /^Card v/ }).click();
  });

  const setupCardTestConsts = async (page: any) => {
    // Select the Button component from the list
    await page.getByRole('button', { name: /^Card v/ }).click();
  
    // Wait for examples to be visible and get their count
    const examples = page.getByTestId('examples-panel').getByRole('button', { name: /Currently selected|^(?!.*Currently selected).*$/ });
    const exampleCount = await examples.count();
  
    // Verify we have at least 3 examples to test with
    expect(exampleCount).toBeGreaterThanOrEqual(3);
  
    // Get the second and third examples (first is already selected by default)
    const secondExample = examples.nth(1);
    const thirdExample = examples.nth(2);

    const componentPreview = page.getByTestId('component-preview');
    const renderedCard = componentPreview.getByTestId('rendered-component-card');

    return {
      componentPreview,
      renderedCard,
      secondExample,
      thirdExample
    };
  };

  test('children prop', async ({ page }) => {
    const { componentPreview, renderedCard } = await setupCardTestConsts(page);

    await testChildrenProp(componentPreview, renderedCard, page);
  });

  test('className prop', async ({ page }) => {
    const { componentPreview } = await setupCardTestConsts(page);

    const classNameInput = page.getByTestId('prop-control-className').locator('input');
    await expect(classNameInput).toBeEnabled();
    await classNameInput.click();
  });

  test('padding prop', async ({ page }) => {
    const { componentPreview } = await setupCardTestConsts(page);

    const paddingSelect = page.getByTestId('prop-control-padding').locator('select');
    await expect(paddingSelect).toBeEnabled();
    await paddingSelect.click();
    await paddingSelect.selectOption('lg');
    await expect(componentPreview).toHaveScreenshot('card-padding-lg.png');
  });

  test('shadow prop', async ({ page }) => {
    const { componentPreview } = await setupCardTestConsts(page);

    const shadowSelect = page.getByTestId('prop-control-shadow').locator('select');
    await expect(shadowSelect).toBeEnabled();
    await shadowSelect.click();
    await shadowSelect.selectOption('lg');
    await expect(componentPreview).toHaveScreenshot('card-shadow-lg.png');
  });

  test('border prop', async ({ page }) => {
    const { componentPreview } = await setupCardTestConsts(page);

    const borderCheckbox = page.getByTestId('prop-control-border').locator('input');
    await expect(borderCheckbox).toBeEnabled();
    await borderCheckbox.click();
    await expect(componentPreview).toHaveScreenshot('card-no-border.png', { threshold: 0.1 });
  });

  test('rounded prop', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');
  });

  test('header prop', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');
  });

  test('footer prop', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');
  });



  test('should render and handle all visual props', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // 2. Test 'padding' prop
    await propsPanel.getByTestId('prop-control-padding').locator('select').selectOption('lg');
    await expect(componentPreview).toHaveScreenshot('card-padding-lg.png');

    // 3. Test 'shadow' prop
    await propsPanel.getByTestId('prop-control-shadow').locator('select').selectOption('lg');
    await expect(componentPreview).toHaveScreenshot('card-shadow-lg.png');

    // 4. Test 'rounded' prop
    await propsPanel.getByTestId('prop-control-rounded').locator('select').selectOption('sm');
    await expect(componentPreview).toHaveScreenshot('card-rounded-sm.png');

    // 5. Test 'border' prop
    await propsPanel.getByTestId('prop-control-border').locator('input').uncheck();
    await expect(componentPreview).toHaveScreenshot('card-no-border.png', { threshold: 0.1 });
  });

  test('should correctly render header and footer slots', async ({ page }) => {
    const componentPreview = page.getByTestId('component-preview');
    const propsPanel = page.getByTestId('props-panel');

    // 1. Test 'header' prop
    const headerEditor = page.getByTestId('prop-control-header');
    const monacoHeaderEditor = headerEditor.locator('.monaco-editor').first();
    
    await monacoHeaderEditor.click();
    await page.keyboard.type('return <h2>Card Header</h2>');    
    await expect(componentPreview.getByRole('heading', { name: 'Card Header' })).toBeVisible();
    await expect(componentPreview).toHaveScreenshot('card-with-header.png');
    
    // 2. Test 'footer' prop
    const footerEditor = page.getByTestId('prop-control-footer');
    const monacoFooterEditor = footerEditor.locator('.monaco-editor').first();
    
    await monacoFooterEditor.click();
    await page.keyboard.type('return <p>Card Footer</p>');
    await expect(componentPreview.getByText('Card Footer')).toBeVisible();
    await expect(componentPreview).toHaveScreenshot('card-with-footer.png');
  });
}); 