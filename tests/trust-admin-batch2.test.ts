import { describe, it, expect } from 'vitest';

describe('Void-Vote Action & Recount Required State [T-6.7, T-6.9, BR-047, AC-09.4, AC-10.2]', () => {
  interface Vote {
    id: string;
    idea_id: string;
    cycle_id: string;
    status: 'active' | 'retracted' | 'voided';
    is_verified: boolean;
    void_reason?: string;
  }

  interface Idea {
    id: string;
    vote_count: number;
    verified_vote_count: number;
    qualified_at: string | null;
  }

  interface Cycle {
    id: string;
    status: 'active' | 'closing' | 'finalized' | 'recount_required';
    vote_threshold: number;
  }

  function simulateVoidVote(
    vote: Vote,
    idea: Idea,
    cycle: Cycle,
    reason: string,
  ): { cycleStatusChanged: boolean } {
    if (!reason || reason.trim().length < 5) {
      throw new Error('IP_REASON_REQUIRED');
    }

    vote.status = 'voided';
    vote.void_reason = reason;

    // Recalculate counters (simulating sync_vote_counters trigger)
    if (vote.is_verified) {
      idea.verified_vote_count -= 1;
    }
    idea.vote_count -= 1;

    if (idea.verified_vote_count < cycle.vote_threshold) {
      idea.qualified_at = null; // fell below bar
    }

    // BR-047: If cycle was finalized, flip to recount_required
    let cycleStatusChanged = false;
    if (cycle.status === 'finalized') {
      cycle.status = 'recount_required';
      cycleStatusChanged = true;
    }

    return { cycleStatusChanged };
  }

  it('voiding a vote in an active cycle updates counters without altering cycle status', () => {
    const cycle: Cycle = { id: 'c1', status: 'active', vote_threshold: 50 };
    const idea: Idea = {
      id: 'idea1',
      vote_count: 50,
      verified_vote_count: 50,
      qualified_at: '2026-09-20T12:00:00Z',
    };
    const vote: Vote = {
      id: 'v1',
      idea_id: 'idea1',
      cycle_id: 'c1',
      status: 'active',
      is_verified: true,
    };

    const res = simulateVoidVote(vote, idea, cycle, 'Detected invalid bot vote');

    expect(res.cycleStatusChanged).toBe(false);
    expect(cycle.status).toBe('active');
    expect(vote.status).toBe('voided');
    expect(idea.vote_count).toBe(49);
    expect(idea.verified_vote_count).toBe(49);
    expect(idea.qualified_at).toBeNull(); // reset because verified votes dropped below threshold 50
  });

  it('voiding a vote in a finalized cycle transitions cycle to recount_required [BR-047, AC-09.4]', () => {
    const cycle: Cycle = { id: 'c1', status: 'finalized', vote_threshold: 50 };
    const idea: Idea = {
      id: 'idea1',
      vote_count: 52,
      verified_vote_count: 51,
      qualified_at: '2026-09-18T10:00:00Z',
    };
    const vote: Vote = {
      id: 'v2',
      idea_id: 'idea1',
      cycle_id: 'c1',
      status: 'active',
      is_verified: true,
    };

    const res = simulateVoidVote(vote, idea, cycle, 'Post-cycle audit void');

    expect(res.cycleStatusChanged).toBe(true);
    expect(cycle.status).toBe('recount_required');
    expect(vote.status).toBe('voided');
  });

  it('admin recount restores recount_required cycle back to finalized [T-6.9]', () => {
    const cycle: Cycle = { id: 'c1', status: 'recount_required', vote_threshold: 50 };

    function adminRecount(c: Cycle, reason: string) {
      if (!reason || reason.trim().length < 5) throw new Error('IP_REASON_REQUIRED');
      c.status = 'finalized';
    }

    adminRecount(cycle, 'Recount completed, winner verified');
    expect(cycle.status).toBe('finalized');
  });
});

describe('Suspend-Account Action & Active Cycle De-verification [T-6.8, BR-004, AC-10.4]', () => {
  interface UserProfile {
    id: string;
    status: 'active' | 'suspended';
    suspended_until: string | null;
    suspension_reason: string | null;
  }

  interface VoteRecord {
    id: string;
    voter_id: string;
    cycle_id: string;
    is_verified: boolean;
  }

  it('suspending an account flips active-cycle votes to unverified and leaves finalized untouched [BR-004]', () => {
    const user: UserProfile = {
      id: 'bad-actor',
      status: 'active',
      suspended_until: null,
      suspension_reason: null,
    };

    const activeCycleId = 'cycle-active';
    const finalizedCycleId = 'cycle-finalized';

    const votes: VoteRecord[] = [
      { id: 'v1', voter_id: user.id, cycle_id: activeCycleId, is_verified: true },
      { id: 'v2', voter_id: user.id, cycle_id: activeCycleId, is_verified: true },
      { id: 'v3', voter_id: user.id, cycle_id: finalizedCycleId, is_verified: true },
    ];

    function suspendUser(
      targetUser: UserProfile,
      voteList: VoteRecord[],
      currentActiveCycle: string,
      reason: string,
    ) {
      if (!reason || reason.trim().length < 5) throw new Error('IP_REASON_REQUIRED');

      targetUser.status = 'suspended';
      targetUser.suspension_reason = reason;
      targetUser.suspended_until = new Date(Date.now() + 14 * 86400000).toISOString();

      let deverifiedCount = 0;
      for (const v of voteList) {
        if (v.voter_id === targetUser.id && v.cycle_id === currentActiveCycle && v.is_verified) {
          v.is_verified = false;
          deverifiedCount++;
        }
      }
      return deverifiedCount;
    }

    const count = suspendUser(user, votes, activeCycleId, 'Coordinated sybil voting pattern');

    expect(user.status).toBe('suspended');
    expect(count).toBe(2);
    expect(votes[0]!.is_verified).toBe(false);
    expect(votes[1]!.is_verified).toBe(false);
    expect(votes[2]!.is_verified).toBe(true); // Finalized cycle vote remains verified!
  });
});

describe('Ring Detection & Cluster Signals [T-6.10, T-6.11, BR-034]', () => {
  function computeJaccard(setA: string[], setB: string[]): number {
    const sA = new Set(setA);
    const sB = new Set(setB);
    const intersection = new Set([...sA].filter((x) => sB.has(x)));
    const union = new Set([...sA, ...sB]);
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  function evaluateClusterPriority(
    signals: { weight: 'high' | 'medium' }[],
  ): 'priority_review' | 'standard' {
    const highCount = signals.filter((s) => s.weight === 'high').length;
    const medCount = signals.filter((s) => s.weight === 'medium').length;

    // Rule: 2 High, or 1 High + 2 Medium -> priority_review
    if (highCount >= 2 || (highCount >= 1 && medCount >= 2)) {
      return 'priority_review';
    }
    return 'standard';
  }

  it('correctly calculates Jaccard overlap between account vote sets', () => {
    const voter1 = ['idea-1', 'idea-2', 'idea-3', 'idea-4', 'idea-5'];
    const voter2 = ['idea-1', 'idea-2', 'idea-3', 'idea-4', 'idea-6'];

    // Intersection: 4 ideas. Union: 6 ideas. Jaccard = 4/6 = 0.667
    const jaccard = computeJaccard(voter1, voter2);
    expect(Math.round(jaccard * 1000) / 1000).toBe(0.667);
  });

  it('promotes cluster to priority_review when 2 High signals trigger [BR-034]', () => {
    const signals: { signal: string; weight: 'high' | 'medium' }[] = [
      { signal: 'high_jaccard_overlap', weight: 'high' },
      { signal: 'vote_timing_proximity', weight: 'high' },
    ];

    expect(evaluateClusterPriority(signals)).toBe('priority_review');
  });

  it('keeps cluster as standard when only 1 High signal triggers', () => {
    const signals: { signal: string; weight: 'high' | 'medium' }[] = [
      { signal: 'high_jaccard_overlap', weight: 'high' },
      { signal: 'registration_timing', weight: 'medium' },
    ];

    expect(evaluateClusterPriority(signals)).toBe('standard');
  });

  it('promotes cluster to priority_review when 1 High + 2 Medium signals trigger [BR-034]', () => {
    const signals: { signal: string; weight: 'high' | 'medium' }[] = [
      { signal: 'high_jaccard_overlap', weight: 'high' },
      { signal: 'registration_timing', weight: 'medium' },
      { signal: 'shared_ip_hash', weight: 'medium' },
    ];

    expect(evaluateClusterPriority(signals)).toBe('priority_review');
  });
});
