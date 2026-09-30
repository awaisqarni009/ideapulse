'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/app/components/ui/header';
import { Footer } from '@/app/components/ui/footer';
import { UnconfirmedBanner } from '@/app/components/auth/unconfirmed-banner';
import dynamic from 'next/dynamic';
import { WebVitalsReporter } from '@/app/components/observability/web-vitals';

const WinnerModal = dynamic(
  () => import('@/app/components/cycles/winner-modal').then((mod) => mod.WinnerModal),
  { ssr: false },
);

const ScrollTracker = dynamic(
  () => import('@/app/components/energy/scroll-tracker').then((mod) => mod.ScrollTracker),
  { ssr: false },
);

const EnergyHubModal = dynamic(
  () => import('@/app/components/energy/energy-hub-modal').then((mod) => mod.EnergyHubModal),
  { ssr: false },
);

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  // Completely separate admin panel:
  // Non-consumer environment without consumer header/footer or modals
  if (isAdmin) {
    return <div className="min-h-screen w-full bg-[var(--canvas)]">{children}</div>;
  }

  return (
    <>
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
      <ScrollTracker />
      <EnergyHubModal />
      <WebVitalsReporter />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
