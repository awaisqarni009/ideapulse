'use client';

import React, { useState } from 'react';
import { adminStartCycleAction, adminStopCycleAction } from '@/app/actions/admin-management';
import { useToast } from '@/app/components/ui/toast';
import {
  Play,
  Square,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
  Layers,
  Settings,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface CycleData {
  id: string;
  cycle_number: number;
  status: string;
  starts_at: string;
  ends_at: string;
  vote_threshold: number;
  daily_vote_limit: number;
  reward_slots?: number;
}

interface CycleControlManagerProps {
  activeCycle: CycleData | null;
  latestCycleNumber: number;
}

export function CycleControlManager({ activeCycle, latestCycleNumber }: CycleControlManagerProps) {
  const toast = useToast();
  const router = useRouter();

  // Start cycle state
  const [cycleNumber, setCycleNumber] = useState(
    activeCycle ? activeCycle.cycle_number + 1 : latestCycleNumber + 1,
  );
  const [durationDays, setDurationDays] = useState(7);
  const [durationHours, setDurationHours] = useState(0);
  const [voteThreshold, setVoteThreshold] = useState(50);
  const [dailyVoteLimit, setDailyVoteLimit] = useState(5);
  const [autoCloseActive, setAutoCloseActive] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  // Stop cycle state
  const [isStopping, setIsStopping] = useState(false);
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [stopNote, setStopNote] = useState('');

  const endsAt = activeCycle?.ends_at ? new Date(activeCycle.ends_at) : null;
  const isExpired = endsAt ? endsAt <= new Date() : false;
  const timeLeft =
    endsAt && !isExpired ? formatDistanceToNow(endsAt, { addSuffix: true }) : 'Cycle completed';

  async function handleStartCycle(e: React.FormEvent) {
    e.preventDefault();
    setIsStarting(true);

    try {
      const res = await adminStartCycleAction({
        cycleNumber: Number(cycleNumber),
        durationDays: Number(durationDays),
        durationHours: Number(durationHours),
        voteThreshold: Number(voteThreshold),
        dailyVoteLimit: Number(dailyVoteLimit),
        autoCloseActive,
      });

      if (res.success) {
        toast.success(res.message || 'Cycle started successfully!', 'Cycle Active');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to start cycle', 'Error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unexpected error starting cycle';
      toast.error(msg, 'Error');
    } finally {
      setIsStarting(false);
    }
  }

  async function handleStopCycle(e: React.FormEvent) {
    e.preventDefault();
    if (!activeCycle) return;
    setIsStopping(true);

    try {
      const res = await adminStopCycleAction({
        cycleId: activeCycle.id,
        note: stopNote.trim() || `Manual stop of Cycle #${activeCycle.cycle_number}`,
      });

      if (res.success) {
        toast.success(res.message || 'Cycle stopped successfully.', 'Cycle Stopped');
        setStopModalOpen(false);
        setStopNote('');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to stop cycle', 'Error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unexpected error stopping cycle';
      toast.error(msg, 'Error');
    } finally {
      setIsStopping(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Active Cycle Status & Stop Button Card */}
      <div
        className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-xl backdrop-blur-md"
        style={{
          boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.3), inset 0 1px 0 var(--edge-specular)',
        }}
      >
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--border-subtle)] pb-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400" />
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Active Cycle Control
              </h2>
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">
              Monitor active voting window, track duration, or stop/finalize immediately.
            </p>
          </div>

          {activeCycle && (
            <button
              type="button"
              onClick={() => setStopModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 shadow-sm transition-all hover:bg-red-500/20 active:scale-95"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              <span>Stop / Finalize Cycle #{activeCycle.cycle_number}</span>
            </button>
          )}
        </div>

        {activeCycle ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-[var(--surface-2)]/60 rounded-xl border border-[var(--border-subtle)] p-4">
              <div className="text-[11px] font-medium text-[var(--text-tertiary)]">
                Cycle Number
              </div>
              <div className="mt-1 font-mono text-2xl font-extrabold text-[var(--cyan-bright)]">
                #{activeCycle.cycle_number}
              </div>
              <div className="mt-1 text-[10px] font-semibold text-emerald-400">
                STATUS: {activeCycle.status.toUpperCase()}
              </div>
            </div>

            <div className="bg-[var(--surface-2)]/60 rounded-xl border border-[var(--border-subtle)] p-4">
              <div className="text-[11px] font-medium text-[var(--text-tertiary)]">
                Duration & Time Left
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-[var(--text-primary)]">
                {timeLeft}
              </div>
              <div className="mt-1 text-[10px] text-[var(--text-tertiary)]">
                Ends: {endsAt ? `${format(endsAt, 'MMM d, HH:mm')} UTC` : 'N/A'}
              </div>
            </div>

            <div className="bg-[var(--surface-2)]/60 rounded-xl border border-[var(--border-subtle)] p-4">
              <div className="text-[11px] font-medium text-[var(--text-tertiary)]">
                Vote Qualification Threshold
              </div>
              <div className="mt-1 font-mono text-2xl font-extrabold text-[var(--text-primary)]">
                {activeCycle.vote_threshold}
              </div>
              <div className="mt-1 text-[10px] text-[var(--text-tertiary)]">
                Verified votes required to qualify
              </div>
            </div>

            <div className="bg-[var(--surface-2)]/60 rounded-xl border border-[var(--border-subtle)] p-4">
              <div className="text-[11px] font-medium text-[var(--text-tertiary)]">
                Daily Limit per Voter
              </div>
              <div className="mt-1 font-mono text-2xl font-extrabold text-[var(--indigo-bright)]">
                {activeCycle.daily_vote_limit}
              </div>
              <div className="mt-1 text-[10px] text-[var(--text-tertiary)]">
                Rolling 24h voting allowance
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-[var(--border-default)] p-8 text-center">
            <Clock className="mx-auto h-8 w-8 text-[var(--text-tertiary)]" />
            <h3 className="mt-2 text-sm font-bold text-[var(--text-primary)]">
              No Active Cycle Currently Running
            </h3>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Use the form below to configure and start Cycle #{latestCycleNumber + 1}.
            </p>
          </div>
        )}
      </div>

      {/* 2. Start Cycle Form */}
      <div
        className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-xl backdrop-blur-md"
        style={{
          boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.3), inset 0 1px 0 var(--edge-specular)',
        }}
      >
        <div className="border-b border-[var(--border-subtle)] pb-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
            <Play className="h-4 w-4 fill-current text-[var(--indigo-bright)]" />
            <span>Start a New Cycle</span>
          </h2>
          <p className="text-xs text-[var(--text-tertiary)]">
            Set cycle number, choose duration, configure thresholds, and launch community voting.
          </p>
        </div>

        <form onSubmit={handleStartCycle} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Cycle Number */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                Cycle Number
              </label>
              <input
                type="number"
                min={1}
                value={cycleNumber}
                onChange={(e) => setCycleNumber(Number(e.target.value))}
                required
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] p-2.5 font-mono text-sm text-[var(--text-primary)] focus:border-[var(--indigo)] focus:outline-none"
              />
              <span className="mt-1 block text-[10px] text-[var(--text-tertiary)]">
                Sequential cycle identifier
              </span>
            </div>

            {/* Duration Selector */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                Cycle Duration (Days)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  required
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] p-2.5 font-mono text-sm text-[var(--text-primary)] focus:border-[var(--indigo)] focus:outline-none"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {[1, 3, 7, 14].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDurationDays(d);
                      setDurationHours(0);
                    }}
                    className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                      durationDays === d && durationHours === 0
                        ? 'bg-[var(--indigo)] text-white'
                        : 'bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            {/* Vote Threshold */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                Vote Threshold (To Qualify)
              </label>
              <input
                type="number"
                min={1}
                max={10000}
                value={voteThreshold}
                onChange={(e) => setVoteThreshold(Number(e.target.value))}
                required
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] p-2.5 font-mono text-sm text-[var(--text-primary)] focus:border-[var(--indigo)] focus:outline-none"
              />
              <span className="mt-1 block text-[10px] text-[var(--text-tertiary)]">
                Default: 50 verified votes
              </span>
            </div>

            {/* Daily Vote Limit */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                Daily Vote Limit
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={dailyVoteLimit}
                onChange={(e) => setDailyVoteLimit(Number(e.target.value))}
                required
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] p-2.5 font-mono text-sm text-[var(--text-primary)] focus:border-[var(--indigo)] focus:outline-none"
              />
              <span className="mt-1 block text-[10px] text-[var(--text-tertiary)]">
                Votes per user in 24 hours (default: 5)
              </span>
            </div>
          </div>

          {/* Auto close active cycle checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoClose"
              checked={autoCloseActive}
              onChange={(e) => setAutoCloseActive(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--indigo)] focus:ring-[var(--indigo)]"
            />
            <label htmlFor="autoClose" className="text-xs text-[var(--text-secondary)]">
              Automatically close/finalize currently active cycle if one is running
            </label>
          </div>

          {/* Launch Button */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isStarting}
              className="btn btn-primary inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--indigo)] px-5 py-2.5 text-xs font-bold text-white shadow-[var(--glow-indigo-sm)] transition-all hover:bg-[var(--indigo-bright)] hover:shadow-[var(--glow-indigo-md)] active:scale-95 disabled:opacity-50"
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Launching Cycle #{cycleNumber}...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Start Cycle #{cycleNumber} Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Stop Cycle Confirmation Modal */}
      {stopModalOpen && activeCycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-2xl"
            style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
          >
            <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Stop Cycle #{activeCycle.cycle_number}
                </h3>
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  This will finalize voting and award rewards to qualifiers.
                </p>
              </div>
            </div>

            <form onSubmit={handleStopCycle} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--text-secondary)]">
                  Finalization Reason / Operator Note
                </label>
                <textarea
                  rows={3}
                  value={stopNote}
                  onChange={(e) => setStopNote(e.target.value)}
                  placeholder="e.g. Scheduled weekly rotation completed early, or manual testing cycle finalization..."
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] p-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--indigo)] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] pt-3">
                <button
                  type="button"
                  onClick={() => setStopModalOpen(false)}
                  disabled={isStopping}
                  className="rounded-[var(--radius-sm)] border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isStopping}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-red-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
                >
                  {isStopping ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Finalizing...</span>
                    </>
                  ) : (
                    <>
                      <Square className="h-3 w-3 fill-current" />
                      <span>Confirm Stop Cycle</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
