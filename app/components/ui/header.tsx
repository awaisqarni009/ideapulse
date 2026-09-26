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
      className="bg-[var(--surface-1)]/95 sticky top-0 z-[200] h-[68px] border-b border-[var(--border-subtle)] backdrop-blur-[var(--blur-md)] transition-colors duration-300"
      style={{
        boxShadow: 'inset 0 1px 0 var(--edge-specular), 0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      }}
    >
      <div className="container mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section: Brand Logo & Desktop Navigation */}
        <div className="flex items-center gap-5 lg:gap-8">
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-base font-bold tracking-tight text-[var(--text-primary)]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-accent)] bg-gradient-to-br from-[var(--indigo)] to-[var(--violet)] shadow-[var(--glow-indigo-sm)] transition-transform duration-200 group-hover:scale-105">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-[19px] font-bold tracking-tight">
              Idea<span className="text-[var(--cyan-bright)]">Pulse</span>
            </span>
          </Link>

          {/* Vertical divider */}
          <div className="hidden h-5 w-px bg-[var(--border-subtle)] md:block" aria-hidden="true" />

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--surface-3)] font-semibold text-[var(--indigo-bright)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Utilities, Status & User Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Active Cycle Countdown Pill (desktop/laptop) */}
          <div className="hidden xl:block">
            <CycleCountdown />
          </div>

          {/* Theme Switcher (Dark & Bright Mode) */}
          <ThemeToggle />

          {/* Voting Energy Reservoir & Daily Quests Hub */}
          <EnergyBadge />

          {/* Submit Idea CTA (tablets & laptops) */}
          <Link
            href="/submit"
            className="hidden h-[34px] items-center gap-1.5 rounded-full border border-[var(--border-accent)] bg-[var(--tint-indigo)] px-3.5 text-xs font-semibold text-[var(--indigo-bright)] transition-all hover:bg-[var(--indigo)] hover:text-white sm:inline-flex"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Submit</span>
          </Link>

          {user ? (
            <>
              {/* Header Quota HUD - visible on tablets & laptops */}
              <div className="hidden md:block">
                <QuotaHUD />
              </div>

              {/* User badge / profile */}
              <Link
                href="/settings"
                title="Account Settings"
                className="flex h-[34px] items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-2)] py-1 pl-1.5 pr-1.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-default)] sm:pr-3"
              >
                <div className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-3)] text-[10px] text-[var(--indigo-bright)]">
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
                <span className="hidden max-w-[90px] truncate sm:inline">
                  {profile?.display_name || profile?.username || user.email?.split('@')[0]}
                </span>
              </Link>

              {/* Sign out button (hidden on mobile, present in drawer) */}
              <button
                type="button"
                onClick={() => signOutAction()}
                title="Sign out"
                aria-label="Sign out"
                className="hidden h-[34px] w-[34px] items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-tertiary)] transition-colors hover:border-[rgba(239,68,68,0.3)] hover:text-[var(--accent-danger)] sm:inline-flex"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex sm:gap-2">
              <Link
                href="/login"
                className="inline-flex h-[34px] items-center rounded-lg px-3 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex h-[34px] items-center rounded-full border border-[var(--border-accent)] bg-[var(--indigo)] px-3.5 text-xs font-semibold text-white shadow-[var(--glow-indigo-sm)] transition-all hover:bg-[var(--indigo-bright)] active:scale-95"
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
            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] md:hidden"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Native app-like overlay) */}
      {mobileMenuOpen && (
        <div className="animate-in slide-in-from-top-2 border-b border-[var(--border-subtle)] bg-[var(--surface-solid)] px-4 py-5 shadow-2xl backdrop-blur-2xl duration-200 md:hidden">
          {/* User profile card or login CTAs on mobile */}
          {user ? (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
              <div className="flex items-center gap-3">
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-3)] text-xs font-bold text-[var(--indigo-bright)]">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.display_name || profile.username || 'User'}
                      width={36}
                      height={36}
                      sizes="36px"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-semibold text-[var(--text-primary)]">
                    {profile?.display_name || profile?.username || 'Member'}
                  </div>
                  <div className="font-mono text-[11px] text-[var(--text-tertiary)]">
                    @{profile?.username || user.email?.split('@')[0]}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => signOutAction()}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--accent-danger)] hover:bg-[rgba(239,68,68,0.1)]"
              >
                <LogOut className="h-3 w-3" />
                <span>Exit</span>
              </button>
            </div>
          ) : (
            <div className="mb-4 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] py-2 text-xs font-semibold text-[var(--text-primary)]"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-xl border border-[var(--border-accent)] bg-[var(--indigo)] py-2 text-xs font-bold text-white shadow-sm"
              >
                Register
              </Link>
            </div>
          )}

          {/* Quota HUD on mobile */}
          {user && (
            <div className="mb-3">
              <QuotaHUD />
            </div>
          )}

          {/* Cycle Countdown on mobile */}
          <div className="mb-4">
            <CycleCountdown />
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 border-t border-[var(--border-subtle)] pt-3">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
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
              className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-[var(--border-accent)] bg-gradient-to-r from-[var(--indigo)] to-[var(--indigo-deep)] py-2.5 text-sm font-semibold text-white shadow-[var(--glow-indigo-sm)]"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Submit Event / Proposal</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
