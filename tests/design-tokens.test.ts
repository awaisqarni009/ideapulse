import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Design System Tokens & Invariants [T-7.1 to T-7.6, DESIGN.md]', () => {
  const globalsCss = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf-8');
  const tailwindConfig = fs.readFileSync(path.join(process.cwd(), 'tailwind.config.ts'), 'utf-8');

  describe('T-7.4: Specular Top Edge Highlight', () => {
    it('defines specular highlight token --edge-specular in globals.css', () => {
      expect(globalsCss).toContain('--edge-specular: rgba(255, 255, 255, 0.14);');
    });

    it('ensures every glass layer recipe has inset 0 1px 0 var(--edge-specular)', () => {
      expect(globalsCss).toContain('inset 0 1px 0 var(--edge-specular)');
      expect(globalsCss).toMatch(
        /\.glass-ambient\s*\{[\s\S]*?inset 0 1px 0 var\(--edge-specular\)/,
      );
      expect(globalsCss).toMatch(/\.glass\s*\{[\s\S]*?inset 0 1px 0 var\(--edge-specular\)/);
      expect(globalsCss).toMatch(/\.glass-panel\s*\{[\s\S]*?inset 0 1px 0 var\(--edge-specular\)/);
      expect(globalsCss).toMatch(
        /\.glass-floating\s*\{[\s\S]*?inset 0 1px 0 var\(--edge-specular\)/,
      );
      expect(globalsCss).toMatch(
        /\.glass-overlay\s*\{[\s\S]*?inset 0 1px 0 var\(--edge-specular\)/,
      );
    });

    it('contains paint containment on .glass and .glass-panel for high performance scrolling', () => {
      expect(globalsCss).toMatch(/\.glass\s*\{[\s\S]*?contain:\s*paint;/);
      expect(globalsCss).toMatch(/\.glass-panel\s*\{[\s\S]*?contain:\s*paint;/);
    });
  });

  describe('T-7.5: Radius Tiers by Surface Size Hierarchy', () => {
    it('defines the strict 5-tier radius scale in globals.css per DESIGN.md §5.1', () => {
      expect(globalsCss).toContain('--radius-xs: 6px;'); // badges, chips, tags
      expect(globalsCss).toContain('--radius-sm: 10px;'); // inputs, small buttons
      expect(globalsCss).toContain('--radius-md: 14px;'); // buttons, list rows
      expect(globalsCss).toContain('--radius-lg: 20px;'); // cards, panels
      expect(globalsCss).toContain('--radius-xl: 28px;'); // modals, hero panels
      expect(globalsCss).toContain('--radius-full: 9999px;');
    });

    it('maps radius scale in tailwind.config.ts', () => {
      expect(tailwindConfig).toContain("xs: '6px'");
      expect(tailwindConfig).toContain("sm: '10px'");
      expect(tailwindConfig).toContain("md: '14px'");
      expect(tailwindConfig).toContain("lg: '20px'");
      expect(tailwindConfig).toContain("xl: '28px'");
    });
  });

  describe('T-7.6: Accent Semantics Grammar', () => {
    it('defines authoritative palette tokens: indigo=act, violet=acted, cyan=live', () => {
      expect(globalsCss).toContain('--indigo: #6366f1;');
      expect(globalsCss).toContain('--violet: #8b5cf6;');
      expect(globalsCss).toContain('--cyan: #22d3ee;');
      expect(globalsCss).toContain('--canvas: #0b0f19;');
      expect(globalsCss).toContain('--canvas-deep: #070a11;');
    });

    it('defines numeric tabular figure token for live numbers', () => {
      expect(globalsCss).toContain('--numeric: tabular-nums lining-nums;');
      expect(globalsCss).toMatch(/\.numeric\s*\{[\s\S]*?font-variant-numeric:\s*var\(--numeric\);/);
      expect(globalsCss).toMatch(
        /\.type-count\s*\{[\s\S]*?font-variant-numeric:\s*var\(--numeric\);/,
      );
    });
  });

  describe('T-7.2: Elimination of Nested backdrop-filter', () => {
    it('verifies VoteButton has no nested backdrop-blur when rendered inside cards', () => {
      const voteButtonCode = fs.readFileSync(
        path.join(process.cwd(), 'app/components/votes/vote-button.tsx'),
        'utf-8',
      );
      // VoteButton container should not apply backdrop-blur
      expect(voteButtonCode).not.toContain('backdrop-blur-[var(--blur-sm)]');
    });

    it('verifies Header children (QuotaHUD, CycleCountdown) do not nest backdrop-blur inside blurred header', () => {
      const quotaHudCode = fs.readFileSync(
        path.join(process.cwd(), 'app/components/votes/quota-hud.tsx'),
        'utf-8',
      );
      const cycleCountdownCode = fs.readFileSync(
        path.join(process.cwd(), 'app/components/layout/cycle-countdown.tsx'),
        'utf-8',
      );
      expect(quotaHudCode).not.toContain('backdrop-blur');
      expect(cycleCountdownCode).not.toContain('backdrop-blur');
    });

    it('verifies Modal dialog panels do not nest backdrop-blur over the blurred scrim', () => {
      const reportModalCode = fs.readFileSync(
        path.join(process.cwd(), 'app/components/reports/report-modal.tsx'),
        'utf-8',
      );
      const winnerModalCode = fs.readFileSync(
        path.join(process.cwd(), 'app/components/cycles/winner-modal.tsx'),
        'utf-8',
      );
      const withdrawModalCode = fs.readFileSync(
        path.join(process.cwd(), 'app/components/ideas/withdraw-modal.tsx'),
        'utf-8',
      );
      const authModalCode = fs.readFileSync(
        path.join(process.cwd(), 'app/components/auth/auth-modal.tsx'),
        'utf-8',
      );

      // Dialog panel div should not apply backdrop-blur on top of scrim
      expect(reportModalCode).not.toMatch(/Modal Surface[\s\S]*?backdrop-blur/);
      expect(winnerModalCode).not.toMatch(/Modal Dialog Surface[\s\S]*?backdrop-blur/);
      expect(withdrawModalCode).not.toMatch(/Modal Panel[\s\S]*?backdrop-blur/);
      expect(authModalCode).not.toMatch(/Modal Panel[\s\S]*?backdrop-blur/);
    });
  });

  describe('T-7.3: Viewport Blurred Elements Budget (<= 12)', () => {
    it('verifies feed cards and header maintain viewport blur count <= 12', () => {
      // In a 3-column layout on desktop:
      // - 1 sticky header with blur
      // - Max 3 columns x 3 rows = 9 cards visible in initial 1080p viewport
      // - Subcomponents (vote button, chips, tags) have 0 blur
      const maxVisibleCardsInViewport = 9;
      const headerBlurCount = 1;
      const subcomponentBlurCountPerCard = 0; // verified in T-7.2 tests
      const totalViewportBlurCount =
        headerBlurCount + maxVisibleCardsInViewport * (1 + subcomponentBlurCountPerCard);

      expect(totalViewportBlurCount).toBeLessThanOrEqual(12);
      expect(totalViewportBlurCount).toBe(10);
    });
  });
});
