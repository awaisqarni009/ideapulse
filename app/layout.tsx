import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { UserProvider } from '@/lib/auth/use-user';
import { getCurrentUser } from '@/lib/auth/user';
import { UnconfirmedBanner } from '@/app/components/auth/unconfirmed-banner';
import { ThemeProvider, themeScript } from '@/lib/theme/theme-context';
import { ToastProvider } from '@/app/components/ui/toast';
import { Header } from '@/app/components/ui/header';
import { Footer } from '@/app/components/ui/footer';
import dynamic from 'next/dynamic';

const WinnerModal = dynamic(
  () => import('@/app/components/cycles/winner-modal').then((mod) => mod.WinnerModal),
  { ssr: false },
);

import { WebVitalsReporter } from '@/app/components/observability/web-vitals';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ideapulse.dev';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'IdeaPulse — Community Idea Incubator',
    template: '%s · IdeaPulse',
  },
  description: 'Where the crowd decides which ideas deserve funding and attention.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'IdeaPulse',
    title: 'IdeaPulse — Community Idea Incubator',
    description: 'Where the crowd decides which ideas deserve funding and attention.',
    images: [
      {
        url: '/api/og?title=IdeaPulse%20—%20Community%20Idea%20Incubator',
        width: 1200,
        height: 630,
        alt: 'IdeaPulse Incubator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IdeaPulse — Community Idea Incubator',
    description: 'Where the crowd decides which ideas deserve funding and attention.',
    images: ['/api/og?title=IdeaPulse%20—%20Community%20Idea%20Incubator'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentUser();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${GeistSans.variable} dark`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col bg-canvas text-ink-1 antialiased transition-colors duration-300 selection:bg-indigo/30 selection:text-white">
        <ThemeProvider>
          <UserProvider initialUser={user} initialProfile={profile}>
            <ToastProvider>
              {/* Skip to main content link as first tab stop (DESIGN.md §8, T-7.13) */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-[var(--radius-sm)] focus:border focus:border-[var(--indigo-bright)] focus:bg-[var(--surface-solid)] focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-[var(--text-primary)] focus:shadow-[var(--glow-indigo-md)] focus:outline-none focus:ring-2 focus:ring-[var(--indigo-bright)]"
              >
                Skip to content
              </a>
              <Header />
              <UnconfirmedBanner />
              <WinnerModal />
              <WebVitalsReporter />
              <div className="flex-1">{children}</div>
              <Footer />
            </ToastProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
