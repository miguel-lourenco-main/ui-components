import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🧹 Global setup: Clearing browser state...');
  
  // Launch browser and clear all state
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  // Clear all storage
  await context.clearCookies();
  await context.clearPermissions();
  
  // Close browser
  await context.close();
  await browser.close();
  
  console.log('✅ Global setup complete');
}

export default globalSetup; 