import type { Metadata, Viewport } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { UserProvider } from '@/lib/auth/use-user';
import { getCurrentUser } from '@/lib/auth/user';
import { ThemeProvider, themeScript } from '@/lib/theme/theme-context';
import { ToastProvider } from '@/app/components/ui/toast';
import { EnergyProvider } from '@/lib/energy/energy-context';
import { SiteShell } from '@/app/components/layout/site-shell';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0b0f19' },
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ideapulse.dev';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'PULSEWEAR — Heavyweight Streetwear, Hoodies & Tactical Jackets',
    template: '%s · PULSEWEAR',
  },
  description:
    'Engineered for warmth. Cut for the streets. Heavyweight 500 GSM loopback cotton hoodies and 3-layer weatherproof tactical jackets.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'PULSEWEAR',
    title: 'PULSEWEAR — Heavyweight Streetwear, Hoodies & Tactical Jackets',
    description:
      'Engineered for warmth. Cut for the streets. Heavyweight 500 GSM loopback cotton hoodies and 3-layer weatherproof tactical jackets.',
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
      <body className="selection:bg-indigo/30 flex min-h-screen flex-col bg-canvas text-ink-1 antialiased transition-colors duration-300 selection:text-white">
        <ThemeProvider>
          <UserProvider initialUser={user} initialProfile={profile}>
            <ToastProvider>
              <EnergyProvider>
                <SiteShell>{children}</SiteShell>
              </EnergyProvider>
            </ToastProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
