'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar, Trophy, ThumbsUp, Lightbulb, CheckCircle2 } from 'lucide-react';

interface ProfileHeaderProps {
  profile: {
    id: string;
    username: string;
    display_name: string;
    bio: string | null;
    avatar_url: string | null;
    created_at: string;
  };
  stats: {
    ideasCount: number;
    votesReceived: number;
    cyclesWon: number;
  };
  isOwner: boolean;
}

export function ProfileHeader({ profile, stats, isOwner }: ProfileHeaderProps) {
  const memberSince = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(profile.created_at));

  return (
    <div
      className="glass-panel relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 backdrop-blur-[var(--blur-md)] sm:p-8"
      style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
    >
      {/* Background glow banner */}
      <div className="pointer-events-none absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[rgba(99,102,241,0.15)] to-transparent blur-2xl" />

      <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        {/* User Identity */}
        <div className="flex items-start gap-5 sm:items-center">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-[var(--border-accent)] bg-[var(--surface-2)] shadow-[var(--glow-indigo-sm)] sm:h-24 sm:w-24">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-[var(--indigo-bright)]">
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-2xl font-extrabold text-[var(--text-primary)] sm:text-3xl">
                {profile.display_name}
              </h1>
              {isOwner && (
                <span className="rounded-full border border-[var(--border-accent)] bg-[rgba(99,102,241,0.12)] px-2.5 py-0.5 text-xs font-semibold text-[var(--indigo-bright)]">
                  You
                </span>
              )}
            </div>

            <p className="mt-0.5 font-mono text-sm text-[var(--text-secondary)]">
              @{profile.username}
            </p>

            {profile.bio && (
              <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
                {profile.bio}
              </p>
            )}

            <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
              <Calendar className="h-3.5 w-3.5" />
              <span>Member since {memberSince}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid w-full grid-cols-3 gap-3 border-t border-[var(--border-subtle)] pt-4 sm:w-auto sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
          <div className="flex flex-col items-center px-2 py-1 sm:items-start">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-tertiary)]">
              <Lightbulb className="h-3.5 w-3.5 text-[var(--indigo-bright)]" />
              <span>Ideas</span>
            </div>
            <span className="mt-1 font-mono text-2xl font-bold text-[var(--text-primary)]">
              {stats.ideasCount}
            </span>
          </div>

          <div className="flex flex-col items-center px-2 py-1 sm:items-start">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-tertiary)]">
              <ThumbsUp className="h-3.5 w-3.5 text-[var(--cyan-bright)]" />
              <span>Votes</span>
            </div>
            <span className="mt-1 font-mono text-2xl font-bold text-[var(--cyan-bright)]">
              {stats.votesReceived.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col items-center px-2 py-1 sm:items-start">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-tertiary)]">
              <Trophy className="h-3.5 w-3.5 text-[var(--violet-bright)]" />
              <span>Won</span>
            </div>
            <span className="mt-1 font-mono text-2xl font-bold text-[var(--violet-bright)]">
              {stats.cyclesWon}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
