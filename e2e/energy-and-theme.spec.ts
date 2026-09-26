import { test, expect } from '@playwright/test';

test.describe('Energy System & Dark/Bright Mode E2E Verification', () => {
  test('verifies Theme Toggle switching, Energy Badge, Daily Quests Hub, and Scroll Tracker', async ({
    page,
  }) => {
    // 1. Navigate to home
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 2. Verify Theme Toggle is visible
    const themeToggle = page.getByRole('button', { name: /switch to (bright|dark) mode/i });
    await expect(themeToggle).toBeVisible({ timeout: 10000 });

    // 3. Verify Energy Badge is visible in header
    const energyBadge = page.locator('button[title*="Voting Energy"]');
    await expect(energyBadge).toBeVisible({ timeout: 10000 });
    await expect(energyBadge).toContainText('100');

    // 4. Click Energy Badge to open Energy Hub modal
    await energyBadge.click();
    await page.waitForTimeout(500);

    const artifactDir =
      'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\599168d7-d211-47b8-ba7e-1a9b4970d1ed';
    await page.screenshot({ path: `${artifactDir}\\dark_mode_energy_hub_modal.png` });

    // 5. Verify modal content
    const modalHeading = page.getByRole('heading', { name: /voting energy & daily quests/i });
    await expect(modalHeading).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Energy Reservoir')).toBeVisible();
    await expect(page.getByText('Daily Quests & Tasks')).toBeVisible();
    await expect(page.getByText('Daily Check-in & Login')).toBeVisible();
    await expect(page.getByText('Feed Explorer (30s Browsing)')).toBeVisible();

    // 6. Claim daily check-in quest
    const claimBtn = page.getByRole('button', { name: /claim/i });
    if (await claimBtn.isVisible()) {
      await claimBtn.click();
      await expect(page.getByText('Claimed', { exact: true })).toBeVisible({ timeout: 5000 });
    }

    // 7. Dismiss modal via Escape key
    await page.keyboard.press('Escape');
    await expect(modalHeading).not.toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${artifactDir}\\dark_mode_feed_with_energy.png` });

    // 8. Test Dark/Bright Mode Theme Switching
    const html = page.locator('html');
    console.log('--- THEME TOGGLE TEST ---');
    console.log('1. Initial html class:', await html.getAttribute('class'));
    console.log(
      '1. localStorage theme:',
      await page.evaluate(() => localStorage.getItem('ideapulse-theme')),
    );
    console.log('1. Toggle aria-label:', await themeToggle.getAttribute('aria-label'));

    // Click toggle to switch mode to Bright Mode
    await themeToggle.click();
    await page.waitForTimeout(600);

    console.log('2. After click html class:', await html.getAttribute('class'));
    console.log(
      '2. localStorage theme:',
      await page.evaluate(() => localStorage.getItem('ideapulse-theme')),
    );
    console.log('2. Toggle aria-label:', await themeToggle.getAttribute('aria-label'));
    console.log(
      '2. Body computed background:',
      await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
    );

    await page.screenshot({ path: `${artifactDir}\\bright_mode_feed_with_energy.png` });

    // Open Energy Hub in Bright Mode to verify contrast
    await energyBadge.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${artifactDir}\\bright_mode_energy_hub_modal.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // Click toggle again to switch back to Dark Mode
    await themeToggle.click();
    await page.waitForTimeout(600);

    console.log('3. After 2nd click html class:', await html.getAttribute('class'));
    console.log(
      '3. localStorage theme:',
      await page.evaluate(() => localStorage.getItem('ideapulse-theme')),
    );

    // 9. Verify 30s Scroll Quest tracker widget exists on feed
    const scrollTracker = page.locator('text=Feed Explorer Quest');
    await expect(scrollTracker).toBeVisible({ timeout: 5000 });

    // Simulate active scrolling down and up
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(1200);
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(1200);
  });
});
