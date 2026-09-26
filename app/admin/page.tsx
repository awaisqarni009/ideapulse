import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/user';
import { createClient } from '@/lib/supabase/server';
import { Admin3DTelemetry } from '@/app/components/admin/admin-3d-telemetry';
import { UserModerationCard } from './user-moderation-card';
import { ManualFinalizeButton } from './cycles/finalize-button';
import { RecountButton } from './cycles/recount-button';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
  Flame,
  Flag,
  Layers,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Command Center — IdeaPulse',
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 0; // Real-time admin telemetry

export default async function AdminPage() {
  const { user, profile, isAdmin } = await getCurrentUser();

  // Server-side guard: Non-admins receive 404 per AC-10.3
  if (!user || !isAdmin) {
    notFound();
  }

  const supabase = await createClient();

  // 1. Fetch active cycle
  const { data: activeCycle } = await supabase
    .from('cycles')
    .select('*')
    .eq('status', 'active')
    .maybeSingle();

  // 2. Fetch system health check via RPC
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

  // 3. Count qualifying ideas in active cycle
  const threshold = activeCycle?.vote_threshold ?? 50;
  const { count: qualifyingCount } = activeCycle
    ? await supabase
        .from('ideas')
        .select('*', { count: 'exact', head: true })
        .eq('cycle_id', activeCycle.id)
        .gte('verified_vote_count', threshold)
    : { count: 0 };

  // 4. Platform Metrics (Total ideas, total votes, total users)
  const [{ count: totalIdeasCount }, { count: totalVotesCount }, { count: totalUsersCount }] =
    await Promise.all([
      supabase.from('ideas').select('*', { count: 'exact', head: true }),
      supabase.from('votes').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ]);

  // 5. Unresolved Reports count
  const { count: unresolvedReportsCount } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .is('resolved_at', null);

  // 6. Flagged Ring Clusters count
  const { count: pendingClustersCount } = await supabase
    .from('suspicious_clusters' as any)
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // 7. Abuse events in last 24h
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: abuseEvents24h } = await supabase
    .from('abuse_events')
    .select('*', { count: 'exact', head: true })
    .gt('created_at', twentyFourHoursAgo);

  // 8. Recent admin actions audit trail
  const { data: recentAdminActions } = await supabase
    .from('admin_actions')
    .select('id, action, target_table, target_id, reason, admin_id, created_at')
    .order('created_at', { ascending: false })
    .limit(6);

  // 9. Initial profiles for user moderation card
  const { data: initialProfiles } = await supabase
    .from('profiles')
    .select('id, username, display_name, role, status, suspended_until, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  const endsAtDate = activeCycle?.ends_at ? new Date(activeCycle.ends_at) : null;
  const timeLeft =
    endsAtDate && endsAtDate > new Date()
      ? formatDistanceToNow(endsAtDate, { addSuffix: true })
      : 'Boundary passed';

  return (
    <div className="space-y-8">
      {/* Top Admin Command Header */}
      <div
        className="flex flex-col justify-between gap-6 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-2xl backdrop-blur-md sm:flex-row sm:items-center sm:p-8"
        style={{
          boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.45), inset 0 1px 0 var(--edge-specular)',
        }}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--accent-warning)]">
              <Shield className="h-3 w-3" />
              <span>System Operations Console</span>
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                health?.healthy
                  ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border border-red-500/30 bg-red-500/10 text-red-400'
              }`}
            >
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-current" />
              <span>{health?.healthy ? 'Consensus Healthy' : 'Action Required'}</span>
            </span>
          </div>

          <h1 className="font-display text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Master Admin Command Center
          </h1>
          <p className="text-xs text-[var(--text-secondary)] sm:text-sm">
            Live telemetry, automated cycle execution, abuse event tracking, and voter moderation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {activeCycle && (
            <ManualFinalizeButton
              cycleNumber={activeCycle.cycle_number}
              qualifyingCount={qualifyingCount || 0}
            />
          )}

          {activeCycle && (
            <RecountButton cycleId={activeCycle.id} cycleNumber={activeCycle.cycle_number} />
          )}

          <Link
            href="/admin/cycles"
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--surface-3)]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Manage Cycles</span>
          </Link>
        </div>
      </div>

      {/* 4 Core Platform KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Cycle KPI */}
        <div
          className="hover:border-[var(--indigo)]/40 rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] p-5 shadow-sm backdrop-blur-sm transition-all"
          style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Active Cycle
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.1)] text-[var(--indigo-bright)]">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-[var(--text-primary)]">
              #{activeCycle?.cycle_number ?? 1}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">{timeLeft}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Qualifiers (≥50):</span>
            <span className="font-mono font-bold text-[var(--cyan-bright)]">
              {qualifyingCount ?? 0} ideas
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-tertiary)]">
            Threshold: {activeCycle?.vote_threshold ?? 50} verified votes
          </div>
        </div>

        {/* Moderation Queue KPI */}
        <div
          className="hover:border-[var(--indigo)]/40 rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] p-5 shadow-sm backdrop-blur-sm transition-all"
          style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Pending Reports
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.1)] text-[var(--accent-warning)]">
              <Flag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`font-mono text-3xl font-extrabold ${
                (unresolvedReportsCount ?? 0) > 0
                  ? 'text-[var(--accent-warning)]'
                  : 'text-emerald-400'
              }`}
            >
              {unresolvedReportsCount ?? 0}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">unreviewed</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Action Required:</span>
            <Link
              href="/admin/reports"
              className="font-semibold text-[var(--indigo-bright)] hover:underline"
            >
              Open Queue →
            </Link>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-tertiary)]">
            Ideas with ≥3 flags auto-move to under_review
          </div>
        </div>

        {/* Sybil Resistance KPI */}
        <div
          className="hover:border-[var(--indigo)]/40 rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] p-5 shadow-sm backdrop-blur-sm transition-all"
          style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Flagged Ring Clusters
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] text-[var(--accent-danger)]">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`font-mono text-3xl font-extrabold ${
                (pendingClustersCount ?? 0) > 0 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {pendingClustersCount ?? 0}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">detected</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Pairwise Jaccard:</span>
            <Link
              href="/admin/clusters"
              className="font-semibold text-[var(--indigo-bright)] hover:underline"
            >
              Inspect Clusters →
            </Link>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-tertiary)]">
            Human review before any disciplinary action
          </div>
        </div>

        {/* Abuse Telemetry KPI */}
        <div
          className="hover:border-[var(--indigo)]/40 rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] p-5 shadow-sm backdrop-blur-sm transition-all"
          style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Abuse Events (24h)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(6,182,212,0.3)] bg-[rgba(6,182,212,0.1)] text-[var(--cyan-bright)]">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-[var(--cyan-bright)]">
              {abuseEvents24h ?? 0}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">events</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Edge Rate Guard:</span>
            <Link
              href="/admin/abuse"
              className="font-semibold text-[var(--indigo-bright)] hover:underline"
            >
              View Log →
            </Link>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400">
            IP salt rotation active • Raw IP never stored
          </div>
        </div>
      </div>

      {/* Main 2-Column Command Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column (7 cols): 3D Telemetry & Account Moderation Console */}
        <div className="space-y-8 lg:col-span-7">
          {/* 3D Telemetry Scanner */}
          <Admin3DTelemetry
            healthy={health?.healthy ?? true}
            activeCycleNumber={activeCycle?.cycle_number ?? 1}
            unresolvedReportsCount={unresolvedReportsCount ?? 0}
            pendingClustersCount={pendingClustersCount ?? 0}
            abuseEvents24h={abuseEvents24h ?? 0}
          />

          {/* Connected User Moderation Card */}
          <UserModerationCard initialProfiles={initialProfiles || []} />
        </div>

        {/* Right Column (5 cols): Connected Operations Hub & Recent Admin Actions */}
        <div className="space-y-8 lg:col-span-5">
          {/* Connected Hub Navigation */}
          <div
            className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-xl backdrop-blur-md"
            style={{
              boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.3), inset 0 1px 0 var(--edge-specular)',
            }}
          >
            <h3 className="font-display text-sm font-bold text-[var(--text-primary)]">
              Connected Admin Modules
            </h3>
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">
              Direct access to all platform moderation and cycle governance tools.
            </p>

            <div className="mt-4 space-y-3">
              <Link
                href="/admin/cycles"
                className="group flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3.5 transition-all hover:border-[var(--indigo)] hover:bg-[var(--surface-3)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.1)] text-[var(--indigo-bright)]">
                    <RefreshCw className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--text-primary)]">
                      Cycle Governance
                    </div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">
                      Finalization, tie-breaking, recounts
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/admin/reports"
                className="group flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3.5 transition-all hover:border-[var(--accent-warning)] hover:bg-[var(--surface-3)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.1)] text-[var(--accent-warning)]">
                    <Flag className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--text-primary)]">
                      Reports Queue
                    </div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">
                      {unresolvedReportsCount ?? 0} pending review
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/admin/clusters"
                className="group flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3.5 transition-all hover:border-red-500 hover:bg-[var(--surface-3)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] text-[var(--accent-danger)]">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--text-primary)]">
                      Ring Detection & Clusters
                    </div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">
                      {pendingClustersCount ?? 0} suspicious voter networks
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/admin/abuse"
                className="group flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3.5 transition-all hover:border-[var(--cyan-bright)] hover:bg-[var(--surface-3)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(6,182,212,0.3)] bg-[rgba(6,182,212,0.1)] text-[var(--cyan-bright)]">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--text-primary)]">
                      Abuse Audit Stream
                    </div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">
                      Rate breaches, self-vote attempts
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Recent Admin Actions Audit Log */}
          <div
            className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-xl backdrop-blur-md"
            style={{
              boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.3), inset 0 1px 0 var(--edge-specular)',
            }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-display text-sm font-bold text-[var(--text-primary)]">
                Recent Admin Actions
              </h3>
              <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
                Audit Trail (admin_actions)
              </span>
            </div>

            <div className="mt-4 divide-y divide-[var(--border-subtle)]">
              {recentAdminActions && recentAdminActions.length > 0 ? (
                recentAdminActions.map((action) => {
                  return (
                    <div key={action.id} className="py-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[var(--indigo-bright)]">
                          {action.action.toUpperCase()}
                        </span>
                        <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
                          {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-[11px] text-[var(--text-secondary)]">
                        Reason: {action.reason}
                      </p>
                      <div className="mt-1 font-mono text-[10px] text-[var(--text-tertiary)]">
                        Target: {action.target_table} • Admin #{action.admin_id.slice(0, 8)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-[var(--text-tertiary)]">
                  No recent administrative actions recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
