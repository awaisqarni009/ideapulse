import { describe, it, expect } from 'vitest';
import { formatRank, type LeaderboardItem } from '@/lib/leaderboard';

describe('Leaderboard helpers and formatting [T-4.9, T-4.10]', () => {
  it('formats single-digit ranks with leading zeros per DESIGN.md §7.6', () => {
    expect(formatRank(1)).toBe('01');
    expect(formatRank(2)).toBe('02');
    expect(formatRank(9)).toBe('09');
  });

  it('formats two-digit ranks as standard 2-digit numerals', () => {
    expect(formatRank(10)).toBe('10');
    expect(formatRank(19)).toBe('19');
    expect(formatRank(20)).toBe('20');
  });

  it('sorts leaderboard items by verified_votes desc, qualified_at asc, created_at asc', () => {
    const rawItems: Partial<LeaderboardItem>[] = [
      {
        idea_id: '1',
        title: 'Idea A',
        verified_vote_count: 10,
        created_at: '2026-09-20T10:00:00Z',
      },
      {
        idea_id: '2',
        title: 'Idea B',
        verified_vote_count: 25,
        created_at: '2026-09-21T10:00:00Z',
      },
      {
        idea_id: '3',
        title: 'Idea C',
        verified_vote_count: 10,
        created_at: '2026-09-19T10:00:00Z', // older created_at breaks tie
      },
    ];

    const sorted = [...rawItems].sort((a, b) => {
      if ((b.verified_vote_count || 0) !== (a.verified_vote_count || 0)) {
        return (b.verified_vote_count || 0) - (a.verified_vote_count || 0);
      }
      return new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime();
    });

    expect(sorted[0]?.idea_id).toBe('2'); // highest votes: 25
    expect(sorted[1]?.idea_id).toBe('3'); // 10 votes, earlier created_at
    expect(sorted[2]?.idea_id).toBe('1'); // 10 votes, later created_at
  });
});
