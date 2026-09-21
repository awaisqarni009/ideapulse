'use server';

import { createClient } from '@/lib/supabase/server';
import { parseVoteError, type VoteError } from '@/lib/votes/errors';
import { revalidatePath } from 'next/cache';

export type CastVoteResult =
  | {
      success: true;
      voteId: string;
      isVerified: boolean;
      votesUsed: number;
      votesLimit: number;
      ideaId: string;
    }
  | {
      success: false;
      error: VoteError;
    };

export type RetractVoteResult =
  | {
      success: true;
      ideaId: string;
      quotaRefunded: boolean;
    }
  | {
      success: false;
      error: VoteError;
    };

export interface VoteQuotaResult {
  totalLimit: number;
  usedCount: number;
  remaining: number;
  nextSlotAt: string | null;
}

/**
 * castVote() Server Action [T-3.9]
 * Invokes the cast_vote RPC in PostgreSQL.
 * Advisory locking, self-vote checks, quota validation, and verified calculations
 * are strictly enforced at the database level (ARCHITECTURE.md, ADR-002, ADR-007).
 */
export async function castVoteAction(ideaId: string): Promise<CastVoteResult> {
  const supabase = await createClient();

  let { data, error } = await supabase.rpc('cast_vote', {
    p_idea_id: ideaId,
  });

  // T-5.7: Handle IP_NO_ACTIVE_CYCLE during rotation: automatic retry after 3 s (RULES.md BR-043)
  if (error && (error.message?.includes('IP_NO_ACTIVE_CYCLE') || error.code === '503')) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const retry = await supabase.rpc('cast_vote', {
      p_idea_id: ideaId,
    });
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    return {
      success: false,
      error: parseVoteError(error),
    };
  }

  // Typecast returned jsonb from RPC
  const payload = data as {
    vote_id: string;
    is_verified: boolean;
    votes_used: number;
    votes_limit: number;
    idea_id: string;
  };

  revalidatePath('/');
  revalidatePath('/leaderboard');

  return {
    success: true,
    voteId: payload.vote_id,
    isVerified: payload.is_verified,
    votesUsed: payload.votes_used,
    votesLimit: payload.votes_limit,
    ideaId: payload.idea_id,
  };
}

/**
 * retractVote() Server Action [T-3.18, RULES.md BR-014]
 * Invokes public.retract_vote RPC.
 * A vote may be retracted within 10 minutes of being cast.
 * The quota slot it consumed remains consumed for 24 hours (ADR-004).
 */
export async function retractVoteAction(ideaId: string): Promise<RetractVoteResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('retract_vote', {
    p_idea_id: ideaId,
  });

  if (error) {
    return {
      success: false,
      error: parseVoteError(error),
    };
  }

  const payload = data as { idea_id: string; quota_refunded: boolean };

  revalidatePath('/');
  revalidatePath('/leaderboard');

  return {
    success: true,
    ideaId: payload.idea_id,
    quotaRefunded: payload.quota_refunded,
  };
}

/**
 * getVoteQuota() Server Action [T-3.16, T-3.17]
 * Derives rolling 24-hour quota state and nextSlotAt from database.
 */
export async function getVoteQuotaAction(): Promise<VoteQuotaResult | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: cycle } = await supabase
    .from('cycles')
    .select('daily_vote_limit')
    .eq('status', 'active')
    .maybeSingle();

  const dailyLimit = cycle?.daily_vote_limit ?? 5;
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: votes } = await supabase
    .from('votes')
    .select('created_at')
    .eq('voter_id', user.id)
    .in('status', ['active', 'retracted'])
    .gt('created_at', twentyFourHoursAgo)
    .order('created_at', { ascending: true });

  const usedCount = votes?.length ?? 0;
  const remaining = Math.max(0, dailyLimit - usedCount);

  let nextSlotAt: string | null = null;
  const firstVote = votes && votes.length > 0 ? votes[0] : null;
  if (firstVote?.created_at) {
    const earliest = new Date(firstVote.created_at).getTime();
    nextSlotAt = new Date(earliest + 24 * 60 * 60 * 1000).toISOString();
  }

  return {
    totalLimit: dailyLimit,
    usedCount,
    remaining,
    nextSlotAt,
  };
}
