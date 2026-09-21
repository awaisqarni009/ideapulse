import { describe, it, expect } from 'vitest';
import { parseVoteError, formatQuotaDuration } from '@/lib/votes/errors';

describe('Vote Error Mapper [T-3.10, RULES.md §7]', () => {
  it('maps IP_UNAUTHENTICATED and 42501 to unauthenticated error', () => {
    const res1 = parseVoteError({ message: 'IP_UNAUTHENTICATED: Authentication required' });
    expect(res1.code).toBe('IP_UNAUTHENTICATED');
    expect(res1.message).toBe('Sign in to vote.');

    const res2 = parseVoteError({ code: '42501', message: 'permission denied for table votes' });
    expect(res2.code).toBe('IP_UNAUTHENTICATED');
    expect(res2.message).toBe('Sign in to vote.');
  });

  it('maps IP_ACCOUNT_NOT_WRITABLE to unconfirmed account error', () => {
    const res = parseVoteError({
      message: 'IP_ACCOUNT_NOT_WRITABLE: Account unconfirmed or suspended',
    });
    expect(res.code).toBe('IP_ACCOUNT_NOT_WRITABLE');
    expect(res.message).toBe('Confirm your email to start voting. Resend the link →');
    expect(res.reason).toBe('unconfirmed');
  });

  it('maps IP_SELF_VOTE and check constraint to self-vote error (BR-011)', () => {
    const res1 = parseVoteError({ message: 'IP_SELF_VOTE: Author cannot vote on own idea' });
    expect(res1.code).toBe('IP_SELF_VOTE');
    expect(res1.message).toBe("You can't vote on your own idea.");

    const res2 = parseVoteError({
      message: 'new row violates check constraint "CHECK (voter_id <> idea_author_id)"',
    });
    expect(res2.code).toBe('IP_SELF_VOTE');
    expect(res2.message).toBe("You can't vote on your own idea.");
  });

  it('maps IP_DUPLICATE_VOTE and unique constraint to duplicate vote error (BR-012)', () => {
    const res1 = parseVoteError({ message: 'IP_DUPLICATE_VOTE: Voter already has an active vote' });
    expect(res1.code).toBe('IP_DUPLICATE_VOTE');
    expect(res1.message).toBe("You've already voted on this idea.");

    const res2 = parseVoteError({
      message: 'duplicate key value violates unique constraint "UNIQUE (idea_id, voter_id)"',
    });
    expect(res2.code).toBe('IP_DUPLICATE_VOTE');
    expect(res2.message).toBe("You've already voted on this idea.");
  });

  it('maps IP_VOTE_QUOTA timestamp to dynamic duration message (BR-013)', () => {
    // 3 hours into future
    const futureTime = new Date(Date.now() + 3 * 3600 * 1000 + 15 * 60 * 1000).toISOString();
    const res = parseVoteError({ message: `IP_VOTE_QUOTA:${futureTime}` });

    expect(res.code).toBe('IP_VOTE_QUOTA');
    expect(res.nextSlotAt).toBe(futureTime);
    expect(res.remainingDuration).toContain('3h');
    expect(res.message).toContain("You've used all 5 votes. Your next vote unlocks in");
  });

  it('maps IP_IDEA_CLOSED, IP_IDEA_NOT_FOUND, and IP_NO_ACTIVE_CYCLE', () => {
    const closed = parseVoteError({ message: 'IP_IDEA_CLOSED: Idea is not published' });
    expect(closed.code).toBe('IP_IDEA_CLOSED');
    expect(closed.message).toBe('Voting is closed on this idea.');

    const notFound = parseVoteError({ message: 'IP_IDEA_NOT_FOUND: Idea row not found' });
    expect(notFound.code).toBe('IP_IDEA_NOT_FOUND');
    expect(notFound.message).toBe("That idea doesn't exist.");

    const noCycle = parseVoteError({ message: 'IP_NO_ACTIVE_CYCLE: No active cycle' });
    expect(noCycle.code).toBe('IP_NO_ACTIVE_CYCLE');
    expect(noCycle.message).toBe('Voting is closed between cycles.');
  });

  it('maps rate limit errors', () => {
    const rateLimit = parseVoteError({ message: 'Rate limit exceeded for voter' });
    expect(rateLimit.code).toBe('IP_RATE_LIMITED');
    expect(rateLimit.message).toBe('Too many votes in a short window. Please wait a moment.');
  });

  it('provides safe fallback for unexpected errors', () => {
    const unknown = parseVoteError({ message: 'Internal server connection timeout' });
    expect(unknown.code).toBe('UNKNOWN');
    expect(unknown.message).toBe('Internal server connection timeout');
  });
});

describe('formatQuotaDuration', () => {
  it('formats hours and minutes accurately', () => {
    const in2Hours = new Date(Date.now() + 2 * 3600 * 1000 + 30 * 60 * 1000).toISOString();
    expect(formatQuotaDuration(in2Hours)).toMatch(/^2h (29|30)m$/);
  });

  it('formats minutes only when under 1 hour', () => {
    const in45Mins = new Date(Date.now() + 45 * 60 * 1000).toISOString();
    expect(formatQuotaDuration(in45Mins)).toMatch(/^(44|45)m$/);
  });

  it('handles past or invalid dates gracefully', () => {
    const past = new Date(Date.now() - 5000).toISOString();
    expect(formatQuotaDuration(past)).toBe('shortly');
    expect(formatQuotaDuration(undefined)).toBe('in 24 hours');
    expect(formatQuotaDuration('invalid-date')).toBe('in 24 hours');
  });
});
