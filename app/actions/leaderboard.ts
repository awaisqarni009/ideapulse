'use server';

import { createClient } from '@/lib/supabase/server';
import type { LeaderboardItem } from '@/lib/leaderboard';

export interface LeaderboardResult {
  cycleId: string | null;
  cycleNumber: number;
  endsAt: string | null;
  items: LeaderboardItem[];
}

/**
 * getLeaderboardAction Server Action [T-4.9]
 * Fetches top 20 proposals for active cycle from idea_public_stats with rank ordering.
 */
export async function getLeaderboardAction(): Promise<LeaderboardResult> {
  const supabase = await createClient();

  // 1. Fetch active cycle
  const { data: cycle } = await supabase
    .from('cycles')
    .select('id, cycle_number, ends_at, vote_threshold')
    .eq('status', 'active')
    .maybeSingle();

  if (!cycle) {
    return {
      cycleId: null,
      cycleNumber: 1,
      endsAt: null,
      items: [],
    };
  }

  // 2. Fetch top 20 ideas via get_leaderboard RPC
  const { data, error } = await supabase.rpc('get_leaderboard', {
    p_cycle_id: cycle.id,
    p_limit: 20,
  });

  if (error || !data) {
    console.error('Failed to fetch leaderboard:', error);
    return {
      cycleId: cycle.id,
      cycleNumber: cycle.cycle_number,
      endsAt: cycle.ends_at,
      items: [],
    };
  }

  const items: LeaderboardItem[] = data.map((row) => ({
    idea_id: row.idea_id,
    cycle_id: row.cycle_id,
    cycle_rank: Number(row.cycle_rank) || 1,
    title: row.title,
    slug: row.slug,
    author_id: row.author_id,
    author_username: row.author_username,
    author_display_name: row.author_display_name,
    author_avatar_url: row.author_avatar_url,
    vote_count: row.vote_count,
    verified_vote_count: row.verified_vote_count,
    vote_threshold: row.vote_threshold,
    is_qualified: row.is_qualified,
    votes_to_qualify: row.votes_to_qualify,
    created_at: row.created_at,
  }));

  return {
    cycleId: cycle.id,
    cycleNumber: cycle.cycle_number,
    endsAt: cycle.ends_at,
    items,
  };
}
