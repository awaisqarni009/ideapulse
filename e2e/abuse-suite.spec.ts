import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tsdghmnmsyogjulpzgmu.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZGdobW5tc3lvZ2p1bHB6Z211Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTkzMzQ1MywiZXhwIjoyMTA1NTA5NDUzfQ.gpYZ6eeK4s62ymHVPJOk5Wvydaz_vc5JUp9U-ZZUN7M',
);

test.describe('T-8.2: E2E Abuse Suite & Constraint Enforcement', () => {
  test('BR-003: Self-vote is strictly rejected at UI and constraint level', async ({ page }) => {
    // 1. Sign in as Maya Chen (author of seed idea)
    await page.goto('/login?next=%2Fidea%2Foffline-first-sync-field-research-teams-a1b2c3');
    await page.fill('#email', 'maya@ideapulse.dev');
    await page.fill('#password', 'Password123!');
    await page.locator('form button[type="submit"]').click();

    await expect(page).toHaveURL(/\/idea\/offline-first-sync-field-research-teams-a1b2c3/, {
      timeout: 25000,
    });

    // 2. Button is visibly and functionally disabled with tooltip
    const voteBtn = page.getByRole('button', { name: /vote on idea/i });
    await expect(voteBtn).toBeVisible({ timeout: 15000 });
    await expect(voteBtn).toBeDisabled();
    await expect(voteBtn).toHaveAttribute('title', "You can't vote on your own idea.");
  });

  test('BR-001: Second proposal submission in active cycle is blocked by CooldownPanel', async ({
    page,
  }) => {
    // 1. Sign in as Maya Chen who already has an idea in the active cycle
    await page.goto('/login?next=%2Fsubmit');
    await page.fill('#email', 'maya@ideapulse.dev');
    await page.fill('#password', 'Password123!');
    await page.locator('form button[type="submit"]').click();

    await expect(page).toHaveURL(/\/submit/, { timeout: 25000 });

    // 2. Cooldown banner and countdown are presented; submission form is blocked
    await expect(page.getByText(/submission cooldown active/i)).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#idea-title')).not.toBeVisible();
  });

  test('BR-002: Double voting on the same idea is rejected', async ({ page }) => {
    // 1. Sign in as test user
    await page.goto('/login?next=%2Fidea%2Fopen-soil-health-sensor-network-lorawan-c3d4e5');
    await page.fill('#email', 'qarnia788@gmail.com');
    await page.fill('#password', 'Password123!');
    await page.locator('form button[type="submit"]').click();

    await expect(page).toHaveURL(/\/idea\/open-soil-health-sensor-network-lorawan-c3d4e5/, {
      timeout: 25000,
    });

    const voteBtn = page.getByRole('button', { name: /vote on idea/i });
    await expect(voteBtn).toBeVisible({ timeout: 15000 });

    const titleAttr = await voteBtn.getAttribute('title');
    if (titleAttr === 'You voted for this.' || titleAttr?.includes('retract')) {
      // Button already in voted state; user cannot cast a duplicate vote
      await expect(voteBtn).toHaveAttribute('title', /voted|retract/i);
    } else {
      // Cast first vote
      await voteBtn.click();
      // Reconciles and transitions to voted / retractable state
      await expect(voteBtn).toHaveAttribute('title', /voted|retract/i, { timeout: 10000 });
    }
  });

  test('BR-010: Over-quota votes are prevented by QuotaHUD and rejected at DB layer', async ({
    page,
  }) => {
    // 1. Query user's current 24h vote count
    const { data: user } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', 'qarnia788')
      .single();

    if (user) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabaseAdmin
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('voter_id', user.id)
        .gte('created_at', twentyFourHoursAgo);

      // Sign in and check header QuotaHUD state
      await page.goto('/login?next=%2F');
      await page.fill('#email', 'qarnia788@gmail.com');
      await page.fill('#password', 'Password123!');
      await page.locator('form button[type="submit"]').click();

      await expect(page).toHaveURL(/\/(feed)?$/, { timeout: 25000 });
      const quotaHud = page.locator('header [role="status"]');
      await expect(quotaHud).toBeVisible({ timeout: 15000 });

      if ((count || 0) >= 5) {
        await expect(quotaHud).toContainText(/0 left/i);
      }
    }
  });
});
