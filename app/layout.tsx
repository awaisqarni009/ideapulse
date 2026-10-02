import type { Metadata, Viewport } from 'next';
import { Archivo } from 'next/font/google';
import './globals.css';
import { UserProvider } from '@/lib/auth/use-user';
import { getCurrentUser } from '@/lib/auth/user';
import { ThemeProvider, themeScript } from '@/lib/theme/theme-context';
import { ToastProvider } from '@/app/components/ui/toast';
import { EnergyProvider } from '@/lib/energy/energy-context';
import { SiteShell } from '@/app/components/layout/site-shell';

export const viewport: Viewport = {
  themeColor: '#15181B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ideapulse-lovat.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'PULSEWEAR — Heavyweight Streetwear, Hoodies & Tactical Jackets',
    template: '%s · PULSEWEAR',
  },
  description:
    'Dense 500 GSM loopback hoodies and 20,000 mm waterproof shells, built to outlast the season.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'PULSEWEAR',
    title: 'PULSEWEAR — Heavyweight Streetwear, Hoodies & Tactical Jackets',
    description:
      'Dense 500 GSM loopback hoodies and 20,000 mm waterproof shells, built to outlast the season.',
    images: [
      {
        url: '/api/og?title=PULSEWEAR%20—%20Engineered%20for%20Warmth.%20Cut%20for%20Streets.&spec=500%20GSM%20COTTON%20%C2%B7%2020,000%20MM%20MEMBRANE',
        width: 1200,
        height: 630,
        alt: 'PULSEWEAR Heavyweight Streetwear',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PULSEWEAR — Heavyweight Streetwear, Hoodies & Tactical Jackets',
    description:
      'Dense 500 GSM loopback hoodies and 20,000 mm waterproof shells, built to outlast the season.',
    images: [
      '/api/og?title=PULSEWEAR%20—%20Engineered%20for%20Warmth.%20Cut%20for%20Streets.&spec=500%20GSM%20COTTON%20%C2%B7%2020,000%20MM%20MEMBRANE',
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning className={`${archivo.variable} dark`}>
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
