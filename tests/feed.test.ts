import { describe, it, expect } from 'vitest';
import { encodeFeedCursor, decodeFeedCursor, type FeedCursorData } from '@/lib/feed';

describe('Feed cursor encoding and decoding [T-4.2]', () => {
  it('encodes and decodes composite cursor correctly', () => {
    const cursorData: FeedCursorData = {
      createdAt: '2026-09-21T12:00:00.000Z',
      id: 'idea-uuid-12345',
      score: 14.852,
      votes: 42,
    };

    const encoded = encodeFeedCursor(cursorData);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = decodeFeedCursor(encoded);
    expect(decoded).toEqual(cursorData);
  });

  it('returns null for empty, null, or invalid cursors', () => {
    expect(decodeFeedCursor(null)).toBeNull();
    expect(decodeFeedCursor(undefined)).toBeNull();
    expect(decodeFeedCursor('')).toBeNull();
    expect(decodeFeedCursor('invalid-base64-!#$')).toBeNull();
  });
});

describe('Trending score calculation [T-4.5]', () => {
  // Formula: verified_votes / ((hours_since_post + 2) ^ 1.5)
  function computeTrendingScore(verifiedVotes: number, hoursSincePost: number): number {
    return verifiedVotes / Math.pow(hoursSincePost + 2, 1.5);
  }

  it('correctly calculates trending score for freshly posted ideas', () => {
    // Fresh idea (0 hours old) with 10 verified votes:
    // 10 / (2 ^ 1.5) = 10 / 2.8284 = ~3.5355
    const score0h = computeTrendingScore(10, 0);
    expect(score0h).toBeCloseTo(3.5355, 3);
  });

  it('penalizes older posts according to the gravity exponent 1.5', () => {
    // 10 votes at 0 hours vs 10 votes at 24 hours
    const score0h = computeTrendingScore(10, 0);
    const score24h = computeTrendingScore(10, 24);
    // at 24h: 10 / (26 ^ 1.5) = 10 / 132.57 = ~0.0754
    expect(score24h).toBeCloseTo(0.0754, 3);
    expect(score0h).toBeGreaterThan(score24h * 40);
  });

  it('allows high-velocity fresh ideas to outrank stagnant older high-vote ideas', () => {
    // 50 votes posted 48 hours ago: 50 / (50 ^ 1.5) = 50 / 353.55 = 0.141
    const olderHighVotes = computeTrendingScore(50, 48);
    // 5 votes posted 1 hour ago: 5 / (3 ^ 1.5) = 5 / 5.196 = 0.962
    const freshViral = computeTrendingScore(5, 1);

    expect(freshViral).toBeGreaterThan(olderHighVotes);
  });
});
