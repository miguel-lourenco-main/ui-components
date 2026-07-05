import { test, expect, Page } from '@playwright/test';

/**
 * E2E coverage for the code-editing pipeline: the typed-shell function prop
 * editor (apply / block-on-syntax-error policies) and the code panel's
 * Edit Live mode (compile + live preview + reset).
 */

test.describe('Playground code editing', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    const loadingIndicator = page.getByText('Loading components...');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Playground', level: 1 })).toBeVisible();
    await page.getByRole('button', { name: /^Button v/ }).click();
  });

  /**
   * Focus the editable body of a prop editor's Monaco instance. Clicking
   * anywhere in the editor is enough: the editor snaps the caret out of the
   * protected shell lines into the body.
   */
  async function focusEditorBody(page: Page, propName: string) {
    const propControl = page.getByTestId(`prop-control-${propName}`);
    const editor = propControl.locator('.monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 30000 });
    await editor.click();
    return propControl;
  }

  test('function prop editor applies valid code and keeps the preview alive', async ({ page }) => {
    await page.getByTitle('Show Properties').click();

    const propControl = page.getByTestId('prop-control-onClick');
    await expect(propControl).toBeVisible();

    // Start from a clean body if the example shipped one
    const clearButton = propControl.getByTitle('Clear code');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }

    await focusEditorBody(page, 'onClick');
    await page.keyboard.type('console.log("clicked from e2e")');

    const status = propControl.getByTestId('function-prop-status');
    await expect(status).toContainText('will appear in generated code', { timeout: 15000 });

    // Preview must still render the component
    const preview = page.getByTestId('component-preview');
    await expect(preview.getByTestId('rendered-component-button')).toBeVisible();
  });

  test('function prop editor blocks syntax errors with a clear status', async ({ page }) => {
    await page.getByTitle('Show Properties').click();

    const propControl = page.getByTestId('prop-control-onClick');
    await expect(propControl).toBeVisible();

    const clearButton = propControl.getByTitle('Clear code');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }

    await focusEditorBody(page, 'onClick');
    await page.keyboard.type('const = broken');

    const status = propControl.getByTestId('function-prop-status');
    await expect(status).toContainText('Not applied', { timeout: 15000 });
    await expect(status).toContainText('syntax error');

    // The broken code must not take down the preview
    const preview = page.getByTestId('component-preview');
    await expect(preview.getByTestId('rendered-component-button')).toBeVisible();
  });

  test('Edit Live compiles custom TSX and drives the preview, and Reset restores props', async ({ page }) => {
    await page.getByTitle('Show Code').click();

    // Enter Edit Live
    await page.getByTestId('code-tab-edit').click();
    const liveEditor = page.getByTestId('code-editor-live');
    await expect(liveEditor.locator('.monaco-editor')).toBeVisible({ timeout: 30000 });

    // Replace the forked module through the Monaco API (typing long modules
    // through auto-closing brackets is flaky; compile + render is what we test)
    const replaced = await page.evaluate(() => {
      const monaco = (window as any).monaco;
      if (!monaco) return 'no-monaco';
      const model = monaco.editor
        .getModels()
        .find((m: any) => m.uri.toString() === 'file:///playground/main.tsx');
      if (!model) return 'no-model';
      model.setValue(
        [
          "import React from 'react';",
          "import { Button } from '@playground/component';",
          '',
          'export default function Example() {',
          '  return (',
          '    <div>',
          '      <Button>Custom Live Button</Button>',
          '    </div>',
          '  );',
          '}',
        ].join('\n')
      );
      return 'ok';
    });
    expect(replaced).toBe('ok');

    // The custom module compiles and renders in the preview
    const preview = page.getByTestId('component-preview');
    await expect(preview.getByTestId('custom-code-preview')).toBeVisible({ timeout: 15000 });
    await expect(preview.getByText('Custom Live Button')).toBeVisible();
    await expect(preview.getByTestId('custom-code-error')).not.toBeVisible();

    // Props panel shows the paused banner while code drives the preview
    await page.getByTitle('Show Properties').click();
    await expect(page.getByTestId('code-mode-banner')).toBeVisible();

    // Reset to props restores the props-driven preview
    await page.getByTestId('code-reset-to-props').click();
    await expect(preview.getByTestId('custom-code-preview')).not.toBeVisible();
    await expect(preview.getByTestId('rendered-component-button')).toBeVisible();
    await expect(page.getByTestId('code-mode-banner')).not.toBeVisible();
  });
});
