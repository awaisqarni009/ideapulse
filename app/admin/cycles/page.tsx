import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { ManualFinalizeButton } from './finalize-button';
import { RecountButton } from './recount-button';
import Link from 'next/link';
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Layers,
  ShieldCheck,
  Trophy,
  Users,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cycle Management — Admin Console',
};

export default async function AdminCyclesPage() {
  const supabase = await createClient();

  // 1. Fetch active cycle
  const { data: activeCycle } = await supabase
    .from('cycles')
    .select('*')
    .eq('status', 'active')
    .maybeSingle();

  // 2. Fetch health check
  const { data: healthData } = await supabase.rpc('check_cycle_health');
  const health = healthData as {
    healthy: boolean;
    active_cycle_id?: string;
    cycle_number?: number;
    ends_at?: string;
    overdue_minutes?: number;
    heartbeat_count?: number;
    error?: string;
  } | null;

  // 3. Fetch qualifying ideas for active cycle
  const threshold = activeCycle?.vote_threshold ?? 50;
  const { data: qualifyingIdeas } = activeCycle
    ? await supabase
        .from('ideas')
        .select(
          'id, title, slug, verified_vote_count, vote_count, qualified_at, author_id, profiles(username, display_name)',
        )
        .eq('cycle_id', activeCycle.id)
        .gte('verified_vote_count', threshold)
        .order('verified_vote_count', { ascending: false })
        .order('qualified_at', { ascending: true })
    : { data: [] };

  // 4. Fetch all active ideas count
  const { count: totalCycleIdeas } = activeCycle
    ? await supabase
        .from('ideas')
        .select('*', { count: 'exact', head: true })
        .eq('cycle_id', activeCycle.id)
        .eq('status', 'published')
    : { count: 0 };

  // 5. Fetch recent cycles history
  const { data: recentCycles } = await supabase
    .from('cycles')
    .select('*')
    .neq('status', 'active')
    .order('cycle_number', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl">
            Cycle Management
          </h1>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Monitor active cycle momentum, verify qualifying ideas, and oversee automatic rotation
            health.
          </p>
        </div>

        {activeCycle && (
          <ManualFinalizeButton
            cycleNumber={activeCycle.cycle_number}
            qualifyingCount={qualifyingIdeas?.length || 0}
          />
        )}
      </div>

      {/* Health Status Banner */}
      {health && (
        <div
          className={`flex items-center justify-between rounded-[var(--radius-lg)] border p-4 text-xs ${
            health.healthy
              ? 'border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.06)] text-[var(--accent-success)]'
              : 'border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.06)] text-[var(--accent-danger)]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border ${
                health.healthy
                  ? 'border-[rgba(52,211,153,0.4)] bg-[rgba(52,211,153,0.12)]'
                  : 'border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.12)]'
              }`}
            >
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Rotation Health: {health.healthy ? 'Normal (Healthy)' : 'Action Required (Overdue)'}
              </span>
              <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                {health.healthy
                  ? `Cycle ${health.cycle_number} scheduled boundary in sync. ${health.heartbeat_count ?? 0} rotation heartbeats logged.`
                  : `Overdue by ${health.overdue_minutes} minutes! Check pg_cron or run manual finalization.`}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 font-mono text-[10px] text-[var(--text-tertiary)]">
            T-5.12 Health Sentinel
          </span>
        </div>
      )}

      {/* Active Cycle Panel */}
      {activeCycle ? (
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-6 shadow-xl backdrop-blur-md">
          {/* Specular Highlight */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[var(--radius-xl)] shadow-[inset_0_1px_0_var(--edge-specular)]"
            aria-hidden="true"
          />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-[var(--radius-xs)] border border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.1)] px-2.5 py-0.5 text-xs font-semibold text-[var(--indigo)]">
                  Active Cycle #{activeCycle.cycle_number}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-xs text-[var(--accent-cyan)]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent-cyan)]" />
                  Live
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-1)] p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Vote Threshold
                  </span>
                  <div className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                    {activeCycle.vote_threshold}{' '}
                    <span className="text-xs font-normal text-[var(--text-tertiary)]">
                      verified
                    </span>
                  </div>
                </div>

                <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-1)] p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Reward Slots
                  </span>
                  <div className="mt-1 text-lg font-bold text-[var(--accent-violet)]">
                    Top {activeCycle.reward_slots}
                  </div>
                </div>

                <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-1)] p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Daily Quota
                  </span>
                  <div className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                    {activeCycle.daily_vote_limit}{' '}
                    <span className="text-xs font-normal text-[var(--text-tertiary)]">/ 24h</span>
                  </div>
                </div>

                <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-1)] p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Active Ideas
                  </span>
                  <div className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                    {totalCycleIdeas ?? 0}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                  <span>
                    Started:{' '}
                    <strong className="text-[var(--text-primary)]">
                      {new Date(activeCycle.starts_at).toLocaleDateString()}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                  <span>
                    Closes:{' '}
                    <strong className="text-[var(--text-primary)]">
                      {new Date(activeCycle.ends_at).toUTCString()}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-1)] p-8 text-center text-xs text-[var(--text-tertiary)]">
          No active cycle currently running.
        </div>
      )}

      {/* Qualifying Ideas Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[var(--accent-violet)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Currently Qualifying Ideas ({qualifyingIdeas?.length || 0})
            </h2>
          </div>
          <span className="text-xs text-[var(--text-tertiary)]">
            Verified votes &ge; {threshold} · Momentum tie-breaker applied
          </span>
        </div>

        {qualifyingIdeas && qualifyingIdeas.length > 0 ? (
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-2)]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-1)] font-semibold uppercase text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Idea</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3 text-right">Verified Votes</th>
                  <th className="px-4 py-3 text-right">Total Votes</th>
                  <th className="px-4 py-3 text-right">Qualified At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {qualifyingIdeas.map((idea, index) => {
                  const author = Array.isArray(idea.profiles) ? idea.profiles[0] : idea.profiles;
                  const isPodium = index < (activeCycle?.reward_slots ?? 3);
                  return (
                    <tr
                      key={idea.id}
                      className={`transition-colors ${
                        isPodium
                          ? 'bg-[rgba(139,92,246,0.04)] hover:bg-[rgba(139,92,246,0.08)]'
                          : 'hover:bg-[var(--surface-1)]'
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                            isPodium
                              ? 'bg-[rgba(139,92,246,0.2)] font-bold text-[var(--accent-violet)]'
                              : 'text-[var(--text-tertiary)]'
                          }`}
                        >
                          #{index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/idea/${idea.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 font-medium text-[var(--text-primary)] hover:text-[var(--indigo)]"
                        >
                          {idea.title}
                          <ExternalLink className="h-3 w-3 text-[var(--text-tertiary)]" />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">
                        @{author?.username || 'user'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-[var(--accent-violet)]">
                        {idea.verified_vote_count}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--text-tertiary)]">
                        {idea.vote_count}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[11px] text-[var(--text-tertiary)]">
                        {idea.qualified_at
                          ? new Date(idea.qualified_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-1)] p-6 text-center text-xs text-[var(--text-secondary)]">
            No ideas have reached the {threshold}-vote qualification bar in this active cycle yet.
          </div>
        )}
      </div>

      {/* Historical Cycles */}
      {recentCycles && recentCycles.length > 0 && (
        <div className="space-y-4 border-t border-[var(--border-subtle)] pt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Past Finalized Cycles
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {recentCycles.map((c) => (
              <div
                key={c.id}
                className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-1)] p-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-primary)]">
                    Cycle #{c.cycle_number}
                  </span>
                  <span className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-tertiary)]">
                    {c.status}
                  </span>
                </div>
                <div className="mt-2 space-y-0.5 text-[11px] text-[var(--text-secondary)]">
                  <div>Qualifiers: {c.qualified_count ?? 0}</div>
                  <div>
                    Finalized:{' '}
                    {c.finalized_at ? new Date(c.finalized_at).toLocaleDateString() : '—'}
                  </div>
                </div>
                {c.status === 'recount_required' && (
                  <div className="mt-3 border-t border-[var(--border-subtle)] pt-2">
                    <RecountButton cycleId={c.id} cycleNumber={c.cycle_number} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
