'use client';

import React, { useState } from 'react';
import { reportIdea, REPORT_REASONS, type ReportReason } from '@/app/actions/reports';
import { useToast } from '@/app/components/ui/toast';
import { useFocusTrap } from '@/lib/hooks/use-focus-trap';
import { AlertTriangle, Flag, Loader2, X } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: string;
  ideaTitle: string;
  ideaSlug?: string;
}

export function ReportModal({ isOpen, onClose, ideaId, ideaTitle, ideaSlug }: ReportModalProps) {
  const toast = useToast();
  const [reason, setReason] = useState<ReportReason>('spam');
  const [detail, setDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useFocusTrap<HTMLDivElement>({
    isOpen,
    onClose,
  });

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await reportIdea({
        ideaId,
        reason,
        detail: detail.trim() || undefined,
        slug: ideaSlug,
      });

      if (res.success) {
        toast.success(
          res.message || 'Report submitted. Thank you for keeping IdeaPulse safe.',
          'Report Received',
        );
        onClose();
      } else {
        toast.error(res.error || 'Failed to submit report', 'Error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unexpected error submitting report';
      toast.error(msg, 'Error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="bg-[var(--canvas-deep)]/80 fixed inset-0 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Surface: Mobile bottom-sheet & Desktop modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative max-h-[92vh] w-full max-w-full overflow-y-auto rounded-t-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-3)] p-6 shadow-2xl transition-all focus:outline-none sm:max-w-lg sm:rounded-[var(--radius-xl)]"
      >
        {/* Mobile Bottom-sheet Drag Handle Indicator */}
        <div
          className="mx-auto -mt-2 mb-4 h-1.5 w-12 rounded-full bg-[rgba(255,255,255,0.22)] sm:hidden"
          aria-hidden="true"
        />

        {/* Specular top highlight */}
        <div
          className="pointer-events-none absolute inset-0 rounded-t-[var(--radius-xl)] shadow-[inset_0_1px_0_var(--edge-specular)] sm:rounded-[var(--radius-xl)]"
          aria-hidden="true"
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close modal"
          className="absolute right-4 top-4 rounded-[var(--radius-sm)] p-1 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--indigo)]"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.1)] text-[var(--accent-danger)]">
            <Flag className="h-5 w-5" />
          </div>
          <div>
            <h2
              id="report-modal-title"
              className="text-base font-semibold text-[var(--text-primary)]"
            >
              Report Idea
            </h2>
            <p className="mt-1 line-clamp-1 text-xs font-medium text-[var(--text-secondary)]">
              &ldquo;{ideaTitle}&rdquo;
            </p>
          </div>
        </div>

        {/* Info Callout */}
        <div className="mt-4 flex items-start gap-2.5 rounded-[var(--radius-md)] border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.06)] p-3 text-xs text-[var(--text-secondary)]">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-[var(--accent-warning)]" />
          <span>
            Three independent reports temporarily hold an idea for moderator review. False or
            abusive reporting may result in account penalties.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="report-reason"
              className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
            >
              Reason for Report
            </label>
            <div className="mt-2 space-y-2">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border p-2.5 transition-colors ${
                    reason === r.value
                      ? 'border-[var(--indigo)] bg-[rgba(99,102,241,0.08)]'
                      : 'border-[var(--border-subtle)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="mt-0.5 text-[var(--indigo)] focus:ring-[var(--indigo)]"
                  />
                  <div className="text-xs">
                    <span className="font-medium text-[var(--text-primary)]">{r.label}</span>
                    <p className="mt-0.5 text-[var(--text-tertiary)]">{r.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="report-detail"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
              >
                Additional Details (Optional)
              </label>
              <span className="text-[10px] text-[var(--text-tertiary)]">{detail.length}/500</span>
            </div>
            <textarea
              id="report-detail"
              value={detail}
              maxLength={500}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Explain why this content violates community guidelines..."
              rows={3}
              className="mt-1.5 w-full resize-none rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--indigo)] focus:outline-none focus:ring-1 focus:ring-[var(--indigo)]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--indigo)] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-[var(--indigo-bright)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo)] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
