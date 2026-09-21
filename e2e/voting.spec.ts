import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tsdghmnmsyogjulpzgmu.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZGdobW5tc3lvZ2p1bHB6Z211Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTkzMzQ1MywiZXhwIjoyMTA1NTA5NDUzfQ.gpYZ6eeK4s62ymHVPJOk5Wvydaz_vc5JUp9U-ZZUN7M',
);

test.describe('Voting Core, Modals & Qualification (Phase 3 Final)', () => {
  test.beforeEach(async () => {
    // Clear prior test votes on the test idea so tests are 100% idempotent
    const { data: user } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', 'qarnia788')
      .maybeSingle();

    if (user?.id) {
      await supabaseAdmin
        .from('votes')
        .delete()
        .eq('voter_id', user.id)
        .eq('idea_id', 'a2222222-2222-4222-a222-222222222222');
    }
  });
  test('header displays QuotaHUD for authenticated user with 5 pips [T-3.16, T-3.17]', async ({
    page,
  }) => {
    // 1. Sign in as qarnia788
    await page.goto('/login?next=%2Fsubmit');
    await page.fill('#email', 'qarnia788@gmail.com');
    await page.fill('#password', 'Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/submit/, { timeout: 15000 });

    // 2. Locate QuotaHUD in the sticky header
    const quotaHud = page.locator('header [role="status"]');
    await expect(quotaHud).toBeVisible({ timeout: 10000 });

    // 3. Verify QuotaHUD contains 5 pips
    const pips = quotaHud.locator('span.rounded-full');
    await expect(pips).toHaveCount(5);

    // 4. Verify quota text contains "left"
    await expect(quotaHud).toContainText(/left/i);
  });

  test('own idea displays disabled lock state per BR-011 and DESIGN.md §7.2 [T-3.11, T-3.25]', async ({
    page,
  }) => {
    // 1. Sign in as Maya Chen (the author of seed idea)
    await page.goto('/login?next=%2Fidea%2Foffline-first-sync-field-research-teams-a1b2c3');
    await page.fill('#email', 'maya@ideapulse.dev');
    await page.fill('#password', 'Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/idea\/offline-first-sync-field-research-teams-a1b2c3/, {
      timeout: 15000,
    });

    // 2. Locate VoteButton
    const voteBtn = page.getByRole('button', { name: /vote on idea/i });
    await expect(voteBtn).toBeVisible();

    // 3. Verify disabled state and tooltip
    await expect(voteBtn).toBeDisabled();
    await expect(voteBtn).toHaveAttribute('title', "You can't vote on your own idea.");
  });

  test('anonymous user clicking vote opens sign-in modal [T-3.19, AC-06.2]', async ({ page }) => {
    // 1. Visit idea detail page logged out
    await page.goto('/idea/offline-first-sync-field-research-teams-a1b2c3');

    // 2. Vote button should have enabled appearance
    const voteBtn = page.getByRole('button', { name: /vote on idea/i });
    await expect(voteBtn).toBeVisible();
    await expect(voteBtn).not.toBeDisabled();

    // 3. Click button -> triggers AuthModal
    await voteBtn.click();

    // 4. Verify AuthModal dialog appears
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal).toContainText(/Sign in to vote/i);
    await expect(modal.locator('#modal-email')).toBeVisible();
    await expect(modal.locator('#modal-password')).toBeVisible();

    // 5. Close modal
    await modal.getByRole('button', { name: /close modal/i }).click();
    await expect(modal).not.toBeVisible();
  });

  test('idea detail page renders QualificationBar with correct ARIA attributes [T-3.22, T-3.23]', async ({
    page,
  }) => {
    await page.goto('/idea/offline-first-sync-field-research-teams-a1b2c3');

    // Verify progressbar exists with valid ARIA semantics
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();
    await expect(progressBar).toHaveAttribute('aria-label', 'Verified votes toward qualification');
    await expect(progressBar).toHaveAttribute('aria-valuemin', '0');

    const valueNow = await progressBar.getAttribute('aria-valuenow');
    expect(parseInt(valueNow || '0', 10)).toBeGreaterThanOrEqual(0);
  });

  test('vote cast and 10-minute retraction flow with BR-014 notice [T-3.9, T-3.14, T-3.18]', async ({
    page,
  }) => {
    // 1. Sign in as qarnia788 and go to unvoted idea
    await page.goto('/login?next=%2Fidea%2Flocally-cached-llm-inference-consumer-gpus-b2c3d4');
    await page.fill('#email', 'qarnia788@gmail.com');
    await page.fill('#password', 'Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/idea\/locally-cached-llm-inference-consumer-gpus-b2c3d4/, {
      timeout: 15000,
    });

    // 2. Locate VoteButton
    const voteBtn = page.getByRole('button', { name: /vote on idea/i });
    await expect(voteBtn).toBeVisible();

    const titleAttr = await voteBtn.getAttribute('title');

    // If not already voted, cast vote and test retraction
    if (titleAttr !== 'You voted for this.') {
      const initialAria = await voteBtn.getAttribute('aria-label');
      const initialVotes = parseInt(initialAria?.match(/\d+/)?.[0] || '0', 10);

      await voteBtn.click();

      // 3. Button enters retractable state within 10m window [T-3.18]
      const retractAffordance = page.getByRole('button', { name: /retract vote/i });
      await expect(retractAffordance).toBeVisible({ timeout: 10000 });

      // Verify count incremented
      await expect(voteBtn).toContainText(String(initialVotes + 1));

      // 4. Retract vote inside 10-minute window
      await retractAffordance.click();

      // 5. Verify toast notification per BR-014
      await expect(page.getByText(/quota slot remains consumed per BR-014/i)).toBeVisible({
        timeout: 10000,
      });

      // 6. Button reverts back to unvoted state
      await expect(retractAffordance).not.toBeVisible();
      await expect(voteBtn).toContainText(String(initialVotes));
    }
  });
});
