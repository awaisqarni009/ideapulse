'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Clock } from 'lucide-react';

interface CycleCountdownProps {
  initialCycleNumber?: number;
  initialEndsAt?: string | null;
  className?: string;
}

/**
 * Format local UTC offset string (e.g. "UTC+5", "UTC-4", "UTC+0")
 */
export function getUtcOffsetString(): string {
  const offsetMinutes = -new Date().getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const minutes = Math.abs(offsetMinutes) % 60;
  if (minutes === 0) {
    return `UTC${sign}${hours}`;
  }
  return `UTC${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * CycleCountdown Component per DESIGN.md §6.4, §7.4 and TASKS.md [T-4.14]
 * - Persistent in top header
 * - Displays active cycle remaining time with local time and UTC offset
 * - Updates every 60s with zero per-second jitter or layout shift
 */
export function CycleCountdown({
  initialCycleNumber = 1,
  initialEndsAt,
  className = '',
}: CycleCountdownProps) {
  const [cycleNumber, setCycleNumber] = useState(initialCycleNumber);
  const [endsAt, setEndsAt] = useState<string | null>(initialEndsAt || null);
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [utcOffsetStr, setUtcOffsetStr] = useState<string>('UTC');

  // Fetch active cycle info if not passed
  useEffect(() => {
    if (endsAt) return;

    const supabase = createClient();
    supabase
      .from('cycles')
      .select('cycle_number, ends_at')
      .eq('status', 'active')
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setCycleNumber(data.cycle_number);
          setEndsAt(data.ends_at);
        }
      });
  }, [endsAt]);

  const updateCountdown = useCallback(() => {
    setUtcOffsetStr(getUtcOffsetString());

    if (!endsAt) {
      setTimeLeftStr('Active');
      return;
    }

    const diffMs = new Date(endsAt).getTime() - Date.now();
    if (diffMs <= 0) {
      setTimeLeftStr('Closing...');
      return;
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      setTimeLeftStr(`${days}d ${hours}h left`);
    } else if (hours > 0) {
      setTimeLeftStr(`${hours}h ${mins}m left`);
    } else {
      setTimeLeftStr(`${mins}m left`);
    }
  }, [endsAt]);

  // Update on mount and every 60s
  useEffect(() => {
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [updateCountdown]);

  if (!timeLeftStr) return null;

  return (
    <div
      role="timer"
      aria-label={`Cycle #${cycleNumber} ends in ${timeLeftStr} (${utcOffsetStr})`}
      title={
        endsAt
          ? `Cycle #${cycleNumber} closes on ${new Date(endsAt).toLocaleString()} (${new Date(endsAt).toUTCString()})`
          : undefined
      }
      className={`glass-panel hidden items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] px-3 py-1 text-xs text-[var(--text-secondary)] shadow-sm backdrop-blur-[var(--blur-md)] transition-colors hover:border-[var(--border-strong)] md:inline-flex ${className}`}
      style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
    >
      <Clock className="h-3.5 w-3.5 text-[var(--cyan-bright)]" />
      <span>
        Cycle #{cycleNumber} ·{' '}
        <strong className="font-semibold text-[var(--text-primary)]">{timeLeftStr}</strong>{' '}
        <span className="font-mono text-[10px] text-[var(--text-tertiary)]">({utcOffsetStr})</span>
      </span>
    </div>
  );
}
