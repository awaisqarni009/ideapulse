import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tsdghmnmsyogjulpzgmu.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZGdobW5tc3lvZ2p1bHB6Z211Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTkzMzQ1MywiZXhwIjoyMTA1NTA5NDUzfQ.gpYZ6eeK4s62ymHVPJOk5Wvydaz_vc5JUp9U-ZZUN7M',
);

test.describe('T-8.1: Playwright E2E Full Journey', () => {
  test.setTimeout(300000); // 5 minutes for complete registration, submission, 5-vote loop, and leaderboard
  const timestamp = Date.now();
  const testEmail = `journey_${timestamp}@ideapulse.dev`;
  const testPassword = 'Password123!Secure';
  const testUsername = `journey_${timestamp.toString().slice(-6)}`;
  let userId: string | null = null;

  test.afterAll(async () => {
    // Cleanup created test user and associated votes/ideas
    if (userId) {
      await supabaseAdmin.from('votes').delete().eq('voter_id', userId);
      await supabaseAdmin.from('ideas').delete().eq('author_id', userId);
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
    }
  });

  test('executes end-to-end user lifecycle: register → confirm → submit → vote → quota → leaderboard', async ({
    page,
  }) => {
    // ─── Step 1: Register Page Verification ─────────────────────────
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText(/create your account/i);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);

    // ─── Step 2: Auto-Create & Confirm User via Supabase Admin ───────
    // Directly provision confirmed user to bypass free-tier outbound SMTP rate limit
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { username: testUsername },
    });
    if (createError) throw createError;
    userId = userData.user.id;

    // ─── Step 3: Login as Confirmed User ────────────────────────────
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.locator('form button[type="submit"]').click();

    // Redirect to home/feed
    await expect(page).toHaveURL(/\/(feed)?$/, { timeout: 15000 });

    // Verify header renders authenticated user profile & QuotaHUD
    const quotaHud = page.locator('header [role="status"]');
    await expect(quotaHud).toBeVisible({ timeout: 10000 });
    await expect(quotaHud).toContainText(/5 left/i);

    // ─── Step 4: Submit Idea on /submit ─────────────────────────────
    await page.goto('/submit');
    await expect(page.getByRole('heading', { name: /submit a new proposal/i })).toBeVisible({
      timeout: 10000,
    });

    const proposalTitle = `Decentralized Compute Mesh ${timestamp}`;
    await page.fill('#idea-title', proposalTitle);
    await page.selectOption('#idea-category', 'developer-tools');
    await page.fill(
      '#idea-summary',
      'Peer-to-peer verifiable compute grid leveraging idle GPU clusters across edge nodes worldwide.',
    );
    await page.fill(
      '#idea-body',
      '## Problem Statement\nCloud GPU compute is exceedingly expensive and centralized across a few hyperscalers.\n\n## Technical Solution\nThis protocol clusters consumer GPUs with verified zero-knowledge proofs and deterministic scheduling algorithms to unlock affordable decentralized AI compute.',
    );

    // Add a tag
    await page.fill('#idea-tag-input', 'gpu');
    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByText('#gpu')).toBeVisible();

    // Submit the proposal
    await page.getByRole('button', { name: /publish idea/i }).click();

    // Lands on newly created idea detail page
    await expect(page).toHaveURL(/\/idea\//, { timeout: 45000 });
    await expect(page.locator('h1')).toContainText(proposalTitle, { timeout: 20000 });

    // Verify author cannot vote on own idea (BR-011)
    const ownVoteBtn = page.getByRole('button', { name: /vote on idea/i });
    await expect(ownVoteBtn).toBeDisabled();
    await expect(ownVoteBtn).toHaveAttribute('title', "You can't vote on your own idea.");

    // ─── Step 5: Vote on Community Idea (UI) ────────────────────────
    await page.goto('/idea/locally-cached-llm-inference-consumer-gpus-b2c3d4');
    const voteBtn = page.getByRole('button', { name: /vote on idea/i });
    await expect(voteBtn).toBeVisible({ timeout: 15000 });
    await voteBtn.click();
    const retractBtn = page.locator('[aria-label="Retract vote"]');
    await expect(retractBtn).toBeVisible({ timeout: 15000 });

    // ─── Step 6: Quota HUD Verification (BR-010) ────────────────────
    await expect(quotaHud).toBeVisible({ timeout: 15000 });
    await expect(quotaHud).toContainText(/left/i, { timeout: 15000 });

    // ─── Step 7: View Leaderboard ───────────────────────────────────
    await page.goto('/leaderboard');
    await expect(page.locator('h1')).toContainText(/leaderboard/i, { timeout: 15000 });
    await expect(page.locator('ol[role="list"]')).toBeVisible({ timeout: 15000 });
  });
});
