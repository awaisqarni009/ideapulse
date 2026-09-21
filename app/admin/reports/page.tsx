import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { ReportActionPanel } from './report-action-panel';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Flag,
  Inbox,
  ShieldAlert,
  User,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reports Queue — Admin Console',
};

export default async function AdminReportsPage() {
  const supabase = await createClient();

  // 1. Fetch active reports where resolved_at is null
  const { data: openReports } = await supabase
    .from('reports')
    .select(
      `
      id,
      idea_id,
      reason,
      detail,
      created_at,
      reporter_id,
      profiles!reports_reporter_id_fkey(username, display_name),
      ideas(id, title, slug, status, report_count, author_id, profiles(username, display_name))
    `,
    )
    .is('resolved_at', null)
    .order('created_at', { ascending: false });

  // 2. Fetch ideas currently in under_review status
  const { data: underReviewIdeas } = await supabase
    .from('ideas')
    .select(
      `
      id,
      title,
      slug,
      status,
      report_count,
      vote_count,
      created_at,
      profiles(username, display_name)
    `,
    )
    .eq('status', 'under_review')
    .order('created_at', { ascending: false });

  // 3. Fetch recently resolved reports
  const { data: resolvedReports } = await supabase
    .from('reports')
    .select(
      `
      id,
      idea_id,
      reason,
      resolution,
      resolved_at,
      created_at,
      ideas(id, title, slug, status)
    `,
    )
    .not('resolved_at', 'is', null)
    .order('resolved_at', { ascending: false })
    .limit(10);

  // Group open reports by idea
  const reportsByIdea = new Map<
    string,
    {
      idea: any;
      reports: typeof openReports;
    }
  >();

  openReports?.forEach((r) => {
    if (!r.idea_id) return;
    const existing = reportsByIdea.get(r.idea_id);
    if (existing) {
      existing.reports?.push(r);
    } else {
      reportsByIdea.set(r.idea_id, {
        idea: r.ideas,
        reports: [r],
      });
    }
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl">
          Reports Queue & Moderation
        </h1>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Review community flags, investigate reported ideas, and record audited moderation
          decisions.
        </p>
      </div>

      {/* Under Review Notice Banner (BR-037) */}
      {underReviewIdeas && underReviewIdeas.length > 0 && (
        <div className="rounded-[var(--radius-lg)] border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.06)] p-4 text-xs">
          <div className="flex items-center gap-2.5 font-semibold text-[var(--accent-warning)]">
            <ShieldAlert className="h-4 w-4" />
            <span>
              {underReviewIdeas.length} idea{underReviewIdeas.length > 1 ? 's' : ''} currently held
              in Under Review (BR-037)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
            These ideas received 3 distinct community reports. Public feed visibility is hidden and
            voting is frozen pending operator decision.
          </p>

          <div className="mt-3 space-y-2">
            {underReviewIdeas.map((idea) => {
              const author = Array.isArray(idea.profiles) ? idea.profiles[0] : idea.profiles;
              return (
                <div
                  key={idea.id}
                  className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <Link
                      href={`/idea/${idea.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)] hover:text-[var(--indigo)]"
                    >
                      {idea.title}
                      <ExternalLink className="h-3 w-3 text-[var(--text-tertiary)]" />
                    </Link>
                    <div className="mt-0.5 text-[11px] text-[var(--text-tertiary)]">
                      By @{author?.username || 'unknown'} · {idea.vote_count} votes · status:{' '}
                      {idea.status}
                    </div>
                  </div>

                  <ReportActionPanel
                    ideaId={idea.id}
                    ideaTitle={idea.title}
                    currentStatus={idea.status}
                    reportCount={idea.report_count}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Reports by Idea */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-[var(--accent-danger)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Open Reports Queue ({openReports?.length || 0} reports on {reportsByIdea.size} ideas)
            </h2>
          </div>
        </div>

        {reportsByIdea.size > 0 ? (
          <div className="space-y-4">
            {Array.from(reportsByIdea.entries()).map(([ideaId, group]) => {
              const idea = group.idea;
              const author = Array.isArray(idea?.profiles) ? idea?.profiles[0] : idea?.profiles;
              return (
                <div
                  key={ideaId}
                  className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-5 shadow-lg backdrop-blur-md"
                >
                  {/* Top Bar of Idea */}
                  <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-[var(--radius-xs)] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-danger)]">
                          {group.reports?.length} Report{group.reports?.length !== 1 ? 's' : ''}
                        </span>
                        <span className="rounded-[var(--radius-xs)] border border-[var(--border-subtle)] bg-[var(--surface-1)] px-2 py-0.5 font-mono text-[10px] text-[var(--text-tertiary)]">
                          status: {idea?.status || 'published'}
                        </span>
                      </div>
                      <h3 className="mt-2 text-sm font-bold text-[var(--text-primary)]">
                        <Link
                          href={`/idea/${idea?.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 hover:text-[var(--indigo)]"
                        >
                          {idea?.title || 'Unknown Idea'}
                          <ExternalLink className="h-3 w-3 text-[var(--text-tertiary)]" />
                        </Link>
                      </h3>
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                        Author: @{author?.username || 'user'}
                      </p>
                    </div>

                    <ReportActionPanel
                      ideaId={ideaId}
                      ideaTitle={idea?.title || 'Idea'}
                      currentStatus={idea?.status || 'published'}
                      reportCount={group.reports?.length || 0}
                    />
                  </div>

                  {/* Individual Reports for this idea */}
                  <div className="mt-4 space-y-2">
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Submitted Flags
                    </h4>
                    <div className="divide-y divide-[var(--border-subtle)] rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-1)]">
                      {group.reports?.map((r: any) => {
                        const reporter = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
                        return (
                          <div
                            key={r.id}
                            className="flex flex-col gap-2 p-3 text-xs sm:flex-row sm:items-start sm:justify-between"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold capitalize text-[var(--text-primary)]">
                                  {r.reason.replace(/_/g, ' ')}
                                </span>
                                <span className="text-[10px] text-[var(--text-tertiary)]">
                                  by @{reporter?.username || 'user'}
                                </span>
                              </div>
                              {r.detail && (
                                <p className="text-xs italic text-[var(--text-secondary)]">
                                  &ldquo;{r.detail}&rdquo;
                                </p>
                              )}
                            </div>
                            <span className="whitespace-nowrap font-mono text-[10px] text-[var(--text-tertiary)]">
                              {new Date(r.created_at).toLocaleDateString()}{' '}
                              {new Date(r.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-1)] py-12 text-center">
            <Inbox className="mb-2 h-8 w-8 text-[var(--text-tertiary)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Reports Queue is Clean
            </h3>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              No pending user reports requiring moderator review.
            </p>
          </div>
        )}
      </div>

      {/* Recently Resolved History */}
      {resolvedReports && resolvedReports.length > 0 && (
        <div className="space-y-4 border-t border-[var(--border-subtle)] pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Recently Resolved Moderation History
          </h2>
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-1)]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-2)] font-semibold uppercase text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Idea</th>
                  <th className="px-4 py-2.5">Flag Reason</th>
                  <th className="px-4 py-2.5">Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {resolvedReports.map((item: any) => {
                  const idea = Array.isArray(item.ideas) ? item.ideas[0] : item.ideas;
                  return (
                    <tr key={item.id} className="text-xs text-[var(--text-secondary)]">
                      <td className="px-4 py-2.5 font-mono text-[11px] text-[var(--text-tertiary)]">
                        {item.resolved_at ? new Date(item.resolved_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-[var(--text-primary)]">
                        {idea?.title || 'Idea'}
                      </td>
                      <td className="px-4 py-2.5 capitalize text-[var(--text-tertiary)]">
                        {item.reason}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                            item.resolution === 'remove'
                              ? 'bg-[rgba(239,68,68,0.12)] text-[var(--accent-danger)]'
                              : 'bg-[rgba(52,211,153,0.12)] text-[var(--accent-success)]'
                          }`}
                        >
                          {item.resolution}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
