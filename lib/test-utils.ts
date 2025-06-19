import { expect } from '@playwright/test';

export async function testChildrenProp(componentPreview:any, testingComponent: any, page: any) {

    const childrenInput = page.getByTestId('prop-control-children');
    const functionPropStatus = childrenInput.getByTestId('function-prop-status');
    await childrenInput.locator('.monaco-editor').click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await page.keyboard.type('return (<div>Click e</div>)');

    await expect(functionPropStatus).toHaveText(VALID_FUNCTION_TEST, { timeout: 10000 });
    await expect(testingComponent).toBeVisible();
    await expect(componentPreview).toHaveScreenshot('card-children-success-test.png');

    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');

    await expect(functionPropStatus).toHaveText(INVALID_FUNCTION_TEST, { timeout: 10000 });
  };

export const VALID_FUNCTION_TEST = 'Status: ✅ Valid function - will appear in generated code';
export const INVALID_FUNCTION_TEST = 'Status: ❌ Invalid function - will not appear in generated code';