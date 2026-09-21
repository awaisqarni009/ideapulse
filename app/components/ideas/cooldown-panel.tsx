'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Lock, ArrowLeft, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface CooldownPanelProps {
  nextSlotAt: string;
}

export function CooldownPanel({ nextSlotAt }: CooldownPanelProps) {
  const targetDate = new Date(nextSlotAt);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  } | null>(null);

  useEffect(() => {
    function calculateTime() {
      const now = Date.now();
      const diff = targetDate.getTime() - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, totalMs: diff });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [nextSlotAt]);

  // Format UTC string: "Thursday 14 March at 09:12 UTC"
  const utcFormatted = `${format(targetDate, 'EEEE d MMMM')} at ${targetDate.getUTCHours().toString().padStart(2, '0')}:${targetDate.getUTCMinutes().toString().padStart(2, '0')} UTC`;

  // Local time with timezone offset
  const localFormatted = targetDate.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const isUnlocked = timeLeft && timeLeft.totalMs <= 0;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="glass-panel relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-1)] p-8 shadow-2xl">
        {/* Specular highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-[var(--edge-specular)]" />

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(234,179,8,0.3)] bg-[rgba(234,179,8,0.1)] text-[var(--accent-warning)] shadow-[var(--glow-warning-sm)]">
            {isUnlocked ? (
              <RefreshCw className="h-6 w-6 text-[var(--accent-success)]" />
            ) : (
              <Clock className="h-7 w-7" />
            )}
          </div>

          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[rgba(234,179,8,0.3)] bg-[rgba(234,179,8,0.1)] px-3 py-1 text-xs font-semibold text-[var(--accent-warning)]">
            <Lock className="h-3 w-3" /> Submission Cooldown Active
          </span>

          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            You&apos;ve used this week&apos;s submission
          </h1>

          <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-secondary)]">
            Your next submission slot opens{' '}
            <strong className="text-[var(--text-primary)]">{utcFormatted}</strong>.
          </p>

          <p className="mt-1 text-xs text-[var(--text-tertiary)]">Local time: {localFormatted}</p>

          {/* Countdown timer blocks */}
          <div className="my-8 grid grid-cols-4 gap-3">
            {[
              { label: 'Days', value: timeLeft?.days ?? 0 },
              { label: 'Hours', value: timeLeft?.hours ?? 0 },
              { label: 'Minutes', value: timeLeft?.minutes ?? 0 },
              { label: 'Seconds', value: timeLeft?.seconds ?? 0 },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-4 py-3 shadow-sm"
              >
                <span className="font-mono text-3xl font-bold tabular-nums text-[var(--text-primary)]">
                  {String(value).padStart(2, '0')}
                </span>
                <span className="mt-1 text-[11px] uppercase tracking-wider text-[var(--text-tertiary)]">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Business rule context explanation */}
          <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4 text-left text-xs leading-relaxed text-[var(--text-secondary)]">
            <p className="font-semibold text-[var(--text-primary)]">Why rolling cooldowns?</p>
            <p className="mt-1 text-[var(--text-tertiary)]">
              Per IdeaPulse rules (BR-020), every member is allotted one idea every 7 rolling days
              (168 hours). This prevents day-one stampedes and gives every idea focused voting
              attention.
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            {isUnlocked ? (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn btn-primary inline-flex items-center justify-center gap-2 px-6 py-2.5"
              >
                <RefreshCw className="h-4 w-4" />
                Slot is Open — Refresh to Submit
              </button>
            ) : (
              <Link
                href="/"
                className="btn btn-secondary inline-flex items-center justify-center gap-2 px-6 py-2.5"
              >
                <ArrowLeft className="h-4 w-4" />
                Explore Active Ideas
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
