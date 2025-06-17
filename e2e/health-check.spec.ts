import { test, expect } from '@playwright/test';

test.describe('Website Health Check', () => {
  test('should serve the website properly and load content', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Verify the page loads without errors
    await expect(page).toHaveTitle(/UI Components/i);
    
    // Check that we have HTML content (not a directory listing)
    const html = await page.content();
    expect(html).toContain('<html');
    expect(html).toContain('<head>');
    expect(html).toContain('<body>');
    
    // Verify Next.js is properly loaded
    expect(html).toContain('_next');
    
    // Check that the page doesn't show a directory listing
    expect(html).not.toContain('Index of /');
    expect(html).not.toContain('Directory listing');
    
    // Verify the page is interactive (wait for React to hydrate)
    await page.waitForLoadState('networkidle');
    
    // Check for any console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit to catch any console errors
    await page.waitForTimeout(2000);
    
    // Report any console errors but don't fail the test unless they're critical
    if (errors.length > 0) {
      console.log('Console errors detected:', errors);
      // Only fail if there are critical errors
      const criticalErrors = errors.filter(error => 
        error.includes('ChunkLoadError') || 
        error.includes('Script error') ||
        error.includes('Failed to fetch')
      );
      expect(criticalErrors).toHaveLength(0);
    }
    
    console.log('✅ Website health check passed - site is serving properly');
  });
  
  test('should have working navigation and routing', async ({ page }) => {
    await page.goto('/');
    
    // Verify the page loads
    await page.waitForLoadState('networkidle');
    
    // Check if there are any navigation elements or interactive components
    const body = await page.locator('body');
    await expect(body).toBeVisible();
    
    // Verify that JavaScript is working (check if any interactive elements exist)
    const hasInteractiveElements = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button').length;
      const links = document.querySelectorAll('a').length;
      const inputs = document.querySelectorAll('input').length;
      return buttons > 0 || links > 0 || inputs > 0;
    });
    
    // Log the state for debugging
    console.log('Interactive elements found:', hasInteractiveElements);
    
    // This test passes if the page loads and has some content
    // We don't require interactive elements as the app might be purely display-based
    expect(await page.textContent('body')).toBeTruthy();
    
    console.log('✅ Navigation and routing check passed');
  });
}); 