import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { AbuseFilters } from './abuse-filters';
import { AlertTriangle, Fingerprint, Lock, ShieldAlert, Terminal } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Abuse Audit — Admin Console',
};

interface AbusePageProps {
  searchParams: {
    kind?: string;
    actor?: string;
  };
}

export default async function AdminAbusePage({ searchParams }: AbusePageProps) {
  const supabase = await createClient();

  let query = supabase
    .from('abuse_events')
    .select(
      `
      id,
      actor_id,
      kind,
      error_code,
      target_table,
      target_id,
      ip_hash,
      detail,
      created_at,
      profiles(username, display_name)
    `,
    )
    .order('created_at', { ascending: false })
    .limit(100);

  if (searchParams.kind && searchParams.kind !== 'all') {
    query = query.eq('kind', searchParams.kind as any);
  }

  if (searchParams.actor) {
    const actorInput = searchParams.actor.trim();
    // Check if valid UUID format or match username
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      actorInput,
    );
    if (isUuid) {
      query = query.eq('actor_id', actorInput);
    }
  }

  const { data: events, error } = await query;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl">
          Abuse & Security Events
        </h1>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Audit trail of rejected writes, rate-limit trips, and anti-abuse violations recorded per
          BR-036.
        </p>
      </div>

      {/* Safety Invariants Info Callout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.05)] p-3 text-xs text-[var(--text-secondary)]">
          <Fingerprint className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--indigo)]" />
          <div>
            <strong className="text-[var(--text-primary)]">BR-035 Privacy Standard:</strong>
            <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-tertiary)]">
              No raw IP addresses are ever stored. Identifiers are salted daily with SHA-256 to
              allow same-day correlation without persistent surveillance.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.05)] p-3 text-xs text-[var(--text-secondary)]">
          <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--accent-warning)]" />
          <div>
            <strong className="text-[var(--text-primary)]">BR-036 Rejection Logging:</strong>
            <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-tertiary)]">
              All malicious or prohibited write attempts record an immutable event row in
              PostgreSQL. Retention is purged after 180 days (T-6.14).
            </p>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <AbuseFilters />

      {/* Audit Table */}
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-2)] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-1)] font-semibold uppercase text-[var(--text-tertiary)]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Kind</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Error Code</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3 font-mono">IP Hash</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {events && events.length > 0 ? (
                events.map((event) => {
                  const actor = Array.isArray(event.profiles) ? event.profiles[0] : event.profiles;
                  const detailStr =
                    event.detail && Object.keys(event.detail).length > 0
                      ? JSON.stringify(event.detail)
                      : null;

                  return (
                    <tr
                      key={event.id}
                      className="text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-1)]"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-[var(--text-tertiary)]">
                        {new Date(event.created_at).toLocaleDateString()}{' '}
                        {new Date(event.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="whitespace-nowrap rounded-[var(--radius-xs)] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--accent-danger)]">
                          {event.kind.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {actor?.username ? (
                          <span className="font-medium text-[var(--text-primary)]">
                            @{actor.username}
                          </span>
                        ) : event.actor_id ? (
                          <span
                            className="font-mono text-[10px] text-[var(--text-tertiary)]"
                            title={event.actor_id}
                          >
                            {event.actor_id.slice(0, 8)}...
                          </span>
                        ) : (
                          <span className="italic text-[var(--text-tertiary)]">Anonymous</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-[var(--accent-warning)]">
                        {event.error_code}
                      </td>
                      <td className="px-4 py-3 text-[11px]">
                        {event.target_table ? (
                          <span>
                            {event.target_table}
                            {event.target_id && (
                              <span className="ml-1 font-mono text-[10px] text-[var(--text-tertiary)]">
                                #{event.target_id.slice(0, 6)}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-[var(--text-tertiary)]">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-[10px] text-[var(--text-tertiary)]">
                        {event.ip_hash ? event.ip_hash.slice(0, 12) + '...' : '—'}
                      </td>
                      <td
                        className="max-w-xs truncate px-4 py-3 font-mono text-[10px] text-[var(--text-tertiary)]"
                        title={detailStr || ''}
                      >
                        {detailStr || '—'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-xs text-[var(--text-tertiary)]"
                  >
                    No abuse events found matching the specified filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
