import { describe, it, expect } from 'vitest';
import {
  ideaSubmissionSchema,
  profileUpdateSchema,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../lib/validation';
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

  describe('Auth validation [T-2.5, T-2.6]', () => {
    it('accepts valid registration input', () => {
      const valid = {
        fullName: 'Sarah Connor',
        username: 'sarah_connor',
        countryCode: '+92',
        phone: '03001234567',
        email: 'User@Example.Com',
        password: 'ValidPass123!',
      };
      const parsed = registerSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.email).toBe('user@example.com');
        expect(parsed.data.fullName).toBe('Sarah Connor');
        expect(parsed.data.username).toBe('sarah_connor');
        expect(parsed.data.phone).toBe('03001234567');
      }
    });

    it('rejects password under 10 characters (AC-01.4)', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'Short9!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('at least 10 characters');
      }
    });

    it('rejects password missing a digit (AC-01.4)', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'NoDigitsHere!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('at least one digit');
      }
    });

    it('rejects password missing a sign or symbol', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'Password1234',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('sign or symbol');
      }
    });

    it('rejects phone number that is not exactly 11 digits', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'ValidPass123!',
        phone: '12345',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('exactly 11 digits');
      }
    });

    it('rejects full name with numbers or signs', () => {
      const withNumbers = registerSchema.safeParse({
        fullName: 'Sarah123',
        email: 'test@example.com',
        password: 'ValidPass123!',
      });
      expect(withNumbers.success).toBe(false);
      if (!withNumbers.success) {
        expect(withNumbers.error.issues[0]?.message).toContain('alphabet letters and spaces');
      }

      const withSigns = registerSchema.safeParse({
        fullName: 'Sarah @ Connor!',
        email: 'test@example.com',
        password: 'ValidPass123!',
      });
      expect(withSigns.success).toBe(false);
      if (!withSigns.success) {
        expect(withSigns.error.issues[0]?.message).toContain('alphabet letters and spaces');
      }
    });

    it('validates login input', () => {
      const valid = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(valid.success).toBe(true);

      const invalid = loginSchema.safeParse({
        email: 'not-an-email',
        password: '',
      });
      expect(invalid.success).toBe(false);
    });

    it('validates password reset schemas [T-2.9]', () => {
      expect(forgotPasswordSchema.safeParse({ email: 'user@test.com' }).success).toBe(true);
      expect(forgotPasswordSchema.safeParse({ email: 'bad' }).success).toBe(false);

      const validReset = resetPasswordSchema.safeParse({
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      });
      expect(validReset.success).toBe(true);

      const mismatch = resetPasswordSchema.safeParse({
        password: 'NewPassword123',
        confirmPassword: 'DifferentPassword123',
      });
      expect(mismatch.success).toBe(false);
      if (!mismatch.success) {
        expect(mismatch.error.issues[0]?.message).toContain('Passwords do not match');
      }
    });
  });
});
