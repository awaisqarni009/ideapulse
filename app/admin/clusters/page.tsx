import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { DetectRingsButton } from './detect-button';
import { ClusterActionPanel } from './cluster-action-panel';
import Link from 'next/link';
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  Layers,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ring Clusters — Admin Console',
};

export default async function AdminClustersPage() {
  const supabase = await createClient();

  // 1. Fetch pending suspicious clusters
  const { data: clusters } = await supabase
    .from('suspicious_clusters' as any)
    .select(
      `
      id,
      cycle_id,
      account_a,
      account_b,
      jaccard_overlap,
      shared_votes_count,
      signals,
      priority,
      status,
      created_at,
      profile_a:profiles!suspicious_clusters_account_a_fkey(id, username, display_name),
      profile_b:profiles!suspicious_clusters_account_b_fkey(id, username, display_name)
    `,
    )
    .eq('status', 'pending')
    .order('priority', { ascending: false }) // priority_review first
    .order('jaccard_overlap', { ascending: false });

  // 2. Fetch reviewed clusters
  const { data: reviewedClusters } = await supabase
    .from('suspicious_clusters' as any)
    .select(
      `
      id,
      account_a,
      account_b,
      jaccard_overlap,
      priority,
      status,
      reviewed_at,
      review_note,
      profile_a:profiles!suspicious_clusters_account_a_fkey(username),
      profile_b:profiles!suspicious_clusters_account_b_fkey(username)
    `,
    )
    .neq('status', 'pending')
    .order('reviewed_at', { ascending: false })
    .limit(10);

  const pendingClusters = (clusters || []) as any[];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl">
            Coordinated Ring Detection
          </h1>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Nightly Jaccard correlation job flags coordinated voting rings. Human review is required
            before action (RULES.md BR-034).
          </p>
        </div>

        <DetectRingsButton />
      </div>

      {/* Signal Weights Explainer */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 text-xs text-[var(--text-secondary)]">
        <div className="mb-2 flex items-center gap-2 font-semibold text-[var(--text-primary)]">
          <ShieldAlert className="h-4 w-4 text-[var(--indigo)]" />
          <span>BR-034 Ring Detection Algorithm Standards</span>
        </div>
        <div className="grid grid-cols-1 gap-3 text-[11px] sm:grid-cols-3">
          <div className="rounded border border-[var(--border-subtle)] bg-[var(--surface-2)] p-2.5">
            <span className="font-semibold uppercase text-[var(--accent-danger)]">
              High Weight:
            </span>
            <p className="mt-0.5 text-[var(--text-tertiary)]">
              Jaccard overlap &ge; 0.80 over &ge; 8 votes, or repeated vote timing within 120s.
            </p>
          </div>
          <div className="rounded border border-[var(--border-subtle)] bg-[var(--surface-2)] p-2.5">
            <span className="font-semibold uppercase text-[var(--accent-warning)]">
              Medium Weight:
            </span>
            <p className="mt-0.5 text-[var(--text-tertiary)]">
              Accounts created within 30 min of each other, or shared registration IP hash.
            </p>
          </div>
          <div className="rounded border border-[var(--border-subtle)] bg-[var(--surface-2)] p-2.5">
            <span className="font-semibold uppercase text-[var(--accent-violet)]">
              Priority Review:
            </span>
            <p className="mt-0.5 text-[var(--text-tertiary)]">
              Triggered when 2 High signals, or 1 High + 2 Medium signals are detected.
            </p>
          </div>
        </div>
      </div>

      {/* Flagged Clusters List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--accent-warning)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Pending Review Queue ({pendingClusters.length})
            </h2>
          </div>
        </div>

        {pendingClusters.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {pendingClusters.map((cluster) => {
              const profileA = cluster.profile_a || { id: cluster.account_a, username: 'user_a' };
              const profileB = cluster.profile_b || { id: cluster.account_b, username: 'user_b' };
              const isPriority = cluster.priority === 'priority_review';
              const signals = Array.isArray(cluster.signals) ? cluster.signals : [];

              return (
                <div
                  key={cluster.id}
                  className={`relative rounded-[var(--radius-xl)] border p-5 shadow-lg backdrop-blur-md transition-all ${
                    isPriority
                      ? 'border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.03)]'
                      : 'border-[var(--border-subtle)] bg-[var(--surface-2)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-[var(--radius-xs)] border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                            isPriority
                              ? 'border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.12)] text-[var(--accent-danger)]'
                              : 'border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.12)] text-[var(--accent-warning)]'
                          }`}
                        >
                          {isPriority ? 'Priority Review' : 'Standard'}
                        </span>
                        <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                          {(cluster.jaccard_overlap * 100).toFixed(0)}% Overlap
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs font-medium text-[var(--text-primary)]">
                        <Link
                          href={`/u/${profileA.username}`}
                          target="_blank"
                          className="underline decoration-dotted hover:text-[var(--indigo)]"
                        >
                          @{profileA.username}
                        </Link>
                        <span className="text-[var(--text-tertiary)]">&harr;</span>
                        <Link
                          href={`/u/${profileB.username}`}
                          target="_blank"
                          className="underline decoration-dotted hover:text-[var(--indigo)]"
                        >
                          @{profileB.username}
                        </Link>
                      </div>
                    </div>

                    <ClusterActionPanel
                      clusterId={cluster.id}
                      accountA={{ id: profileA.id, username: profileA.username }}
                      accountB={{ id: profileB.id, username: profileB.username }}
                      jaccard={cluster.jaccard_overlap}
                    />
                  </div>

                  {/* Signals List */}
                  <div className="mt-3 space-y-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Triggered Signals ({signals.length})
                    </span>
                    <div className="space-y-1">
                      {signals.map((sig: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-1)] px-2.5 py-1 text-[11px]"
                        >
                          <span className="font-medium text-[var(--text-primary)]">
                            {sig.detail || sig.signal}
                          </span>
                          <span
                            className={`py-0.2 rounded px-1.5 text-[9px] font-semibold uppercase ${
                              sig.weight === 'high'
                                ? 'bg-[rgba(239,68,68,0.12)] text-[var(--accent-danger)]'
                                : 'bg-[rgba(245,158,11,0.12)] text-[var(--accent-warning)]'
                            }`}
                          >
                            {sig.weight}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-1)] p-8 text-center text-xs text-[var(--text-secondary)]">
            No suspicious voting ring clusters detected in active cycle.
          </div>
        )}
      </div>

      {/* Reviewed History */}
      {reviewedClusters && reviewedClusters.length > 0 && (
        <div className="space-y-4 border-t border-[var(--border-subtle)] pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Reviewed Ring Decisions
          </h2>
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-1)]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-2)] font-semibold uppercase text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Accounts</th>
                  <th className="px-4 py-2.5">Overlap</th>
                  <th className="px-4 py-2.5">Decision</th>
                  <th className="px-4 py-2.5">Operator Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {reviewedClusters.map((c: any) => (
                  <tr key={c.id} className="text-[var(--text-secondary)]">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-[var(--text-tertiary)]">
                      {c.reviewed_at ? new Date(c.reviewed_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-[var(--text-primary)]">
                      @{c.profile_a?.username || 'user'} &amp; @{c.profile_b?.username || 'user'}
                    </td>
                    <td className="px-4 py-2.5 font-mono">
                      {(c.jaccard_overlap * 100).toFixed(0)}%
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                          c.status === 'actioned'
                            ? 'bg-[rgba(239,68,68,0.12)] text-[var(--accent-danger)]'
                            : 'bg-[rgba(52,211,153,0.12)] text-[var(--accent-success)]'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="max-w-xs truncate px-4 py-2.5 text-xs italic text-[var(--text-tertiary)]">
                      {c.review_note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
