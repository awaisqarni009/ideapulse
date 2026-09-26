'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
  ThumbsUp,
  AlertTriangle,
  Loader2,
  Filter,
  Check,
  X,
  Sparkles,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { adminApproveIdeaAction, adminDeclineIdeaAction } from '@/app/actions/admin-management';
import { formatDistanceToNow } from 'date-fns';

export interface IdeaItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  status: 'published' | 'withdrawn' | 'under_review' | 'removed';
  vote_count: number;
  verified_vote_count: number;
  report_count: number;
  qualified_at: string | null;
  created_at: string;
  author: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string | null;
    role?: string;
  } | null;
  cycle: {
    id: string;
    cycle_number: number;
    status: string;
    vote_threshold?: number;
  } | null;
}

interface IdeasModerationDeckProps {
  initialIdeas: IdeaItem[];
  defaultThreshold?: number;
}

export function IdeasModerationDeck({
  initialIdeas,
  defaultThreshold = 50,
}: IdeasModerationDeckProps) {
  const [ideas, setIdeas] = useState<IdeaItem[]>(initialIdeas);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  // Modal state for declining
  const [declineTarget, setDeclineTarget] = useState<IdeaItem | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  // Notification state
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredIdeas = ideas.filter((idea) => {
    // Status filter
    if (filterStatus === 'under_review' && idea.status !== 'under_review') return false;
    if (filterStatus === 'published' && idea.status !== 'published') return false;
    if (filterStatus === 'removed' && idea.status !== 'removed') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = idea.title.toLowerCase().includes(q);
      const matchSummary = idea.summary.toLowerCase().includes(q);
      const matchAuthor =
        idea.author?.username?.toLowerCase().includes(q) ||
        idea.author?.display_name?.toLowerCase().includes(q);
      const matchCategory = idea.category?.toLowerCase().includes(q);
      return matchTitle || matchSummary || matchAuthor || matchCategory;
    }

    return true;
  });

  const handleApprove = (idea: IdeaItem) => {
    setAlert(null);
    startTransition(async () => {
      const res = await adminApproveIdeaAction({
        ideaId: idea.id,
        reason: 'Approved via Admin Idea Moderation Deck',
      });

      if (res.success) {
        setIdeas((prev) => prev.map((i) => (i.id === idea.id ? { ...i, status: 'published' } : i)));
        setAlert({
          type: 'success',
          message: res.message || `Idea "${idea.title}" approved and published!`,
        });
      } else {
        setAlert({ type: 'error', message: res.error || 'Failed to approve idea.' });
      }
    });
  };

  const handleConfirmDecline = () => {
    if (!declineTarget) return;
    if (!declineReason || declineReason.trim().length < 4) {
      setAlert({
        type: 'error',
        message: 'Please provide a clear reason for declining (at least 4 characters).',
      });
      return;
    }

    const targetId = declineTarget.id;
    const targetTitle = declineTarget.title;

    setAlert(null);
    startTransition(async () => {
      const res = await adminDeclineIdeaAction({
        ideaId: targetId,
        reason: declineReason.trim(),
      });

      if (res.success) {
        setIdeas((prev) => prev.map((i) => (i.id === targetId ? { ...i, status: 'removed' } : i)));
        setAlert({
          type: 'success',
          message: res.message || `Idea "${targetTitle}" declined and removed.`,
        });
        setDeclineTarget(null);
        setDeclineReason('');
      } else {
        setAlert({ type: 'error', message: res.error || 'Failed to decline idea.' });
      }
    });
  };

  const counts = {
    all: ideas.length,
    under_review: ideas.filter((i) => i.status === 'under_review').length,
    published: ideas.filter((i) => i.status === 'published').length,
    removed: ideas.filter((i) => i.status === 'removed').length,
  };

  return (
    <div className="space-y-6">
      {/* Alert banner */}
      {alert && (
        <div
          className={`flex items-center justify-between rounded-xl border p-4 text-xs font-medium backdrop-blur-md transition-all ${
            alert.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {alert.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{alert.message}</span>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="rounded p-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header and Controls */}
      <div
        className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-xl backdrop-blur-md"
        style={{
          boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.35), inset 0 1px 0 var(--edge-specular)',
        }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.1)] text-[var(--indigo-bright)]">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                Proposals & Idea Moderation Deck
              </h2>
            </div>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Approve requests for community voting, decline infringing proposals, and monitor
              verified vote counts against the cycle threshold.
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, author, category..."
              className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] py-2 pl-9 pr-4 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] transition-colors focus:border-[var(--indigo)] focus:outline-none focus:ring-1 focus:ring-[var(--indigo)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[var(--border-subtle)] pt-4">
          <button
            onClick={() => setFilterStatus('all')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterStatus === 'all'
                ? 'bg-[var(--indigo)] text-white shadow-md shadow-indigo-500/20'
                : 'border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>All Proposals</span>
            <span className="py-0.2 rounded-full bg-black/20 px-1.5 font-mono text-[10px]">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('under_review')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterStatus === 'under_review'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>Needs Review / Flagged</span>
            <span
              className={`py-0.2 rounded-full px-1.5 font-mono text-[10px] ${
                counts.under_review > 0 ? 'bg-amber-400/30 font-bold text-amber-300' : 'bg-black/20'
              }`}
            >
              {counts.under_review}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('published')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterStatus === 'published'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>Approved & Active</span>
            <span className="py-0.2 rounded-full bg-black/20 px-1.5 font-mono text-[10px]">
              {counts.published}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('removed')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterStatus === 'removed'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>Declined / Removed</span>
            <span className="py-0.2 rounded-full bg-black/20 px-1.5 font-mono text-[10px]">
              {counts.removed}
            </span>
          </button>
        </div>
      </div>

      {/* Ideas List */}
      <div className="space-y-4">
        {filteredIdeas.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-tertiary)]">
              <Filter className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-sm font-bold text-[var(--text-primary)]">
              No Proposals Match Current Filters
            </h3>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Try adjusting your search terms or selecting another status filter above.
            </p>
          </div>
        ) : (
          filteredIdeas.map((idea) => {
            const threshold = idea.cycle?.vote_threshold ?? defaultThreshold;
            const progressPct = Math.min(
              100,
              Math.round((idea.verified_vote_count / threshold) * 100),
            );
            const isQualified = Boolean(idea.qualified_at || idea.verified_vote_count >= threshold);

            return (
              <div
                key={idea.id}
                className="hover:border-[var(--indigo)]/40 hover:bg-[var(--surface-1)]/90 group rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-5 shadow-lg backdrop-blur-md transition-all"
                style={{
                  boxShadow:
                    '0 8px 30px -8px rgba(0, 0, 0, 0.25), inset 0 1px 0 var(--edge-specular)',
                }}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Left Column: Idea Details */}
                  <div className="space-y-3 lg:max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Badge */}
                      {idea.status === 'published' && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Approved & Published
                        </span>
                      )}
                      {idea.status === 'under_review' && (
                        <span className="inline-flex animate-pulse items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
                          <AlertTriangle className="h-3 w-3" />
                          Under Review / Flagged
                        </span>
                      )}
                      {idea.status === 'removed' && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400">
                          <XCircle className="h-3 w-3" />
                          Declined / Removed
                        </span>
                      )}
                      {idea.status === 'withdrawn' && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-500/30 bg-zinc-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-400">
                          Withdrawn by Author
                        </span>
                      )}

                      {/* Category Badge */}
                      <span className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
                        {idea.category.toUpperCase()}
                      </span>

                      {/* Cycle Badge */}
                      {idea.cycle && (
                        <span className="font-mono text-[11px] text-[var(--indigo-bright)]">
                          Cycle #{idea.cycle.cycle_number}
                        </span>
                      )}

                      {/* Creation time */}
                      <span className="text-[11px] text-[var(--text-tertiary)]">
                        • {formatDistanceToNow(new Date(idea.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    <div>
                      <Link
                        href={`/idea/${idea.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 font-display text-base font-bold text-[var(--text-primary)] hover:text-[var(--indigo-bright)]"
                      >
                        <span>{idea.title}</span>
                        <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                      </Link>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                        {idea.summary}
                      </p>
                    </div>

                    {/* Author line */}
                    <div className="flex items-center gap-2 pt-1 text-xs text-[var(--text-tertiary)]">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface-3)] text-[10px] font-bold text-[var(--text-primary)]">
                        {idea.author?.username?.slice(0, 1).toUpperCase() || 'U'}
                      </div>
                      <span>
                        Author:{' '}
                        <strong className="text-[var(--text-secondary)]">
                          @{idea.author?.username || 'unknown'}
                        </strong>
                      </span>
                      {idea.author?.role && idea.author.role !== 'member' && (
                        <span className="bg-[var(--indigo)]/20 py-0.2 rounded px-1 text-[9px] font-bold uppercase text-[var(--indigo-bright)]">
                          {idea.author.role}
                        </span>
                      )}
                      {idea.report_count > 0 && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[var(--accent-warning)]">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{idea.report_count} flags</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Vote Gauge & Action Buttons */}
                  <div className="flex flex-col gap-4 sm:flex-row lg:flex-col lg:items-end">
                    {/* Votes Box */}
                    <div
                      className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] p-3.5 sm:w-64"
                      style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                          Vote Telemetry
                        </span>
                        {isQualified && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                            <Check className="h-2.5 w-2.5" /> Qualified
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono text-2xl font-black text-[var(--cyan-bright)]">
                            {idea.verified_vote_count}
                          </span>
                          <span className="text-[10px] text-[var(--text-tertiary)]">
                            / {threshold} req.
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                          {idea.vote_count} total votes
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${progressPct}%`,
                            background: isQualified
                              ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                              : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                          }}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-[var(--text-tertiary)]">
                        <span>Verified weight: {progressPct}%</span>
                        <span>{idea.vote_count - idea.verified_vote_count} unverified</span>
                      </div>
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="flex items-center gap-2">
                      {idea.status !== 'published' && (
                        <button
                          onClick={() => handleApprove(idea)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-600/20 px-3.5 py-2 text-xs font-bold text-emerald-300 shadow-sm transition-all hover:bg-emerald-600 hover:text-white disabled:opacity-50"
                        >
                          {isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          <span>Approve & Publish</span>
                        </button>
                      )}

                      {idea.status !== 'removed' && (
                        <button
                          onClick={() => {
                            setDeclineTarget(idea);
                            setDeclineReason('');
                          }}
                          disabled={isPending}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 shadow-sm transition-all hover:bg-rose-600 hover:text-white disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Decline</span>
                        </button>
                      )}

                      <Link
                        href={`/idea/${idea.slug}`}
                        target="_blank"
                        className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] p-2 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
                        title="View Live Proposal"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Decline Idea Modal Dialog */}
      {declineTarget && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-lg rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-2xl backdrop-blur-xl"
            style={{
              boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 var(--edge-specular)',
            }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-2 text-rose-400">
                <XCircle className="h-5 w-5" />
                <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
                  Decline Proposal
                </h3>
              </div>
              <button
                onClick={() => setDeclineTarget(null)}
                className="rounded-lg p-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Target Proposal
                </p>
                <p className="mt-1 font-display text-sm font-bold text-[var(--text-primary)]">
                  {declineTarget.title}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  By @{declineTarget.author?.username || 'unknown'} •{' '}
                  {declineTarget.verified_vote_count} verified votes
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                  Decline Reason (Required for audit log & author notification):
                </label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="e.g. Duplicate proposal of #142, violates community content guidelines, or incomplete implementation plan..."
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] p-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-[11px] text-rose-300">
                Declining this idea will mark its status as <strong>removed</strong>, hiding it from
                community discovery and the active voting leaderboard.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeclineTarget(null)}
                  disabled={isPending}
                  className="rounded-xl border border-[var(--border-default)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDecline}
                  disabled={isPending || declineReason.trim().length < 4}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/50 bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Confirm Decline</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
