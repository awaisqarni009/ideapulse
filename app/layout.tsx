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
