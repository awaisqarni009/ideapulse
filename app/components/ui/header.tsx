'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useUser } from '@/lib/auth/use-user';
import { QuotaHUD } from '@/app/components/votes/quota-hud';
import { CycleCountdown } from '@/app/components/layout/cycle-countdown';
import { signOutAction } from '@/app/actions/auth';
import { Sparkles, PlusCircle, Trophy, User, LogOut } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { user, profile } = useUser();

  const navLinks = [
    { label: 'Feed', href: '/' },
    { label: 'Submit', href: '/submit' },
    { label: 'Leaderboard', href: '/leaderboard' },
  ];

  return (
    <header
      className="sticky top-0 z-[200] h-[64px] border-b border-[var(--border-subtle)] bg-[rgba(10,12,20,0.85)] backdrop-blur-[var(--blur-md)]"
      style={{
        boxShadow: 'inset 0 -1px 0 rgba(255, 255, 255, 0.04)',
      }}
    >
      <div className="container mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="group flex items-center gap-2 text-base font-bold tracking-tight text-[var(--text-primary)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-accent)] bg-gradient-to-br from-[var(--indigo)] to-[var(--violet)] shadow-[var(--glow-indigo-sm)] transition-transform group-hover:scale-105">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              Idea<span className="text-[var(--cyan-bright)]">Pulse</span>
            </span>
          </Link>

          {/* Center/Desktop Nav */}
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
                      ? 'bg-[var(--surface-3)] text-[var(--indigo-bright)]'
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
        <CycleCountdown />

        {/* Right: Actions, QuotaHUD & User */}
        <div className="flex items-center gap-3 sm:gap-4">
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
                <span className="hidden max-w-[110px] truncate sm:inline">
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
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-[var(--radius-sm)] border border-[var(--border-accent)] bg-[var(--indigo)] px-3.5 py-1.5 text-xs font-medium text-white shadow-[var(--glow-indigo-sm)] transition-all hover:bg-[var(--indigo-bright)] active:scale-95"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
