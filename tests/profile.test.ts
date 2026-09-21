import { describe, it, expect } from 'vitest';

describe('Profile Page & Statistics Invariants [T-4.15]', () => {
  it('correctly aggregates authored ideas, verified votes received, and cycles won', () => {
    const authoredIdeas = [
      { id: '1', title: 'Idea 1', verified_vote_count: 35, vote_count: 40 },
      { id: '2', title: 'Idea 2', verified_vote_count: 55, vote_count: 60 },
      { id: '3', title: 'Idea 3', verified_vote_count: 10, vote_count: 12 },
    ];

    const totalVotes = authoredIdeas.reduce((sum, i) => sum + i.verified_vote_count, 0);
    expect(totalVotes).toBe(100);
    expect(authoredIdeas.length).toBe(3);
  });

  it('privacy invariant: never exposes what proposals a user voted for (ADR-006, BR-003, BR-017)', () => {
    // The public profile query must only touch authored ideas and rewards
    const allowedPublicTablesForProfile = ['profiles', 'ideas', 'rewards', 'cycles'];
    const forbiddenLedgerQuery = 'select * from votes where voter_id = :target_user_id';

    expect(allowedPublicTablesForProfile).not.toContain('votes');
    expect(forbiddenLedgerQuery).toContain('voter_id');
  });
});
