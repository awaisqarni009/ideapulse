import type { Database } from '@/lib/database.types';

export type FeedSortOption = 'trending' | 'newest' | 'top';

export interface FeedIdeaItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string[];
  status: Database['public']['Enums']['idea_status'];
  vote_count: number;
  verified_vote_count: number;
  created_at: string;
  author_id: string;
  author_username: string;
  author_display_name: string;
  author_avatar_url: string;
  cycle_id: string;
  cycle_number: number;
  vote_threshold: number;
  trending_score: number;
  hasVoted?: boolean;
  voteCreatedAt?: string;
}

export interface FeedCursorData {
  createdAt?: string;
  id?: string;
  score?: number;
  votes?: number;
}

export interface GetFeedParams {
  sort?: FeedSortOption;
  category?: string | null;
  tag?: string | null;
  cursor?: string | null;
  limit?: number;
}

export interface FeedResult {
  ideas: FeedIdeaItem[];
  nextCursor: string | null;
  currentUserId: string | null;
}

export function encodeFeedCursor(data: FeedCursorData): string {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}

export function decodeFeedCursor(cursorStr?: string | null): FeedCursorData | null {
  if (!cursorStr) return null;
  try {
    const json = Buffer.from(cursorStr, 'base64url').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}
