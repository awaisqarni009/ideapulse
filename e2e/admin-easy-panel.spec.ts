import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tsdghmnmsyogjulpzgmu.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZGdobW5tc3lvZ2p1bHB6Z211Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTkzMzQ1MywiZXhwIjoyMTA1NTA5NDUzfQ.gpYZ6eeK4s62ymHVPJOk5Wvydaz_vc5JUp9U-ZZUN7M',
);

test.describe('Admin Easy Command Center Verification', () => {
  test.setTimeout(90000);
  const timestamp = Date.now();
  const adminEmail = `admin_tester_${timestamp}@ideapulse.dev`;
  const adminPassword = 'AdminPassword123!Secure';
  const adminUsername = `adm_${timestamp.toString().slice(-6)}`;
  let adminId: string | null = null;

  test.beforeAll(async () => {
    // 1. Create auth user with confirmed email
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { username: adminUsername },
    });
    if (error || !data.user) throw error || new Error('Failed to create test admin');
    adminId = data.user.id;

    // 2. Set role to 'admin' in profiles table
    await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('id', adminId);
  });

  test.afterAll(async () => {
    if (adminId) {
      await supabaseAdmin.from('profiles').delete().eq('id', adminId);
      await supabaseAdmin.auth.admin.deleteUser(adminId);
    }
  });

  test('verifies admin command center tabs, cycle controls, ideas moderation deck, and user directory', async ({
    page,
  }) => {
    // Step 1: Login as administrator
    await page.goto('/login');
    await page.fill('input[name="email"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.locator('form button[type="submit"]').click();
    await page.waitForURL(/\/(feed|dashboard)?$/, { timeout: 15000 });

    // Step 2: Navigate to /admin
    await page.goto('/admin');
    await expect(page.locator('h1')).toContainText(/Master Admin Command Center/i, {
      timeout: 10000,
    });

    // Step 3: Check Top KPI Cards
    await expect(page.getByText('Active Cycle', { exact: true })).toBeVisible();
    await expect(page.getByText('Community Accounts', { exact: true })).toBeVisible();

    // Step 4: Verify Tab 1 (Cycle Operations)
    await expect(page.getByRole('heading', { name: 'Active Cycle Control' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Start a New Cycle' })).toBeVisible();
    await expect(page.locator('label:has-text("Cycle Number")')).toBeVisible();
    await expect(page.locator('button:has-text("7d")')).toBeVisible();
    await expect(page.locator('button:has-text("Start Cycle #")')).toBeVisible();

    // Step 5: Switch to Tab 2 (Ideas & Votes Moderation)
    const ideasTab = page.locator('button:has-text("Ideas & Votes Moderation")');
    await ideasTab.click();
    await expect(page.locator('text=Proposals & Idea Moderation Deck')).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator('input[placeholder*="Search title, author"]')).toBeVisible();
    await expect(page.locator('button:has-text("All Proposals")')).toBeVisible();
    await expect(page.locator('button:has-text("Needs Review")')).toBeVisible();

    // Step 6: Switch to Tab 3 (Users & Roles)
    const usersTab = page.locator('button:has-text("Users & Roles")');
    await usersTab.click();
    await expect(page.locator('text=User Directory & Access Control')).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator('button:has-text("Add New User")')).toBeVisible();
    await expect(page.locator('th:has-text("User Identity")')).toBeVisible();
    await expect(page.locator('th:has-text("Assigned Role")')).toBeVisible();

    // Test Add New User modal trigger
    await page.locator('button:has-text("Add New User")').click();
    await expect(page.locator('text=Add New Platform User')).toBeVisible();
    await expect(page.locator('label:has-text("Email Address")')).toBeVisible();
    await page.locator('button:has-text("Cancel")').click();
    await expect(page.locator('text=Add New Platform User')).not.toBeVisible();

    // Step 7: Switch to Tab 4 (3D Telemetry & Logs)
    const telemetryTab = page.locator('button:has-text("3D Telemetry & Logs")');
    await telemetryTab.click();
    await expect(page.locator('text=Connected Admin Modules')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Recent Admin Actions')).toBeVisible();
    await expect(page.locator('text=Connected Admin Modules')).toBeVisible();
    await expect(page.locator('text=Reports Queue').first()).toBeVisible();
  });
});
