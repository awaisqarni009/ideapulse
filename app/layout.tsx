import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { UserProvider } from '@/lib/auth/use-user';
import { getCurrentUser } from '@/lib/auth/user';
import { UnconfirmedBanner } from '@/app/components/auth/unconfirmed-banner';

import { ToastProvider } from '@/app/components/ui/toast';
import { Header } from '@/app/components/ui/header';
import { WinnerModal } from '@/app/components/cycles/winner-modal';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'IdeaPulse — Community Idea Incubator',
  description: 'Where the crowd decides which ideas deserve funding and attention.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentUser();

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${GeistSans.variable} dark`}>
      <body className="min-h-screen bg-canvas text-ink-1 antialiased selection:bg-indigo/30 selection:text-white">
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
            {children}
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  );
}
