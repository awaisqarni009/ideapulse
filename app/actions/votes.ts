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

/**
 * castVote() Server Action [T-3.9]
 * Invokes the cast_vote RPC in PostgreSQL.
 * Advisory locking, self-vote checks, quota validation, and verified calculations
 * are strictly enforced at the database level (ARCHITECTURE.md, ADR-002, ADR-007).
 */
export async function castVoteAction(ideaId: string): Promise<CastVoteResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('cast_vote', {
    p_idea_id: ideaId,
  });

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
