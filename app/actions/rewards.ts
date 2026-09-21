'use server';

import { createClient } from '@/lib/supabase/server';

export interface WinnerRewardItem {
  id: string;
  rank: number;
  title: string;
  verified_votes: number;
  cycle_number: number;
  idea_title: string;
  idea_slug: string;
}

/**
 * getWinnerRewardsAction Server Action [T-5.9, T-5.11]
 * Fetches recent rewards awarded to the currently logged in user.
 */
export async function getWinnerRewardsAction(): Promise<WinnerRewardItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: rewards, error } = await supabase
    .from('rewards')
    .select(
      `
      id,
      rank,
      title,
      verified_votes,
      cycles (
        cycle_number
      ),
      ideas (
        title,
        slug
      )
    `,
    )
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error || !rewards) return [];

  return rewards.map((r) => {
    const cycle = Array.isArray(r.cycles) ? r.cycles[0] : r.cycles;
    const idea = Array.isArray(r.ideas) ? r.ideas[0] : r.ideas;
    return {
      id: r.id,
      rank: r.rank,
      title: r.title,
      verified_votes: r.verified_votes,
      cycle_number: cycle?.cycle_number || 1,
      idea_title: idea?.title || r.title,
      idea_slug: idea?.slug || '',
    };
  });
}
