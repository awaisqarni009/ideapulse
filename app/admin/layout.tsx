import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/user';
import Link from 'next/link';
import { Shield, RefreshCw, Flag, AlertTriangle, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Console — IdeaPulse',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side guard: Non-admins receive 404 per AC-10.3 (no admin surface disclosure)
  const { user, profile, isAdmin } = await getCurrentUser();

  if (!user || !isAdmin) {
    notFound();
  }

  const navLinks = [
    { href: '/admin/cycles', label: 'Cycles', icon: RefreshCw },
    { href: '/admin/reports', label: 'Reports Queue', icon: Flag },
    { href: '/admin/abuse', label: 'Abuse Audit', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)]">
      {/* Admin Top Navigation Bar */}
      <header className="bg-[var(--canvas-deep)]/90 sticky top-0 z-40 border-b border-[var(--border-subtle)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-xs font-medium text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Exit Console</span>
            </Link>

            <div className="h-4 w-px bg-[var(--border-subtle)]" aria-hidden="true" />

            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.1)] text-[var(--accent-warning)]">
                <Shield className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
                  IdeaPulse
                </span>
                <span className="rounded-[var(--radius-xs)] border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.08)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-warning)]">
                  Admin
                </span>
              </div>
            </div>

            {/* Nav Tabs */}
            <nav className="hidden items-center gap-1 pl-4 md:flex">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--indigo)]"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Admin User Info */}
          <div className="flex items-center gap-3 text-xs">
            <span className="hidden text-[var(--text-tertiary)] sm:inline">Signed in as</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {profile?.display_name || user.email}
            </span>
            <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
              {profile?.role || 'operator'}
            </span>
          </div>
        </div>

        {/* Mobile Nav Tabs */}
        <div className="flex gap-2 overflow-x-auto border-t border-[var(--border-subtle)] px-4 py-2 md:hidden">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-md)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
