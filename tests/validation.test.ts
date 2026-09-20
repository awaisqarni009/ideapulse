import { describe, it, expect } from 'vitest';
import { ideaSubmissionSchema, profileUpdateSchema } from '../lib/validation';
import { CATEGORIES, IDEA_LIMITS } from '../lib/constants';
import { getIpErrorMessage } from '../lib/errors';

describe('Constants & Validation Schemas [T-0.15, T-0.16, T-0.17]', () => {
  it('validates compliant idea submission', () => {
    const validIdea = {
      title: 'Decentralized Data Sync',
      summary:
        'An offline-first conflict-resolution synchronization protocol for remote field researchers.',
      body: 'Here is a detailed explanation of the proposed system that satisfies the minimum length requirement easily with high fidelity descriptions of how offline syncing works.',
      category: 'developer-tools',
      tags: ['offline-first', 'sync', 'protocol'],
    };

    const result = ideaSubmissionSchema.safeParse(validIdea);
    expect(result.success).toBe(true);
  });

  it('rejects idea with title below minimum length', () => {
    const invalidIdea = {
      title: 'Short',
      summary:
        'An offline-first conflict-resolution synchronization protocol for remote field researchers.',
      body: 'Here is a detailed explanation of the proposed system that satisfies the minimum length requirement easily with high fidelity descriptions of how offline syncing works.',
      category: 'developer-tools',
      tags: [],
    };

    const result = ideaSubmissionSchema.safeParse(invalidIdea);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        `Title must be at least ${IDEA_LIMITS.TITLE_MIN}`,
      );
    }
  });

  it('rejects disallowed categories', () => {
    const invalidCategory = {
      title: 'Decentralized Data Sync',
      summary:
        'An offline-first conflict-resolution synchronization protocol for remote field researchers.',
      body: 'Here is a detailed explanation of the proposed system that satisfies the minimum length requirement easily with high fidelity descriptions of how offline syncing works.',
      category: 'unsupported-category',
      tags: [],
    };

    const result = ideaSubmissionSchema.safeParse(invalidCategory);
    expect(result.success).toBe(false);
  });

  it('rejects more than 5 tags', () => {
    const tooManyTags = {
      title: 'Decentralized Data Sync',
      summary:
        'An offline-first conflict-resolution synchronization protocol for remote field researchers.',
      body: 'Here is a detailed explanation of the proposed system that satisfies the minimum length requirement easily with high fidelity descriptions of how offline syncing works.',
      category: 'ai',
      tags: ['one', 'two', 'three', 'four', 'five', 'six'],
    };

    const result = ideaSubmissionSchema.safeParse(tooManyTags);
    expect(result.success).toBe(false);
  });

  it('formats IP error messages correctly according to RULES.md §7', () => {
    expect(getIpErrorMessage('IP_UNAUTHENTICATED')).toBe('Sign in to vote.');
    expect(getIpErrorMessage('IP_SELF_VOTE')).toBe("You can't vote on your own idea.");
    expect(getIpErrorMessage('IP_VOTE_QUOTA', { duration: '3h 41m' })).toBe(
      "You've used all 5 votes. Your next vote unlocks in 3h 41m.",
    );
  });
});
