import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('T-8.5: Cross-Browser & Viewport Resilience', () => {
  const viewports = [
    { name: 'Desktop Chrome / Edge', width: 1440, height: 900 },
    { name: 'Tablet / iPad', width: 768, height: 1024 },
    { name: 'Mobile iOS Safari', width: 390, height: 844 },
    { name: 'Mobile Android Chrome', width: 412, height: 915 },
  ];

  for (const vp of viewports) {
    test(`renders home landing without horizontal overflow on ${vp.name} (${vp.width}x${vp.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      await expect(page.locator('header')).toBeVisible({ timeout: 15000 });
      await expect(page.locator('main')).toBeVisible({ timeout: 15000 });

      // Assert page scrollWidth does not exceed viewport width (zero horizontal scroll)
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(vp.width + 1); // allow 1px rounding
    });
  }

  test('verifies backdrop-filter fallback rule is defined for non-supporting browsers', async () => {
    const globalsCss = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf-8');
    expect(globalsCss).toContain('@supports not (backdrop-filter: blur(1px))');
    expect(globalsCss).toContain('.glass-card-nextgen');
    expect(globalsCss).toContain('.glass-ambient');
  });
});
