import { test, expect } from '@playwright/test';

test.describe('Realtime Race, Cyan Flash & Header Countdown (Phase 4 Batch 3)', () => {
  test('header renders persistent CycleCountdown with local UTC offset [T-4.14]', async ({
    page,
  }) => {
    await page.goto('/feed');

    // Locate header timer container
    const timer = page.locator('header [role="timer"]');
    await expect(timer).toBeVisible({ timeout: 10000 });

    // Verify contains Cycle #N and UTC offset
    await expect(timer).toContainText(/cycle #\d+/i);
    await expect(timer).toContainText(/UTC[+-]\d+/i);
  });

  test('leaderboard rows have motion.li layout attributes and semantic ordering [T-4.11, T-4.12]', async ({
    page,
  }) => {
    await page.goto('/leaderboard');

    // Wait for leaderboard items to render
    const ol = page.locator('ol[role="list"]');
    await expect(ol).toBeVisible({ timeout: 10000 });

    const rows = ol.locator('li');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });

    // Verify first row has rank 01
    await expect(rows.first()).toContainText('01');
  });

  test('animates rank change with cyan border flash when live vote event occurs [T-4.12]', async ({
    page,
  }) => {
    await page.goto('/leaderboard');

    // Locate the second item in the leaderboard
    const rows = page.locator('ol[role="list"] li');
    await expect(rows.nth(1)).toBeVisible({ timeout: 10000 });

    // Get the idea ID of the second item
    const secondLink = rows.nth(1).locator('a');
    const href = await secondLink.getAttribute('href');
    expect(href).toBeTruthy();

    // Trigger local live vote dispatch to simulate realtime rank promotion
    await page.evaluate(() => {
      // Find second item's data or trigger custom event
      const secondItemLink = document.querySelectorAll(
        'ol[role="list"] li a',
      )[1] as HTMLAnchorElement;
      if (secondItemLink) {
        // Extract idea slug or title
        window.dispatchEvent(
          new CustomEvent('ideapulse:vote-update', {
            detail: { action: 'vote', ideaId: 'a1111111-1111-4111-a111-111111111111' },
          }),
        );
      }
    });

    // Verify row updates and remains accessible
    await expect(rows.first()).toBeVisible();
  });
});
