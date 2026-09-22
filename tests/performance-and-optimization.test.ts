import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Performance & Optimization Suite [T-7.22, T-7.23, T-7.24, T-7.25]', () => {
  const rootDir = path.resolve(__dirname, '..');

  describe('T-7.24: next/image everywhere with correct sizes', () => {
    it('configures remotePatterns in next.config.mjs for secure image loading', () => {
      const configPath = path.join(rootDir, 'next.config.mjs');
      const content = fs.readFileSync(configPath, 'utf8');
      expect(content).toContain('images:');
      expect(content).toContain('remotePatterns:');
      expect(content).toContain('avatars.githubusercontent.com');
      expect(content).toContain('lh3.googleusercontent.com');
    });

    it('ensures ZERO raw <img> tags exist in app directory', () => {
      function scanDirForImg(dir: string): string[] {
        const violations: string[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            violations.push(...scanDirForImg(fullPath));
          } else if (/\.(tsx|jsx)$/.test(entry.name)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            // Look for <img but ignore comments and next/image
            const lines = content.split('\n');
            lines.forEach((line, index) => {
              if (
                /<img\s/i.test(line) &&
                !line.trim().startsWith('//') &&
                !line.trim().startsWith('{/*')
              ) {
                violations.push(`${fullPath}:${index + 1}: ${line.trim()}`);
              }
            });
          }
        }
        return violations;
      }

      const violations = scanDirForImg(path.join(rootDir, 'app'));
      expect(violations).toEqual([]);
    });

    it('uses next/image with explicit sizes in IdeaCard, Header, and IdeaDetailPage', () => {
      const cardPath = path.join(rootDir, 'app/components/ideas/idea-card.tsx');
      const cardContent = fs.readFileSync(cardPath, 'utf8');
      expect(cardContent).toContain("import Image from 'next/image';");
      expect(cardContent).toContain('sizes="32px"');

      const headerPath = path.join(rootDir, 'app/components/ui/header.tsx');
      const headerContent = fs.readFileSync(headerPath, 'utf8');
      expect(headerContent).toContain("import Image from 'next/image';");
      expect(headerContent).toContain('sizes="24px"');

      const ideaPath = path.join(rootDir, 'app/idea/[slug]/page.tsx');
      const ideaContent = fs.readFileSync(ideaPath, 'utf8');
      expect(ideaContent).toContain("import Image from 'next/image';");
      expect(ideaContent).toContain('sizes="36px"');

      const profilePath = path.join(rootDir, 'app/components/profile/profile-header.tsx');
      const profileContent = fs.readFileSync(profilePath, 'utf8');
      expect(profileContent).toContain("import Image from 'next/image';");
      expect(profileContent).toContain('sizes="96px"');
    });
  });

  describe('T-7.23: 50+ FPS scroll performance & paint containment', () => {
    it('defines feed-card-contain with layout paint style containment and content-visibility in globals.css', () => {
      const cssPath = path.join(rootDir, 'app/globals.css');
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      expect(cssContent).toContain('.feed-card-contain');
      expect(cssContent).toContain('contain: layout paint style;');
      expect(cssContent).toContain('content-visibility: auto;');
      expect(cssContent).toContain('contain-intrinsic-size: 0 320px;');
    });

    it('applies feed-card-contain class and contentVisibility to IdeaCard articles', () => {
      const cardPath = path.join(rootDir, 'app/components/ideas/idea-card.tsx');
      const cardContent = fs.readFileSync(cardPath, 'utf8');
      expect(cardContent).toContain('feed-card-contain');
      expect(cardContent).toContain("contentVisibility: 'auto'");
      expect(cardContent).toContain("containIntrinsicSize: '0 320px'");
    });

    it('ensures feed pagination limit strictly caps viewport to 12 items (blur budget <= 12)', () => {
      const feedPath = path.join(rootDir, 'app/feed/page.tsx');
      const feedContent = fs.readFileSync(feedPath, 'utf8');
      expect(feedContent).toContain('limit: 12');
    });
  });

  describe('T-7.25: Bundle analysis & Framer Motion code-splitting', () => {
    it('dynamically imports WinnerModal in root layout to keep initial chunk lean', () => {
      const layoutPath = path.join(rootDir, 'app/layout.tsx');
      const layoutContent = fs.readFileSync(layoutPath, 'utf8');
      expect(layoutContent).toContain("import dynamic from 'next/dynamic';");
      expect(layoutContent).toContain("import('@/app/components/cycles/winner-modal')");
      expect(layoutContent).toContain('ssr: false');
    });

    it('dynamically imports AuthModal in VoteButton to defer modal animation bundle', () => {
      const votePath = path.join(rootDir, 'app/components/votes/vote-button.tsx');
      const voteContent = fs.readFileSync(votePath, 'utf8');
      expect(voteContent).toContain("import dynamic from 'next/dynamic';");
      expect(voteContent).toContain("import('@/app/components/auth/auth-modal')");
      expect(voteContent).toContain('ssr: false');
    });

    it('dynamically imports WithdrawModal and ReportModal in IdeaActions', () => {
      const actionsPath = path.join(rootDir, 'app/idea/[slug]/idea-actions.tsx');
      const actionsContent = fs.readFileSync(actionsPath, 'utf8');
      expect(actionsContent).toContain("import dynamic from 'next/dynamic';");
      expect(actionsContent).toContain("import('@/app/components/ideas/withdraw-modal')");
      expect(actionsContent).toContain("import('@/app/components/reports/report-modal')");
      expect(actionsContent).toContain('ssr: false');
    });
  });

  describe('T-7.22: Caching strategy & Core Web Vitals (Zero CLS)', () => {
    it('enforces ISR revalidation intervals matching ARCHITECTURE.md §5.5', () => {
      const homePath = path.join(rootDir, 'app/page.tsx');
      expect(fs.readFileSync(homePath, 'utf8')).toContain('export const revalidate = 60;');

      const ideaPath = path.join(rootDir, 'app/idea/[slug]/page.tsx');
      expect(fs.readFileSync(ideaPath, 'utf8')).toContain('export const revalidate = 30;');

      const profilePath = path.join(rootDir, 'app/u/[username]/page.tsx');
      expect(fs.readFileSync(profilePath, 'utf8')).toContain('export const revalidate = 120;');

      const cyclePath = path.join(rootDir, 'app/cycles/[n]/page.tsx');
      expect(fs.readFileSync(cyclePath, 'utf8')).toContain('export const revalidate = false;');
    });

    it('ensures dimensions are preserved on skeletons to guarantee zero CLS', () => {
      const lbSkeletonPath = path.join(
        rootDir,
        'app/components/leaderboard/leaderboard-skeleton.tsx',
      );
      const lbSkeleton = fs.readFileSync(lbSkeletonPath, 'utf8');
      expect(lbSkeleton).toContain('min-h-[72px]'); // Exact 72px row height preserved matching LeaderboardRow

      const ideaSkeletonPath = path.join(rootDir, 'app/components/ideas/idea-detail-skeleton.tsx');
      const ideaSkeleton = fs.readFileSync(ideaSkeletonPath, 'utf8');
      expect(ideaSkeleton).toContain('max-w-4xl');
      expect(ideaSkeleton).toContain('h-[44px]'); // Vote button dimension preserved
      expect(ideaSkeleton).toContain('h-9 w-9'); // Avatar dimension preserved
    });
  });
});
