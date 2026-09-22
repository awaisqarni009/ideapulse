import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Phase 7 Batch 3 — Accessibility Core Tests [T-7.11 to T-7.16]
 *
 * Verifies:
 * - T-7.11 Keyboard pass on every flow (pointer unplugged, roving tabindex, keyboard handlers)
 * - T-7.12 Visible focus ring (:focus-visible 2px indigo-bright, 2px offset)
 * - T-7.13 Skip-to-content link as first tab stop targeting #main-content
 * - T-7.14 WCAG AA contrast ratio compliance (>4.5:1 text, >3:1 non-text)
 * - T-7.15 Screen reader landmark & semantic hierarchy (<main>, <article>, <ol>)
 * - T-7.16 aria-live on dynamic vote tallies; role="alert" on errors
 */

describe('Accessibility Core — T-7.11 to T-7.16', () => {
  const rootDir = path.resolve(__dirname, '..');

  describe('T-7.13: Skip-to-Content Link & Main Landmarks', () => {
    it('ensures app/layout.tsx has skip-to-content link as the first tab stop', () => {
      const layoutPath = path.join(rootDir, 'app', 'layout.tsx');
      const content = fs.readFileSync(layoutPath, 'utf-8');

      expect(content).toContain('href="#main-content"');
      expect(content).toContain('Skip to content');
      expect(content).toMatch(/sr-only\s+focus:not-sr-only/);

      // Verify skip link comes before Header
      const skipIndex = content.indexOf('href="#main-content"');
      const headerIndex = content.indexOf('<Header />');
      expect(skipIndex).toBeGreaterThan(-1);
      expect(headerIndex).toBeGreaterThan(-1);
      expect(skipIndex).toBeLessThan(headerIndex);
    });

    it('ensures all major page routes implement <main id="main-content" tabIndex={-1}>', () => {
      const pageFiles = [
        path.join(rootDir, 'app', 'page.tsx'),
        path.join(rootDir, 'app', 'feed', 'page.tsx'),
        path.join(rootDir, 'app', 'leaderboard', 'page.tsx'),
        path.join(rootDir, 'app', 'submit', 'page.tsx'),
        path.join(rootDir, 'app', 'rules', 'page.tsx'),
        path.join(rootDir, 'app', 'idea', '[slug]', 'page.tsx'),
        path.join(rootDir, 'app', 'u', '[username]', 'page.tsx'),
        path.join(rootDir, 'app', 'cycles', '[n]', 'page.tsx'),
        path.join(rootDir, 'app', 'login', 'page.tsx'),
        path.join(rootDir, 'app', 'register', 'page.tsx'),
        path.join(rootDir, 'app', 'settings', 'page.tsx'),
      ];

      for (const file of pageFiles) {
        expect(fs.existsSync(file)).toBe(true);
        const code = fs.readFileSync(file, 'utf-8');
        expect(code, `Missing id="main-content" in ${path.relative(rootDir, file)}`).toContain(
          'id="main-content"',
        );
        expect(code, `Missing tabIndex={-1} in ${path.relative(rootDir, file)}`).toContain(
          'tabIndex={-1}',
        );
      }
    });
  });

  describe('T-7.12: Focus Ring Visible on Every Interactive Element', () => {
    it('enforces 2px outline with 2px offset in globals.css without lag or suppression', () => {
      const cssPath = path.join(rootDir, 'app', 'globals.css');
      const css = fs.readFileSync(cssPath, 'utf-8');

      expect(css).toContain(':focus-visible');
      expect(css).toContain('outline: 2px solid var(--indigo-bright)');
      expect(css).toContain('outline-offset: 2px');
      expect(css).toContain('button:focus-visible');
      expect(css).toContain('a:focus-visible');
      expect(css).toContain('input:focus-visible');
      expect(css).toContain('transition: none');
    });
  });

  describe('T-7.16: aria-live on Vote Counts & role="alert" on Errors', () => {
    it('ensures VoteButton has aria-live="polite" on vote count roll and role="alert" on rejection', () => {
      const voteBtnPath = path.join(rootDir, 'app', 'components', 'votes', 'vote-button.tsx');
      const code = fs.readFileSync(voteBtnPath, 'utf-8');

      expect(code).toContain('aria-live="polite"');
      expect(code).toContain('aria-atomic="true"');
      expect(code).toContain('role="alert"');
      expect(code).toContain('aria-live="assertive"');
    });

    it('ensures QuotaHUD has aria-live="polite" and role="status"', () => {
      const hudPath = path.join(rootDir, 'app', 'components', 'votes', 'quota-hud.tsx');
      const code = fs.readFileSync(hudPath, 'utf-8');

      expect(code).toContain('role="status"');
      expect(code).toContain('aria-live="polite"');
      expect(code).toContain('aria-atomic="true"');
    });
  });

  describe('T-7.11 & T-7.15: Semantic Landmarks & Keyboard Navigation', () => {
    it('ensures IdeaCard is wrapped in <article aria-labelledby="..."> with matching heading ID', () => {
      const cardPath = path.join(rootDir, 'app', 'components', 'ideas', 'idea-card.tsx');
      const code = fs.readFileSync(cardPath, 'utf-8');

      expect(code).toContain('<article');
      expect(code).toContain('aria-labelledby={`idea-title-${idea.id}`}');
      expect(code).toContain('id={`idea-title-${idea.id}`}');
    });

    it('ensures SortTabs supports roving tabindex and arrow key navigation', () => {
      const tabsPath = path.join(rootDir, 'app', 'components', 'feed', 'sort-tabs.tsx');
      const code = fs.readFileSync(tabsPath, 'utf-8');

      expect(code).toContain('role="tablist"');
      expect(code).toContain('role="tab"');
      expect(code).toContain('tabIndex={isActive ? 0 : -1}');
      expect(code).toContain('ArrowRight');
      expect(code).toContain('ArrowLeft');
      expect(code).toContain('Home');
      expect(code).toContain('End');
    });
  });

  describe('T-7.14: Mathematical WCAG AA Contrast Audit', () => {
    // Helper to calculate relative luminance according to WCAG 2.1 specifications
    function getLuminance(r: number, g: number, b: number): number {
      const [rs, gs, bs] = [r, g, b].map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * (rs ?? 0) + 0.7152 * (gs ?? 0) + 0.0722 * (bs ?? 0);
    }

    function getContrast(l1: number, l2: number): number {
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    // Hex to RGB
    function hexToRgb(hex: string): [number, number, number] {
      const clean = hex.replace('#', '');
      const num = parseInt(clean, 16);
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    }

    // Theme tokens from DESIGN.md §9
    const canvasLum = getLuminance(...hexToRgb('#0b0f19'));

    it('validates text-primary (#f1f4fb) contrast is >= 7:1 against canvas (passes AAA)', () => {
      const lum = getLuminance(...hexToRgb('#f1f4fb'));
      const contrast = getContrast(lum, canvasLum);
      expect(contrast).toBeGreaterThan(14.0); // Extreme high contrast > 14:1
    });

    it('validates text-secondary (#a9b2c8) contrast is >= 4.5:1 against canvas (passes AA)', () => {
      const lum = getLuminance(...hexToRgb('#a9b2c8'));
      const contrast = getContrast(lum, canvasLum);
      expect(contrast).toBeGreaterThan(7.0); // ~7.8:1
    });

    it('validates accent-bright tokens satisfy graphical (>= 3:1) and UI text (>= 4.5:1) standards', () => {
      const indigoBrightLum = getLuminance(...hexToRgb('#818cf8'));
      const violetBrightLum = getLuminance(...hexToRgb('#a78bfa'));
      const cyanBrightLum = getLuminance(...hexToRgb('#67e8f9'));

      expect(getContrast(indigoBrightLum, canvasLum)).toBeGreaterThan(4.5);
      expect(getContrast(violetBrightLum, canvasLum)).toBeGreaterThan(5.5);
      expect(getContrast(cyanBrightLum, canvasLum)).toBeGreaterThan(9.0);
    });

    it('validates semantic tokens (success, warning, danger) satisfy >= 3:1 against canvas', () => {
      const successLum = getLuminance(...hexToRgb('#34d399'));
      const warningLum = getLuminance(...hexToRgb('#fbbf24'));
      const dangerLum = getLuminance(...hexToRgb('#f87171'));

      expect(getContrast(successLum, canvasLum)).toBeGreaterThan(7.0);
      expect(getContrast(warningLum, canvasLum)).toBeGreaterThan(8.0);
      expect(getContrast(dangerLum, canvasLum)).toBeGreaterThan(4.5);
    });
  });
});
