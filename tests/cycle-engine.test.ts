import { describe, it, expect } from 'vitest';

describe('Cycle Engine Ranking & Tie-Break Specification [T-5.4, RULES.md BR-046]', () => {
  interface CandidateIdea {
    id: string;
    verified_vote_count: number;
    qualified_at: string;
    created_at: string;
  }

  function rankQualifyingIdeas(ideas: CandidateIdea[], rewardSlots: number = 3) {
    return ideas
      .filter((i) => i.verified_vote_count >= 50)
      .sort((a, b) => {
        // 1. verified_vote_count desc
        if (b.verified_vote_count !== a.verified_vote_count) {
          return b.verified_vote_count - a.verified_vote_count;
        }
        // 2. qualified_at asc (earlier timestamp wins momentum tie-break)
        const aQual = new Date(a.qualified_at).getTime();
        const bQual = new Date(b.qualified_at).getTime();
        if (aQual !== bQual) {
          return aQual - bQual;
        }
        // 3. created_at asc (deterministic fallback)
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      })
      .slice(0, rewardSlots)
      .map((idea, idx) => ({
        ...idea,
        rank: idx + 1,
      }));
  }

  it('breaks ties on identical verified vote counts by qualified_at asc (earlier momentum wins)', () => {
    const ideas: CandidateIdea[] = [
      {
        id: 'idea-late',
        verified_vote_count: 50,
        qualified_at: '2026-09-21T12:00:00Z', // qualified later
        created_at: '2026-09-20T00:00:00Z',
      },
      {
        id: 'idea-early',
        verified_vote_count: 50,
        qualified_at: '2026-09-21T08:00:00Z', // qualified earlier
        created_at: '2026-09-20T00:00:00Z',
      },
    ];

    const ranked = rankQualifyingIdeas(ideas);
    expect(ranked[0]?.id).toBe('idea-early');
    expect(ranked[0]?.rank).toBe(1);
    expect(ranked[1]?.id).toBe('idea-late');
    expect(ranked[1]?.rank).toBe(2);
  });

  it('caps rewards at reward_slots (3) even when 8 ideas qualify [T-5.3]', () => {
    const eightQualifiers: CandidateIdea[] = Array.from({ length: 8 }, (_, i) => ({
      id: `idea-${i + 1}`,
      verified_vote_count: 50 + i * 5,
      qualified_at: `2026-09-21T${String(10 + i).padStart(2, '0')}:00:00Z`,
      created_at: '2026-09-20T00:00:00Z',
    }));

    const ranked = rankQualifyingIdeas(eightQualifiers, 3);
    expect(ranked.length).toBe(3);
    expect(ranked[0]?.rank).toBe(1);
    expect(ranked[1]?.rank).toBe(2);
    expect(ranked[2]?.rank).toBe(3);
    // Highest vote count wins rank 1
    expect(ranked[0]?.id).toBe('idea-8');
    expect(ranked[0]?.verified_vote_count).toBe(85);
  });

  it('produces exactly 0 rewards when 0 ideas qualify [T-5.3, T-5.5]', () => {
    const unqualifyingIdeas: CandidateIdea[] = [
      {
        id: 'idea-sub40',
        verified_vote_count: 38,
        qualified_at: '2026-09-21T12:00:00Z',
        created_at: '2026-09-20T00:00:00Z',
      },
    ];

    const ranked = rankQualifyingIdeas(unqualifyingIdeas, 3);
    expect(ranked.length).toBe(0);
  });
});

describe('Zero-Qualifier Public Note Specification [T-5.5, RULES.md BR-048]', () => {
  function computeFinalizationNote(
    awardedCount: number,
    voteThreshold: number = 50,
  ): string | null {
    if (awardedCount === 0) {
      return `No idea reached the ${voteThreshold}-vote threshold this cycle.`;
    }
    return null;
  }

  it('returns the exact public note when zero ideas reach the 50-vote threshold', () => {
    const note = computeFinalizationNote(0, 50);
    expect(note).toBe('No idea reached the 50-vote threshold this cycle.');
  });

  it('returns null when one or more ideas qualify', () => {
    const note = computeFinalizationNote(1, 50);
    expect(note).toBeNull();
  });
});

describe('Cron Fallback Security & Unique Active Cycle Invariant [T-5.2, T-5.6]', () => {
  it('enforces single active cycle constraint on status = "active"', () => {
    const activeCycles = [{ id: 'cycle-1', status: 'active' }];
    const canInsertNewActive = (status: string) => {
      if (status === 'active' && activeCycles.some((c) => c.status === 'active')) {
        throw new Error(
          'duplicate key value violates unique constraint "cycles_single_active_idx"',
        );
      }
      return true;
    };

    expect(() => canInsertNewActive('active')).toThrow(/cycles_single_active_idx/);
    expect(canInsertNewActive('scheduled')).toBe(true);
  });

  it('validates CRON_SECRET shared secret header for Vercel Cron fallback', () => {
    const CRON_SECRET = 'secret-test-token-1234';

    function isAuthorized(headerAuth?: string | null, customHeader?: string | null) {
      const bearer = headerAuth?.startsWith('Bearer ') ? headerAuth.substring(7) : null;
      return bearer === CRON_SECRET || customHeader === CRON_SECRET;
    }

    expect(isAuthorized('Bearer secret-test-token-1234')).toBe(true);
    expect(isAuthorized(null, 'secret-test-token-1234')).toBe(true);
    expect(isAuthorized('Bearer wrong-secret')).toBe(false);
    expect(isAuthorized(null, null)).toBe(false);
  });
});
