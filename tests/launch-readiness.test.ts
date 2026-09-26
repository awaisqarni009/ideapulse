import { describe, it, expect } from 'vitest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import fs from 'fs';
import path from 'path';

process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tsdghmnmsyogjulpzgmu.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZGdobW5tc3lvZ2p1bHB6Z211Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTkzMzQ1MywiZXhwIjoyMTA1NTA5NDUzfQ.gpYZ6eeK4s62ymHVPJOk5Wvydaz_vc5JUp9U-ZZUN7M';

describe('T-8.25 – T-8.31: Launch Readiness & Pre-Flight Verification Suite', () => {
  const rootDir = process.cwd();

  it('T-8.25: /rules page contains all required protocol sections and error codes matching RULES.md', () => {
    const rulesPagePath = path.join(rootDir, 'app/rules/page.tsx');
    expect(fs.existsSync(rulesPagePath)).toBe(true);

    const content = fs.readFileSync(rulesPagePath, 'utf-8');
    // Verify core rule coverage
    expect(content).toContain('BR-001');
    expect(content).toContain('BR-002');
    expect(content).toContain('BR-003');
    expect(content).toContain('BR-004');
    expect(content).toContain('BR-010');
    expect(content).toContain('BR-011');
    expect(content).toContain('BR-012');
    expect(content).toContain('BR-014');
    expect(content).toContain('BR-020');
    expect(content).toContain('BR-022');
    expect(content).toContain('BR-035');
    expect(content).toContain('BR-045');
    expect(content).toContain('BR-046');
    expect(content).toContain('BR-047');

    // Verify error code mappings
    expect(content).toContain('IP_UNAUTHENTICATED');
    expect(content).toContain('IP_VOTE_QUOTA');
    expect(content).toContain('IP_DUPLICATE_VOTE');
    expect(content).toContain('IP_SELF_VOTE');
    expect(content).toContain('IP_RETRACTION_WINDOW_CLOSED');
    expect(content).toContain('IP_SUBMIT_COOLDOWN');
  });

  it('T-8.26: Privacy Policy and Terms of Incubation are published with zero-raw-IP (BR-035) commitments', () => {
    const privacyPath = path.join(rootDir, 'app/privacy/page.tsx');
    const termsPath = path.join(rootDir, 'app/terms/page.tsx');
    expect(fs.existsSync(privacyPath)).toBe(true);
    expect(fs.existsSync(termsPath)).toBe(true);

    const privacyContent = fs.readFileSync(privacyPath, 'utf-8');
    expect(privacyContent).toContain('BR-035');
    expect(privacyContent).toContain('Zero Raw IP');
    expect(privacyContent).toContain('daily_salt');
    expect(privacyContent).toContain('Row Level Security');

    const termsContent = fs.readFileSync(termsPath, 'utf-8');
    expect(termsContent).toContain('Terms of Incubation');
    expect(termsContent).toContain('Anti-Sybil');
    expect(termsContent).toContain('BR-010');
    expect(termsContent).toContain('BR-045');
  });

  it('T-8.27: robots.ts generates correct crawler directives and sitemap link', () => {
    const robotsConfig = robots();
    expect(robotsConfig.rules).toBeDefined();

    const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules;
    expect(rules).toBeDefined();
    if (!rules) throw new Error('Rules undefined');

    expect(rules.allow).toBe('/');
    expect(rules.disallow).toContain('/admin/');
    expect(rules.disallow).toContain('/api/');
    expect(rules.disallow).toContain('/settings');
    expect(robotsConfig.sitemap).toContain('/sitemap.xml');
  });

  it('T-8.27: sitemap.ts generates valid routes including core static pages and dynamic entries', async () => {
    const siteMapEntries = await sitemap();
    expect(Array.isArray(siteMapEntries)).toBe(true);
    expect(siteMapEntries.length).toBeGreaterThanOrEqual(9);

    const urls = siteMapEntries.map((e) => e.url);
    expect(urls.some((u) => u.endsWith('/feed'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/leaderboard'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/rules'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/privacy'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/terms'))).toBe(true);
  });

  it('T-8.27: Dynamic OpenGraph API generator (/api/og) and metadata are configured', () => {
    const ogPath = path.join(rootDir, 'app/api/og/route.tsx');
    expect(fs.existsSync(ogPath)).toBe(true);

    const ogContent = fs.readFileSync(ogPath, 'utf-8');
    expect(ogContent).toContain('ImageResponse');
    expect(ogContent).toContain("runtime = 'edge'");
    expect(ogContent).toContain('IdeaPulse');

    const layoutPath = path.join(rootDir, 'app/layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    expect(layoutContent).toContain('openGraph');
    expect(layoutContent).toContain('twitter');
  });

  it('T-8.28: Support email routing and operational SLA runbook is documented', () => {
    const supportDocPath = path.join(rootDir, 'docs/support.md');
    expect(fs.existsSync(supportDocPath)).toBe(true);

    const supportContent = fs.readFileSync(supportDocPath, 'utf-8');
    expect(supportContent).toContain('support@ideapulse.dev');
    expect(supportContent).toContain('SLA');
    expect(supportContent).toContain('abuse_events');
  });

  it('T-8.29: Rollback procedure and zero-downtime database migration runbook is documented', () => {
    const rollbackDocPath = path.join(rootDir, 'docs/rollback.md');
    expect(fs.existsSync(rollbackDocPath)).toBe(true);

    const rollbackContent = fs.readFileSync(rollbackDocPath, 'utf-8');
    expect(rollbackContent).toContain('Vercel');
    expect(rollbackContent).toContain('Instant Rollback');
    expect(rollbackContent).toContain('Additive-Only');
    expect(rollbackContent).toContain('Point-In-Time Recovery');
  });

  it('T-8.30 & T-8.31: Post-launch watch and exit gate verification runbook is documented', () => {
    const watchDocPath = path.join(rootDir, 'docs/post-launch-watch.md');
    expect(fs.existsSync(watchDocPath)).toBe(true);

    const watchContent = fs.readFileSync(watchDocPath, 'utf-8');
    expect(watchContent).toContain('48-Hour Monitoring');
    expect(watchContent).toContain('abuse_events');
    expect(watchContent).toContain('Exit Gate Checklist');
    expect(watchContent).toContain('READY FOR LAUNCH');
  });
});
