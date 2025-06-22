import { defineConfig, devices } from '@playwright/test';

/**
 * CI-specific Playwright configuration that uses pre-built static files
 * instead of starting its own dev server.
 */
export default defineConfig({
  testDir: './e2e',
  /* Disable parallel execution for stability - this is the key fix */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Add retries for flaky tests - this handles intermittent failures */
  retries: 3,
  /* Use single worker to prevent resource contention */
  workers: 1,
  /* Global setup for complete test isolation */
  globalSetup: './e2e/global-setup.ts',
  /* Reporter to use. See https://playwright.dev/docs/reporting */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.CI_COMMIT_REF_SLUG 
      ? `http://localhost:3000/${process.env.CI_COMMIT_REF_SLUG}`
      : 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Add longer timeouts for stability */
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    /* Force fresh browser context for each test - this prevents state pollution */
    contextOptions: {
      // Clear all storage between tests
      storageState: undefined,
    },
  },

  /* Visual comparison settings */
  expect: {
    // Allow up to 2% pixel difference for visual comparisons
    toHaveScreenshot: { 
      maxDiffPixelRatio: 0.02
    },
    // Global matcher timeout
    timeout: 10000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true, // Always reuse existing server to avoid port conflicts
    stdout: 'pipe',
    stderr: 'pipe',
  },
}); 