import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/user';
import Link from 'next/link';
import {
  Shield,
  RefreshCw,
  Flag,
  AlertTriangle,
  ArrowLeft,
  Users,
  LayoutDashboard,
} from 'lucide-react';
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
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/cycles', label: 'Cycles', icon: RefreshCw },
    { href: '/admin/reports', label: 'Reports Queue', icon: Flag },
    { href: '/admin/clusters', label: 'Ring Clusters', icon: Users },
    { href: '/admin/abuse', label: 'Abuse Audit', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)]">
      {/* Admin Executive Command Bar */}
      <header className="bg-[var(--canvas-deep)]/95 sticky top-0 z-40 border-b border-[var(--border-subtle)] shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            {/* Direct Exit to Main App */}
            <Link
              href="/feed"
              className="group inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-all hover:border-[var(--indigo)] hover:bg-[var(--surface-2)] hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Exit to Main Site</span>
            </Link>

            <div
              className="hidden h-5 w-px bg-[var(--border-subtle)] sm:block"
              aria-hidden="true"
            />

            {/* Admin Badge */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-bold tracking-tight text-[var(--text-primary)]">
                    Idea<span className="text-[var(--cyan-bright)]">Pulse</span>
                  </span>
                  <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Admin Portal
                  </span>
                </div>
              </div>
            </div>

            {/* Nav Tabs */}
            <nav className="hidden items-center gap-1.5 pl-2 md:flex">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--indigo)]"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section: System Status & Admin Profile */}
          <div className="flex items-center gap-3">
            {/* System Status Indicator */}
            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400 lg:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>All Systems Nominal</span>
            </div>

            {/* Admin User Info */}
            <div className="flex items-center gap-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] px-3 py-1.5 text-xs">
              <span className="hidden text-[var(--text-tertiary)] sm:inline">Signed in as</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {profile?.display_name || user.email}
              </span>
              <span className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--indigo-bright)]">
                {profile?.role || 'admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Nav Tabs */}
        <div className="flex gap-2 overflow-x-auto border-t border-[var(--border-subtle)] bg-[var(--canvas-deep)] px-4 py-2 md:hidden">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
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
