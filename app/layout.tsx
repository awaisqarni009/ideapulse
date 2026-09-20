import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'IdeaPulse — Community Idea Incubator',
  description: 'Where the crowd decides which ideas deserve funding and attention.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${GeistSans.variable} dark`}>
      <body className="min-h-screen bg-canvas text-ink-1 antialiased selection:bg-indigo/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
