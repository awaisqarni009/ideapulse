import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Energy System & Dual-Theme Color Engine', () => {
  const rootDir = process.cwd();

  describe('1. Energy System Architecture & Quests', () => {
    it('defines energy context with default tasks including 30s scroll, daily login, read, and share', () => {
      const contextContent = fs.readFileSync(
        path.join(rootDir, 'lib/energy/energy-context.tsx'),
        'utf8',
      );
      expect(contextContent).toContain('daily_login');
      expect(contextContent).toContain('scroll_30s');
      expect(contextContent).toContain('read_ideas');
      expect(contextContent).toContain('share_idea');
      expect(contextContent).toContain('ENERGY_PER_VOTE = 20');
      expect(contextContent).toContain('MAX_ENERGY = 100');
      expect(contextContent).toContain('consumeEnergyForVote');
      expect(contextContent).toContain('incrementScrollSeconds');
    });

    it('implements ScrollTracker floating widget with 30s active scroll detection', () => {
      const trackerContent = fs.readFileSync(
        path.join(rootDir, 'app/components/energy/scroll-tracker.tsx'),
        'utf8',
      );
      expect(trackerContent).toContain('scroll_30s');
      expect(trackerContent).toContain('targetSeconds = scrollTask?.target ?? 30');
      expect(trackerContent).toContain('isActiveScrolling');
      expect(trackerContent).toContain('Feed Explorer');
      expect(trackerContent).toContain('claimTask');
    });

    it('implements EnergyHubModal with battery gauge, streak counter, and quest rewards', () => {
      const modalContent = fs.readFileSync(
        path.join(rootDir, 'app/components/energy/energy-hub-modal.tsx'),
        'utf8',
      );
      expect(modalContent).toContain('Voting Energy & Daily Quests');
      expect(modalContent).toContain('Energy Reservoir');
      expect(modalContent).toContain('Streak');
      expect(modalContent).toContain('1 Vote = 20 Energy');
    });

    it('implements EnergyBadge in header with live energy and unclaimed reward ping indicator', () => {
      const badgeContent = fs.readFileSync(
        path.join(rootDir, 'app/components/energy/energy-badge.tsx'),
        'utf8',
      );
      expect(badgeContent).toContain('Voting Energy');
      expect(badgeContent).toContain('hasUnclaimedRewards');
      expect(badgeContent).toContain('setIsHubOpen');

      const headerContent = fs.readFileSync(
        path.join(rootDir, 'app/components/ui/header.tsx'),
        'utf8',
      );
      expect(headerContent).toContain('<EnergyBadge />');
    });

    it('connects VoteButton to consume energy before casting votes', () => {
      const voteButtonContent = fs.readFileSync(
        path.join(rootDir, 'app/components/votes/vote-button.tsx'),
        'utf8',
      );
      expect(voteButtonContent).toContain('consumeEnergyForVote');
    });

    it('tracks idea proposal reading and sharing in IdeaActions', () => {
      const ideaActionsContent = fs.readFileSync(
        path.join(rootDir, 'app/idea/[slug]/idea-actions.tsx'),
        'utf8',
      );
      expect(ideaActionsContent).toContain('recordIdeaView');
      expect(ideaActionsContent).toContain('recordIdeaShare');
      expect(ideaActionsContent).toContain('Share');
    });

    it('mounts EnergyProvider and components in RootLayout', () => {
      const layoutContent = fs.readFileSync(path.join(rootDir, 'app/layout.tsx'), 'utf8');
      expect(layoutContent).toContain('<EnergyProvider>');
      expect(layoutContent).toContain('<ScrollTracker />');
      expect(layoutContent).toContain('<EnergyHubModal />');
    });
  });

  describe('2. Dark & Bright Mode Color Fidelity', () => {
    it('maps canvas and ink in tailwind.config.ts to CSS variables so classes adapt dynamically', () => {
      const tailwindConfig = fs.readFileSync(path.join(rootDir, 'tailwind.config.ts'), 'utf8');
      expect(tailwindConfig).toContain("DEFAULT: 'var(--canvas)'");
      expect(tailwindConfig).toContain("deep: 'var(--canvas-deep)'");
      expect(tailwindConfig).toContain("solid: 'var(--surface-solid)'");
      expect(tailwindConfig).toContain("1: 'var(--text-primary)'");
      expect(tailwindConfig).toContain("2: 'var(--text-secondary)'");
      expect(tailwindConfig).toContain("3: 'var(--text-tertiary)'");
    });

    it('defines distinct contrast tokens for bright mode (:root) and dark mode (.dark)', () => {
      const globalsCss = fs.readFileSync(path.join(rootDir, 'app/globals.css'), 'utf8');
      expect(globalsCss).toContain('--canvas: #f8fafc;'); // bright mode
      expect(globalsCss).toContain('--canvas: #0b0f19;'); // dark mode
      expect(globalsCss).toContain('--text-primary: #0f172a;'); // bright mode
      expect(globalsCss).toContain('--text-primary: #f1f4fb;'); // dark mode
      expect(globalsCss).toContain('transition:');
      expect(globalsCss).toContain('background-color var(--dur-sm) var(--ease-standard)');
    });
  });
});
