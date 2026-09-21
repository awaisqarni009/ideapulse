'use server';

import { createClient } from '@/lib/supabase/server';
import {
  type GetFeedParams,
  type FeedResult,
  type FeedIdeaItem,
  decodeFeedCursor,
  encodeFeedCursor,
} from '@/lib/feed';

export type {
  FeedSortOption,
  FeedIdeaItem,
  FeedCursorData,
  GetFeedParams,
  FeedResult,
} from '@/lib/feed';

/**
 * getFeedIdeasAction Server Action [T-4.1, T-4.2, T-4.5]
 * Fetches ideas with SQL trending score, cursor pagination, and viewer vote mappings.
 */
export async function getFeedIdeasAction(params: GetFeedParams = {}): Promise<FeedResult> {
  const {
    sort = 'trending',
    category = null,
    tag = null,
    search = null,
    cursor = null,
    limit = 12,
  } = params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const decodedCursor = decodeFeedCursor(cursor);

  // Invoke SQL RPC get_feed_ideas
  const { data, error } = await supabase.rpc('get_feed_ideas', {
    p_sort: sort,
    p_category: category || undefined,
    p_tag: tag || undefined,
    p_search: search || undefined,
    p_limit: limit,
    p_cursor_created_at: decodedCursor?.createdAt || undefined,
    p_cursor_id: decodedCursor?.id || undefined,
    p_cursor_score: decodedCursor?.score !== undefined ? decodedCursor.score : undefined,
    p_cursor_votes: decodedCursor?.votes !== undefined ? decodedCursor.votes : undefined,
  } as any);

  if (error || !data) {
    console.error('Failed to fetch feed ideas:', error);
    return {
      ideas: [],
      nextCursor: null,
      currentUserId: user?.id || null,
    };
  }

  const rawIdeas = data as unknown as FeedIdeaItem[];

  // Determine user votes for the batch in one query
  const userVotesMap = new Map<string, string>();
  if (user && rawIdeas.length > 0) {
    const ideaIds = rawIdeas.map((i) => i.id);
    const { data: votes } = await supabase
      .from('votes')
      .select('idea_id, created_at')
      .eq('voter_id', user.id)
      .eq('status', 'active')
      .in('idea_id', ideaIds);

    votes?.forEach((v) => {
      userVotesMap.set(v.idea_id, v.created_at);
    });
  }

  const ideas: FeedIdeaItem[] = rawIdeas.map((idea) => ({
    ...idea,
    hasVoted: userVotesMap.has(idea.id),
    voteCreatedAt: userVotesMap.get(idea.id),
  }));

  let nextCursor: string | null = null;
  if (ideas.length === limit) {
    const lastIdea = ideas[ideas.length - 1];
    if (lastIdea) {
      nextCursor = encodeFeedCursor({
        createdAt: lastIdea.created_at,
        id: lastIdea.id,
        score: lastIdea.trending_score,
        votes: lastIdea.verified_vote_count,
      });
    }
  }

  return {
    ideas,
    nextCursor,
    currentUserId: user?.id || null,
  };
}
