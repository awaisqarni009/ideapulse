'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/app/components/ui/toast';
import { WithdrawModal } from '@/app/components/ideas/withdraw-modal';
import { Trash2 } from 'lucide-react';

interface IdeaActionsProps {
  ideaId: string;
  voteCount: number;
  isAuthor: boolean;
  canWithdraw: boolean;
  justCreated: boolean;
  cycleNumber: number;
}

export function IdeaActions({
  ideaId,
  voteCount,
  canWithdraw,
  justCreated,
  cycleNumber,
}: IdeaActionsProps) {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  if (!canWithdraw) return null;

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] px-4 py-2 text-xs font-medium text-[var(--accent-danger)] transition-all hover:border-[rgba(239,68,68,0.4)] hover:bg-[rgba(239,68,68,0.16)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-danger)]"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Withdraw Idea
        </button>
      </div>

      <WithdrawModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ideaId={ideaId}
        voteCount={voteCount}
      />
    </>
  );
}
