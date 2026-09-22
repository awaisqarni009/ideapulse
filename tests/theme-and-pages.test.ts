import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { themeScript } from '@/lib/theme/theme-context';

describe('Dual-Theme Engine & NextGen Pages', () => {
  describe('Theme Engine & Pre-Hydration', () => {
    it('provides an inline themeScript to prevent Flash of Unstyled Theme (FOUT)', () => {
      expect(themeScript).toBeDefined();
      expect(themeScript).toContain('localStorage.getItem');
      expect(themeScript).toContain("classList.add('dark')");
      expect(themeScript).toContain("classList.remove('dark')");
    });

    it('injects themeScript and ThemeProvider into RootLayout', () => {
      const layoutContent = fs.readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf-8');
      expect(layoutContent).toContain('themeScript');
      expect(layoutContent).toContain('ThemeProvider');
      expect(layoutContent).toContain('suppressHydrationWarning');
      expect(layoutContent).toContain('<Footer />');
    });

    it('supports ThemeToggle component with accessible toggle attributes', () => {
      const toggleContent = fs.readFileSync(
        path.join(process.cwd(), 'app/components/ui/theme-toggle.tsx'),
        'utf-8',
      );
      expect(toggleContent).toContain('aria-label');
      expect(toggleContent).toContain('useTheme');
      expect(toggleContent).toContain('toggleTheme');
    });

    it('defines bright mode in :root and dark mode in .dark in globals.css', () => {
      const globalsCss = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf-8');
      expect(globalsCss).toContain(':root');
      expect(globalsCss).toContain('.dark {');
      expect(globalsCss).toContain('--canvas: #f8fafc;'); // Bright mode canvas
      expect(globalsCss).toContain('--canvas: #0b0f19;'); // Dark mode canvas
      expect(globalsCss).toContain('text-gradient-dual');
      expect(globalsCss).toContain('glass-card-nextgen');
      expect(globalsCss).toContain('badge-pill');
    });
  });

  describe('NextGen New Pages', () => {
    it('validates /about page exists and exports metadata', () => {
      const aboutContent = fs.readFileSync(path.join(process.cwd(), 'app/about/page.tsx'), 'utf-8');
      expect(aboutContent).toContain('About Us — IdeaPulse');
      expect(aboutContent).toContain('Creative Solutions for a');
      expect(aboutContent).toContain('text-gradient-dual');
      expect(aboutContent).toContain('10K+');
      expect(aboutContent).toContain('4.9 / 5');
    });

    it('validates /how-it-works page exists and features the 4-step pipeline', () => {
      const howItWorksContent = fs.readFileSync(
        path.join(process.cwd(), 'app/how-it-works/page.tsx'),
        'utf-8',
      );
      expect(howItWorksContent).toContain('How It Works — IdeaPulse');
      expect(howItWorksContent).toContain('Submit Your Proposal');
      expect(howItWorksContent).toContain('Cast Rolling Votes');
      expect(howItWorksContent).toContain('Hit Qualification Threshold');
      expect(howItWorksContent).toContain('Automated Cycle Finalization');
      expect(howItWorksContent).toContain('120%');
    });

    it('validates /faq page exists with structured categories and accordion', () => {
      const faqPageContent = fs.readFileSync(path.join(process.cwd(), 'app/faq/page.tsx'), 'utf-8');
      const faqClientContent = fs.readFileSync(
        path.join(process.cwd(), 'app/faq/faq-client.tsx'),
        'utf-8',
      );
      expect(faqPageContent).toContain('Frequently Asked Questions — IdeaPulse');
      expect(faqClientContent).toContain('FAQClient');
      expect(faqClientContent).toContain('How does the rolling 5 votes per 24 hours quota work?');
      expect(faqClientContent).toContain('Can I retract a vote after casting it?');
      expect(faqClientContent).toContain('Why do I need to confirm my email address?');
    });

    it('validates Footer component provides links to new pages', () => {
      const footerContent = fs.readFileSync(
        path.join(process.cwd(), 'app/components/ui/footer.tsx'),
        'utf-8',
      );
      expect(footerContent).toContain('/about');
      expect(footerContent).toContain('/how-it-works');
      expect(footerContent).toContain('/faq');
      expect(footerContent).toContain('IdeaPulse Incubator');
    });
  });
});
