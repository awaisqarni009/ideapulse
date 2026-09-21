export interface LeaderboardItem {
  idea_id: string;
  cycle_id: string;
  cycle_rank: number;
  title: string;
  slug: string;
  author_id: string;
  author_username: string;
  author_display_name: string;
  author_avatar_url: string | null;
  vote_count: number;
  verified_vote_count: number;
  vote_threshold: number;
  is_qualified: boolean;
  votes_to_qualify: number;
  created_at: string;
}

/**
 * Format rank as 2-digit numeral (e.g. 1 -> "01", 12 -> "12") per DESIGN.md §7.6
 */
export function formatRank(rank: number): string {
  return rank.toString().padStart(2, '0');
}
