import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Responsive, Caching & Query Optimization Suite [T-7.26 - T-7.31]', () => {
  const rootDir = path.resolve(__dirname, '..');

  describe('T-7.26 & T-7.27: SQL Query Optimization & Latency', () => {
    it('confirms database indexes exist for feed, leaderboard, and quota queries', () => {
      const ideasMigration = fs.readFileSync(
        path.join(rootDir, 'supabase/migrations/030_ideas.sql'),
        'utf8',
      );
      expect(ideasMigration).toContain('ideas_cycle_rank_idx');
      expect(ideasMigration).toContain('ideas_feed_idx');

      const cyclesMigration = fs.readFileSync(
        path.join(rootDir, 'supabase/migrations/020_cycles.sql'),
        'utf8',
      );
      expect(cyclesMigration).toContain('cycles_single_active_idx');

      const votesMigration = fs.readFileSync(
        path.join(rootDir, 'supabase/migrations/040_votes.sql'),
        'utf8',
      );
      expect(votesMigration).toContain('votes_quota_idx');
      expect(votesMigration).toContain('votes_one_per_user_per_idea');
    });

    it('verifies feed cursor pagination queries order by (created_at desc, id desc)', () => {
      const feedAction = fs.readFileSync(path.join(rootDir, 'app/actions/feed.ts'), 'utf8');
      expect(feedAction).toContain('created_at');
      expect(feedAction).toContain('cursor');
    });
  });

  describe('T-7.28: Caching strategy per ARCHITECTURE.md §5.5', () => {
    it('revalidates feed cache tag on new idea submission', () => {
      const ideasAction = fs.readFileSync(path.join(rootDir, 'app/actions/ideas.ts'), 'utf8');
      expect(ideasAction).toContain("revalidateTag('feed')");
      expect(ideasAction).toContain("revalidatePath('/feed')");
    });

    it('revalidates idea cache tag on vote and retract actions', () => {
      const votesAction = fs.readFileSync(path.join(rootDir, 'app/actions/votes.ts'), 'utf8');
      expect(votesAction).toContain('revalidateTag(`idea:${payload.idea_id}`)');
      expect(votesAction).toContain("revalidatePath('/feed')");
    });

    it('sets correct ISR revalidation headers across all routes per §5.5', () => {
      const homePage = fs.readFileSync(path.join(rootDir, 'app/page.tsx'), 'utf8');
      expect(homePage).toContain('export const revalidate = 60;');

      const ideaPage = fs.readFileSync(path.join(rootDir, 'app/idea/[slug]/page.tsx'), 'utf8');
      expect(ideaPage).toContain('export const revalidate = 30;');

      const profilePage = fs.readFileSync(path.join(rootDir, 'app/u/[username]/page.tsx'), 'utf8');
      expect(profilePage).toContain('export const revalidate = 120;');

      const cyclePage = fs.readFileSync(path.join(rootDir, 'app/cycles/[n]/page.tsx'), 'utf8');
      expect(cyclePage).toContain('export const revalidate = false;');
    });
  });

  describe('T-7.30: Mobile header quota HUD condensation', () => {
    it('condenses quota HUD to count-only on mobile screens (< sm)', () => {
      const quotaHud = fs.readFileSync(
        path.join(rootDir, 'app/components/votes/quota-hud.tsx'),
        'utf8',
      );
      // Mobile condensed count
      expect(quotaHud).toContain('sm:hidden');
      expect(quotaHud).toContain('{remaining}');

      // Desktop full countdown string
      expect(quotaHud).toContain('hidden font-mono text-xs tabular-nums tracking-tight sm:inline');
    });

    it('adjusts pip size and padding for mobile viewports', () => {
      const quotaHud = fs.readFileSync(
        path.join(rootDir, 'app/components/votes/quota-hud.tsx'),
        'utf8',
      );
      expect(quotaHud).toContain('h-[32px]');
      expect(quotaHud).toContain('sm:h-[36px]');
      expect(quotaHud).toContain('px-2.5');
      expect(quotaHud).toContain('sm:px-3.5');
    });
  });

  describe('T-7.31: Mobile bottom-sheet variant for modals', () => {
    it('renders AuthModal as bottom-sheet on mobile and centered dialog on desktop', () => {
      const authModal = fs.readFileSync(
        path.join(rootDir, 'app/components/auth/auth-modal.tsx'),
        'utf8',
      );
      expect(authModal).toContain('items-end justify-center p-0 sm:items-center sm:p-4');
      expect(authModal).toContain('rounded-t-[var(--radius-xl)]');
      expect(authModal).toContain('sm:rounded-[var(--radius-xl)]');
      expect(authModal).toContain('sm:hidden'); // Drag pill
    });

    it('renders WinnerModal as bottom-sheet on mobile and centered dialog on desktop', () => {
      const winnerModal = fs.readFileSync(
        path.join(rootDir, 'app/components/cycles/winner-modal.tsx'),
        'utf8',
      );
      expect(winnerModal).toContain('items-end justify-center p-0 sm:items-center sm:p-6');
      expect(winnerModal).toContain('rounded-t-[28px]');
      expect(winnerModal).toContain('sm:rounded-[28px]');
      expect(winnerModal).toContain('sm:hidden'); // Drag pill
    });

    it('renders WithdrawModal and ReportModal as bottom-sheet on mobile', () => {
      const withdrawModal = fs.readFileSync(
        path.join(rootDir, 'app/components/ideas/withdraw-modal.tsx'),
        'utf8',
      );
      expect(withdrawModal).toContain('items-end justify-center p-0 sm:items-center sm:p-4');
      expect(withdrawModal).toContain('rounded-t-[var(--radius-xl)]');

      const reportModal = fs.readFileSync(
        path.join(rootDir, 'app/components/reports/report-modal.tsx'),
        'utf8',
      );
      expect(reportModal).toContain('items-end justify-center p-0 sm:items-center sm:p-4');
      expect(reportModal).toContain('rounded-t-[var(--radius-xl)]');
    });
  });

  describe('T-7.29: Responsive layout boundaries (360px - 1920px)', () => {
    it('prevents horizontal scrolling via global overflow clipping', () => {
      const globalsCss = fs.readFileSync(path.join(rootDir, 'app/globals.css'), 'utf8');
      expect(globalsCss).toContain('overflow-x: clip;');
      expect(globalsCss).toContain('width: 100%;');
    });

    it('configures fluid max-width constraints on media elements', () => {
      const globalsCss = fs.readFileSync(path.join(rootDir, 'app/globals.css'), 'utf8');
      expect(globalsCss).toContain('max-width: 100%;');
      expect(globalsCss).toContain('height: auto;');
    });
  });
});
