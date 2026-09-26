'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useUser } from '@/lib/auth/use-user';
import { QuotaHUD } from '@/app/components/votes/quota-hud';
import { CycleCountdown } from '@/app/components/layout/cycle-countdown';
import { ThemeToggle } from '@/app/components/ui/theme-toggle';
import { EnergyBadge } from '@/app/components/energy/energy-badge';
import { signOutAction } from '@/app/actions/auth';
import { Sparkles, PlusCircle, User, LogOut, Menu, X } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { user, profile } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const baseNavLinks = [
    { label: 'Feed', href: '/' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'About', href: '/about' },
    { label: 'FAQ', href: '/faq' },
  ];

  const navLinks = [
    ...(user ? [{ label: 'Dashboard', href: '/dashboard' }] : []),
    ...baseNavLinks,
    ...(profile?.role === 'admin' || profile?.role === 'moderator'
      ? [{ label: 'Admin', href: '/admin' }]
      : []),
  ];

  return (
    <header
      className="sticky top-0 z-[200] h-[64px] border-b border-[var(--border-subtle)] bg-[var(--surface-1)] backdrop-blur-[var(--blur-md)] transition-colors duration-300"
      style={{
        boxShadow: 'inset 0 1px 0 var(--edge-specular), inset 0 -1px 0 var(--border-subtle)',
      }}
    >
      <div className="container mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-base font-bold tracking-tight text-[var(--text-primary)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-accent)] bg-gradient-to-br from-[var(--indigo)] to-[var(--violet)] shadow-[var(--glow-indigo-sm)] transition-transform group-hover:scale-105">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              Idea<span className="text-[var(--cyan-bright)]">Pulse</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-[var(--radius-xs)] px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--surface-3)] font-semibold text-[var(--indigo-bright)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center: Cycle Countdown in header [T-4.14] */}
        <div className="hidden sm:block">
          <CycleCountdown />
        </div>

        {/* Right: Actions, QuotaHUD, Theme Switch & User */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Theme Switch (Dark & Bright Mode) */}
          <ThemeToggle />

          {/* Voting Energy Reservoir & Daily Quests Hub */}
          <EnergyBadge />

          {/* Submit Idea CTA */}
          <Link
            href="/submit"
            className="hidden items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border-accent)] bg-[var(--tint-indigo)] px-2.5 py-1.5 text-xs font-semibold text-[var(--indigo-bright)] transition-all hover:bg-[var(--indigo)] hover:text-white lg:inline-flex"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Submit</span>
          </Link>

          {user ? (
            <>
              {/* Header Quota HUD [T-3.16, T-3.17] */}
              <QuotaHUD />

              {/* User badge / settings */}
              <Link
                href="/settings"
                className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-2)] py-1 pl-1.5 pr-3 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-default)]"
              >
                <div className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-3)] text-[10px] text-[var(--indigo-bright)]">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.display_name || profile.username || 'User'}
                      width={24}
                      height={24}
                      sizes="24px"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                </div>
                <span className="hidden max-w-[100px] truncate sm:inline">
                  {profile?.display_name || profile?.username || user.email?.split('@')[0]}
                </span>
              </Link>

              {/* Sign out button */}
              <button
                type="button"
                onClick={() => signOutAction()}
                title="Sign out"
                aria-label="Sign out"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-tertiary)] transition-colors hover:border-[rgba(239,68,68,0.3)] hover:text-[var(--accent-danger)]"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-[var(--radius-sm)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-[var(--radius-sm)] border border-[var(--border-accent)] bg-[var(--indigo)] px-3 py-1.5 text-xs font-medium text-white shadow-[var(--glow-indigo-sm)] transition-all hover:bg-[var(--indigo-bright)] active:scale-95"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] md:hidden"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-solid)] px-4 py-4 shadow-xl md:hidden">
          <div className="mb-3 sm:hidden">
            <CycleCountdown />
          </div>
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-[var(--radius-xs)] px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--surface-3)] font-semibold text-[var(--indigo-bright)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/submit"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-accent)] bg-[var(--indigo)] py-2 text-sm font-medium text-white shadow-[var(--glow-indigo-sm)]"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Submit New Idea</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
