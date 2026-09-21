'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/app/components/ui/toast';
import { WithdrawModal } from '@/app/components/ideas/withdraw-modal';
import { ReportModal } from '@/app/components/reports/report-modal';
import { Flag, Trash2 } from 'lucide-react';

interface IdeaActionsProps {
  ideaId: string;
  ideaTitle: string;
  ideaSlug: string;
  voteCount: number;
  isAuthor: boolean;
  canWithdraw: boolean;
  justCreated: boolean;
  cycleNumber: number;
}

export function IdeaActions({
  ideaId,
  ideaTitle,
  ideaSlug,
  voteCount,
  isAuthor,
  canWithdraw,
  justCreated,
  cycleNumber,
}: IdeaActionsProps) {
  const toast = useToast();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    if (justCreated) {
      toast.success(
        `Idea published successfully! It is now competing in Cycle ${cycleNumber}.`,
        'Submission Received',
      );
      // Clean up URL without reloading
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [justCreated, cycleNumber, toast]);

  return (
    <>
      <div className="flex items-center gap-2">
        {canWithdraw && (
          <button
            type="button"
            onClick={() => setIsWithdrawModalOpen(true)}
            className="btn inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] px-3 py-2 text-xs font-medium text-[var(--accent-danger)] transition-all hover:border-[rgba(239,68,68,0.4)] hover:bg-[rgba(239,68,68,0.16)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-danger)]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Withdraw Idea
          </button>
        )}

        {!isAuthor && (
          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="btn inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-1)] px-3 py-2 text-xs font-medium text-[var(--text-tertiary)] transition-all hover:border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.06)] hover:text-[var(--accent-danger)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-danger)]"
            title="Report this idea"
          >
            <Flag className="h-3.5 w-3.5" />
            Report
          </button>
        )}
      </div>

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        ideaId={ideaId}
        voteCount={voteCount}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        ideaId={ideaId}
        ideaTitle={ideaTitle}
        ideaSlug={ideaSlug}
      />
    </>
  );
}
