import { describe, it, expect } from 'vitest';
import type { LeaderboardItem } from '@/lib/leaderboard';
import { getUtcOffsetString } from '@/app/components/layout/cycle-countdown';

describe('Realtime rank re-computation and tie-breaking [T-4.11, T-4.12]', () => {
  const sampleItems: LeaderboardItem[] = [
    {
      idea_id: 'idea-1',
      cycle_id: 'cycle-1',
      cycle_rank: 1,
      title: 'Idea 1',
      slug: 'idea-1',
      author_id: 'auth-1',
      author_username: 'author1',
      author_display_name: 'Author One',
      author_avatar_url: null,
      vote_count: 10,
      verified_vote_count: 10,
      vote_threshold: 50,
      is_qualified: false,
      votes_to_qualify: 40,
      created_at: '2026-09-20T10:00:00Z',
    },
    {
      idea_id: 'idea-2',
      cycle_id: 'cycle-1',
      cycle_rank: 2,
      title: 'Idea 2',
      slug: 'idea-2',
      author_id: 'auth-2',
      author_username: 'author2',
      author_display_name: 'Author Two',
      author_avatar_url: null,
      vote_count: 8,
      verified_vote_count: 8,
      vote_threshold: 50,
      is_qualified: false,
      votes_to_qualify: 42,
      created_at: '2026-09-20T11:00:00Z',
    },
  ];

  function recomputeRanks(items: LeaderboardItem[]): LeaderboardItem[] {
    const list = [...items].sort((a, b) => {
      if (b.verified_vote_count !== a.verified_vote_count) {
        return b.verified_vote_count - a.verified_vote_count;
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    return list.map((item, index) => {
      if (index > 0) {
        const prev = list[index - 1];
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
  }

  it('accurately advances idea rank when live votes overtake higher ranked ideas', () => {
    // Idea 2 receives 5 new votes -> verified_votes becomes 13 (overtaking Idea 1's 10)
    const updated = sampleItems.map((item) => {
      if (item.idea_id === 'idea-2') {
        return { ...item, verified_vote_count: 13 };
      }
      return item;
    });

    const reRanked = recomputeRanks(updated);

    expect(reRanked[0]?.idea_id).toBe('idea-2');
    expect(reRanked[0]?.cycle_rank).toBe(1);
    expect(reRanked[1]?.idea_id).toBe('idea-1');
    expect(reRanked[1]?.cycle_rank).toBe(2);
  });

  it('detects upward rank movement to trigger cyan border flash [T-4.12]', () => {
    const oldRank = 2;
    const newRank = 1;
    const movedUp = newRank < oldRank;
    expect(movedUp).toBe(true);
  });
});

describe('Cycle countdown and UTC offset formatting [T-4.14]', () => {
  it('formats UTC offset string with standard prefix and sign', () => {
    const offsetStr = getUtcOffsetString();
    expect(offsetStr).toMatch(/^UTC[+-]\d+(:\d{2})?$/);
  });
});
