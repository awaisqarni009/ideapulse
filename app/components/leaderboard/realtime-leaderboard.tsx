'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { LeaderboardItem } from '@/lib/leaderboard';
import { LeaderboardRow } from '@/app/components/leaderboard/leaderboard-row';
import { Clock } from 'lucide-react';

interface RealtimeLeaderboardProps {
  initialItems: LeaderboardItem[];
  cycleId?: string | null;
  cycleNumber: number;
}

/**
 * RealtimeLeaderboard Component per ARCHITECTURE.md §2.9 and TASKS.md [T-4.11, T-4.12]
 * - Realtime subscription on `ideas` filtered by `cycle_id`
 * - Computes dynamic rankings client-side upon live vote updates
 * - Framer Motion spring reorder with cyan border flash for ascending ideas
 */
export function RealtimeLeaderboard({
  initialItems,
  cycleId,
  cycleNumber,
}: RealtimeLeaderboardProps) {
  const [items, setItems] = useState<LeaderboardItem[]>(initialItems);
  const [flashingIds, setFlashingIds] = useState<Set<string>>(new Set());
  const timerRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Trigger 600ms cyan flash for an item that moved up [T-4.12]
  const triggerCyanFlash = useCallback((id: string) => {
    // Clear any existing timer for this item
    if (timerRefs.current.has(id)) {
      clearTimeout(timerRefs.current.get(id)!);
    }

    setFlashingIds((prev) => new Set(prev).add(id));

    const timeout = setTimeout(() => {
      setFlashingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      timerRefs.current.delete(id);
    }, 600);

    timerRefs.current.set(id, timeout);
  }, []);

  // Update item counts and re-derive rankings
  const applyIdeaUpdate = useCallback(
    (updatedIdea: { id: string; vote_count?: number; verified_vote_count?: number }) => {
      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex((it) => it.idea_id === updatedIdea.id);
        if (existingIndex === -1) return prevItems;

        const target = prevItems[existingIndex];
        if (!target) return prevItems;

        const currentRank = target.cycle_rank;
        const updatedItem: LeaderboardItem = {
          ...target,
          vote_count: updatedIdea.vote_count ?? target.vote_count,
          verified_vote_count: updatedIdea.verified_vote_count ?? target.verified_vote_count,
        };

        const updatedList = [...prevItems];
        updatedList[existingIndex] = updatedItem;

        // Re-sort: verified_vote_count DESC, created_at ASC
        updatedList.sort((a, b) => {
          if (b.verified_vote_count !== a.verified_vote_count) {
            return b.verified_vote_count - a.verified_vote_count;
          }
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });

        // Re-assign ranks
        const reRanked = updatedList.map((item, index) => {
          if (index > 0) {
            const prev = updatedList[index - 1];
            if (prev && prev.verified_vote_count === item.verified_vote_count) {
              item.cycle_rank = prev.cycle_rank;
            } else {
              item.cycle_rank = index + 1;
            }
          } else {
            item.cycle_rank = 1;
          }
          return item;
        });

        // Check if the updated idea moved up
        const newRankItem = reRanked.find((it) => it.idea_id === updatedIdea.id);
        if (newRankItem && newRankItem.cycle_rank < currentRank) {
          triggerCyanFlash(updatedIdea.id);
        }

        return reRanked;
      });
    },
    [triggerCyanFlash],
  );

  // Subscribe to Realtime Postgres Changes on `ideas` filtered by cycle_id [T-4.11]
  useEffect(() => {
    if (!cycleId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`leaderboard-cycle-${cycleId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ideas',
          filter: `cycle_id=eq.${cycleId}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (row?.id) {
            applyIdeaUpdate({
              id: row.id,
              vote_count: row.vote_count,
              verified_vote_count: row.verified_vote_count,
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cycleId, applyIdeaUpdate]);

  // Also listen for local vote events within the browser session
  useEffect(() => {
    const handleLocalVote = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: string; ideaId: string }>;
      if (customEvent.detail?.ideaId) {
        setItems((prev) => {
          const target = prev.find((it) => it.idea_id === customEvent.detail.ideaId);
          if (target) {
            applyIdeaUpdate({
              id: target.idea_id,
              vote_count: target.vote_count + 1,
              verified_vote_count: target.verified_vote_count + 1,
            });
          }
          return prev;
        });
      }
    };

    window.addEventListener('ideapulse:vote-update', handleLocalVote);
    return () => {
      window.removeEventListener('ideapulse:vote-update', handleLocalVote);
    };
  }, [applyIdeaUpdate]);

  if (items.length === 0) {
    return (
      <div className="glass-panel rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] p-12 text-center">
        <Clock className="mx-auto h-8 w-8 text-[var(--text-tertiary)]" />
        <h3 className="mt-3 font-display text-base font-bold text-[var(--text-primary)]">
          No ranked ideas yet
        </h3>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Cast your daily votes to help community proposals rise on the leaderboard.
        </p>
      </div>
    );
  }

  return (
    <ol role="list" className="space-y-3" aria-label={`Cycle #${cycleNumber} top ranked ideas`}>
      {items.map((item) => (
        <LeaderboardRow key={item.idea_id} item={item} isFlashing={flashingIds.has(item.idea_id)} />
      ))}
    </ol>
  );
}
